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
});
