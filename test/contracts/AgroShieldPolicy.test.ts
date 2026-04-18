import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { deployContracts, getTestUsers, setupUsersWithTokens, DEFAULT_POLICY_PARAMS } from "./helpers";

describe("AgroShieldPolicy", function () {
  let contracts: any;
  let users: any;

  beforeEach(async function () {
    contracts = await deployContracts();
    users = await getTestUsers();
    await setupUsersWithTokens(users, contracts);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await contracts.agroShieldPolicy.owner()).to.equal(users.owner.address);
    });

    it("Should set the correct cUSD token address", async function () {
      expect(await contracts.agroShieldPolicy.cUSDToken()).to.equal(contracts.cUSDToken.address);
    });

    it("Should set the correct oracle address", async function () {
      expect(await contracts.agroShieldPolicy.oracleAddress()).to.equal(contracts.agroShieldOracle.address);
    });

    it("Should set the correct pool address", async function () {
      expect(await contracts.agroShieldPolicy.poolAddress()).to.equal(contracts.agroShieldPool.address);
    });

    it("Should initialize with zero policies", async function () {
      expect(await contracts.agroShieldPolicy.policiesCount()).to.equal(0);
    });

    it("Should initialize with zero active policies", async function () {
      expect(await contracts.agroShieldPolicy.activePoliciesCount()).to.equal(0);
    });
  });

  describe("Policy Creation", function () {
    it("Should allow farmers to create policies", async function () {
      await expect(contracts.agroShieldPolicy.connect(users.farmer1).createPolicy(
        DEFAULT_POLICY_PARAMS.coverageAmount,
        DEFAULT_POLICY_PARAMS.rainfallThreshold,
        DEFAULT_POLICY_PARAMS.measurementPeriod,
        DEFAULT_POLICY_PARAMS.location,
        DEFAULT_POLICY_PARAMS.description
      ))
        .to.emit(contracts.agroShieldPolicy, "PolicyCreated")
        .withArgs(1, users.farmer1.address);
      
      expect(await contracts.agroShieldPolicy.policiesCount()).to.equal(1);
      expect(await contracts.agroShieldPolicy.activePoliciesCount()).to.equal(1);
    });

    it("Should reject zero coverage amount", async function () {
      await expect(contracts.agroShieldPolicy.connect(users.farmer1).createPolicy(
        0,
        DEFAULT_POLICY_PARAMS.rainfallThreshold,
        DEFAULT_POLICY_PARAMS.measurementPeriod,
        DEFAULT_POLICY_PARAMS.location,
        DEFAULT_POLICY_PARAMS.description
      ))
        .to.be.revertedWith("Coverage amount must be greater than 0");
    });

    it("Should reject zero rainfall threshold", async function () {
      await expect(contracts.agroShieldPolicy.connect(users.farmer1).createPolicy(
        DEFAULT_POLICY_PARAMS.coverageAmount,
        "0",
        DEFAULT_POLICY_PARAMS.measurementPeriod,
        DEFAULT_POLICY_PARAMS.location,
        DEFAULT_POLICY_PARAMS.description
      ))
        .to.be.revertedWith("Rainfall threshold must be greater than 0");
    });

    it("Should reject zero measurement period", async function () {
      await expect(contracts.agroShieldPolicy.connect(users.farmer1).createPolicy(
        DEFAULT_POLICY_PARAMS.coverageAmount,
        DEFAULT_POLICY_PARAMS.rainfallThreshold,
        "0",
        DEFAULT_POLICY_PARAMS.location,
        DEFAULT_POLICY_PARAMS.description
      ))
        .to.be.revertedWith("Measurement period must be greater than 0");
    });

    it("Should reject empty location", async function () {
      await expect(contracts.agroShieldPolicy.connect(users.farmer1).createPolicy(
        DEFAULT_POLICY_PARAMS.coverageAmount,
        DEFAULT_POLICY_PARAMS.rainfallThreshold,
        DEFAULT_POLICY_PARAMS.measurementPeriod,
        "",
        DEFAULT_POLICY_PARAMS.description
      ))
        .to.be.revertedWith("Location cannot be empty");
    });

    it("Should reject empty description", async function () {
      await expect(contracts.agroShieldPolicy.connect(users.farmer1).createPolicy(
        DEFAULT_POLICY_PARAMS.coverageAmount,
        DEFAULT_POLICY_PARAMS.rainfallThreshold,
        DEFAULT_POLICY_PARAMS.measurementPeriod,
        DEFAULT_POLICY_PARAMS.location,
        ""
      ))
        .to.be.revertedWith("Description cannot be empty");
    });

    it("Should store policy details correctly", async function () {
      await contracts.agroShieldPolicy.connect(users.farmer1).createPolicy(
        DEFAULT_POLICY_PARAMS.coverageAmount,
        DEFAULT_POLICY_PARAMS.rainfallThreshold,
        DEFAULT_POLICY_PARAMS.measurementPeriod,
        DEFAULT_POLICY_PARAMS.location,
        DEFAULT_POLICY_PARAMS.description
      );
      
      const policy = await contracts.agroShieldPolicy.getPolicy(1);
      
      expect(policy.farmer).to.equal(users.farmer1.address);
      expect(policy.coverageAmount).to.equal(DEFAULT_POLICY_PARAMS.coverageAmount);
      expect(policy.rainfallThreshold).to.equal(DEFAULT_POLICY_PARAMS.rainfallThreshold);
      expect(policy.measurementPeriod).to.equal(DEFAULT_POLICY_PARAMS.measurementPeriod);
      expect(policy.location).to.equal(DEFAULT_POLICY_PARAMS.location);
      expect(policy.description).to.equal(DEFAULT_POLICY_PARAMS.description);
      expect(policy.isActive).to.be.true;
      expect(policy.isPaid).to.be.false;
    });

    it("Should increment policy ID correctly", async function () {
      // Create first policy
      await contracts.agroShieldPolicy.connect(users.farmer1).createPolicy(
        DEFAULT_POLICY_PARAMS.coverageAmount,
        DEFAULT_POLICY_PARAMS.rainfallThreshold,
        DEFAULT_POLICY_PARAMS.measurementPeriod,
        DEFAULT_POLICY_PARAMS.location,
        DEFAULT_POLICY_PARAMS.description
      );
      
      // Create second policy
      await contracts.agroShieldPolicy.connect(users.farmer2).createPolicy(
        DEFAULT_POLICY_PARAMS.coverageAmount,
        DEFAULT_POLICY_PARAMS.rainfallThreshold,
        DEFAULT_POLICY_PARAMS.measurementPeriod,
        DEFAULT_POLICY_PARAMS.location,
        "Second policy"
      );
      
      expect(await contracts.agroShieldPolicy.policiesCount()).to.equal(2);
      
      const policy1 = await contracts.agroShieldPolicy.getPolicy(1);
      const policy2 = await contracts.agroShieldPolicy.getPolicy(2);
      
      expect(policy1.farmer).to.equal(users.farmer1.address);
      expect(policy2.farmer).to.equal(users.farmer2.address);
    });

    it("Should fail when farmer has insufficient cUSD balance", async function () {
      const hugeAmount = ethers.utils.parseEther("1000000"); // More than minted
      
      await expect(contracts.agroShieldPolicy.connect(users.farmer1).createPolicy(
        hugeAmount,
        DEFAULT_POLICY_PARAMS.rainfallThreshold,
        DEFAULT_POLICY_PARAMS.measurementPeriod,
        DEFAULT_POLICY_PARAMS.location,
        DEFAULT_POLICY_PARAMS.description
      ))
        .to.be.reverted;
    });

    it("Should fail when farmer has not approved cUSD", async function () {
      // Revoke approval
      await contracts.cUSDToken.connect(users.farmer1).approve(contracts.agroShieldPolicy.address, 0);
      
      await expect(contracts.agroShieldPolicy.connect(users.farmer1).createPolicy(
        DEFAULT_POLICY_PARAMS.coverageAmount,
        DEFAULT_POLICY_PARAMS.rainfallThreshold,
        DEFAULT_POLICY_PARAMS.measurementPeriod,
        DEFAULT_POLICY_PARAMS.location,
        DEFAULT_POLICY_PARAMS.description
      ))
        .to.be.reverted;
    });
  });
});
