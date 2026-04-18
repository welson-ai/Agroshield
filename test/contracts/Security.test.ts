import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { deployContracts, getTestUsers, setupUsersWithTokens, DEFAULT_POLICY_PARAMS, DEFAULT_ORACLE_DATA } from "./helpers";

describe("Security Tests", function () {
  let contracts: any;
  let users: any;
  let attacker: any;

  beforeEach(async function () {
    contracts = await deployContracts();
    users = await getTestUsers();
    await setupUsersWithTokens(users, contracts);
    
    // Add an attacker account for security testing
    const signers = await ethers.getSigners();
    attacker = signers[6]; // Use 7th signer as attacker
  });

  describe("Access Control Security", function () {
    it("Should prevent unauthorized access to owner-only functions", async function () {
      // Try to call owner-only functions from non-owner account
      await expect(contracts.agroShieldPool.connect(attacker).transferOwnership(attacker.address))
        .to.be.reverted;
      
      await expect(contracts.agroShieldPolicy.connect(attacker).transferOwnership(attacker.address))
        .to.be.reverted;
      
      await expect(contracts.agroShieldOracle.connect(attacker).transferOwnership(attacker.address))
        .to.be.reverted;
    });

    it("Should prevent unauthorized oracle operations", async function () {
      // Attacker tries to submit weather data
      await expect(contracts.agroShieldOracle.connect(attacker).submitWeatherData(
        DEFAULT_ORACLE_DATA.location,
        DEFAULT_ORACLE_DATA.timestamp,
        DEFAULT_ORACLE_DATA.rainfall,
        DEFAULT_ORACLE_DATA.temperature,
        DEFAULT_ORACLE_DATA.humidity
      ))
        .to.be.revertedWith("Only authorized oracle can submit weather data");

      // Attacker tries to trigger payout
      await expect(contracts.agroShieldOracle.connect(attacker).triggerPolicyPayout(1))
        .to.be.revertedWith("Only authorized oracle can trigger payouts");
    });

    it("Should prevent unauthorized policy operations", async function () {
      // Create policy for farmer1
      await contracts.agroShieldPolicy.connect(users.farmer1).createPolicy(
        DEFAULT_POLICY_PARAMS.coverageAmount,
        DEFAULT_POLICY_PARAMS.rainfallThreshold,
        DEFAULT_POLICY_PARAMS.measurementPeriod,
        DEFAULT_POLICY_PARAMS.location,
        DEFAULT_POLICY_PARAMS.description
      );

      // Attacker tries to pay premium for farmer1's policy
      await expect(contracts.agroShieldPolicy.connect(attacker).payPremium(1, { value: ethers.utils.parseEther("100") }))
        .to.be.revertedWith("Not the policy owner");
    });

    it("Should prevent unauthorized pool operations", async function () {
      // Attacker tries to withdraw from investor1's account
      await expect(contracts.agroShieldPool.connect(attacker).withdraw(ethers.utils.parseEther("100")))
        .to.be.revertedWith("Insufficient liquidity");
    });
  });

  describe("Reentrancy Protection", function () {
    it("Should prevent reentrancy attacks on withdrawal", async function () {
      // Deploy malicious contract
      const MaliciousContract = await ethers.getContractFactory("MaliciousContract");
      const maliciousContract = await MaliciousContract.deploy(contracts.agroShieldPool.address);
      await maliciousContract.deployed();

      // Fund malicious contract
      await contracts.cUSDToken.mint(maliciousContract.address, ethers.utils.parseEther("1000"));
      await maliciousContract.connect(attacker).approvePool(ethers.utils.parseEther("1000"));
      
      // Deposit to pool
      await maliciousContract.connect(attacker).depositToPool(ethers.utils.parseEther("500"));
      
      // Attempt reentrancy attack
      await expect(maliciousContract.connect(attacker).attemptReentrancy())
        .to.be.reverted;
    });

    it("Should prevent reentrancy attacks on payout", async function () {
      // Deploy malicious policy contract
      const MaliciousPolicyContract = await ethers.getContractFactory("MaliciousPolicyContract");
      const maliciousPolicy = await MaliciousPolicyContract.deploy(
        contracts.agroShieldPolicy.address,
        contracts.agroShieldOracle.address
      );
      await maliciousPolicy.deployed();

      // Setup malicious policy
      await maliciousPolicy.connect(attacker).setupMaliciousPolicy();
      
      // Attempt reentrancy through payout
      await expect(maliciousPolicy.connect(attacker).attemptPayoutReentrancy())
        .to.be.reverted;
    });
  });

  describe("Integer Overflow/Underflow Protection", function () {
    it("Should handle large numbers safely", async function () {
      // Test with maximum uint256 values
      const maxUint256 = ethers.constants.MaxUint256;
      
      // Should handle large deposits safely
      await expect(contracts.agroShieldPool.connect(users.investor1).deposit(maxUint256))
        .to.be.reverted; // Should fail due to insufficient balance, not overflow
      
      // Test with large policy amounts
      await expect(contracts.agroShieldPolicy.connect(users.farmer1).createPolicy(
        maxUint256,
        DEFAULT_POLICY_PARAMS.rainfallThreshold,
        DEFAULT_POLICY_PARAMS.measurementPeriod,
        DEFAULT_POLICY_PARAMS.location,
        DEFAULT_POLICY_PARAMS.description
      ))
        .to.be.reverted; // Should fail due to insufficient balance, not overflow
    });

    it("Should prevent arithmetic underflow", async function () {
      // Deposit small amount
      await contracts.agroShieldPool.connect(users.investor1).deposit(ethers.utils.parseEther("100"));
      
      // Try to withdraw more than deposited
      await expect(contracts.agroShieldPool.connect(users.investor1).withdraw(ethers.utils.parseEther("200")))
        .to.be.revertedWith("Insufficient liquidity");
    });
  });

  describe("Front-Running Protection", function () {
    it("Should detect and prevent front-running attacks", async function () {
      // Create a policy
      await contracts.agroShieldPolicy.connect(users.farmer1).createPolicy(
        DEFAULT_POLICY_PARAMS.coverageAmount,
        DEFAULT_POLICY_PARAMS.rainfallThreshold,
        DEFAULT_POLICY_PARAMS.measurementPeriod,
        DEFAULT_POLICY_PARAMS.location,
        DEFAULT_POLICY_PARAMS.description
      );

      // Submit weather data
      await contracts.agroShieldOracle.connect(users.oracle).submitWeatherData(
        DEFAULT_ORACLE_DATA.location,
        DEFAULT_ORACLE_DATA.timestamp,
        DEFAULT_ORACLE_DATA.rainfall,
        DEFAULT_ORACLE_DATA.temperature,
        DEFAULT_ORACLE_DATA.humidity
      );

      // Attacker tries to front-run the payout
      const attackerTx = contracts.agroShieldOracle.connect(attacker).triggerPolicyPayout(1);
      
      // Should fail - only authorized oracle can trigger
      await expect(attackerTx).to.be.revertedWith("Only authorized oracle can trigger payouts");
    });
  });

  describe("Data Integrity", function () {
    it("Should prevent data corruption in policy storage", async function () {
      // Create policy
      await contracts.agroShieldPolicy.connect(users.farmer1).createPolicy(
        DEFAULT_POLICY_PARAMS.coverageAmount,
        DEFAULT_POLICY_PARAMS.rainfallThreshold,
        DEFAULT_POLICY_PARAMS.measurementPeriod,
        DEFAULT_POLICY_PARAMS.location,
        DEFAULT_POLICY_PARAMS.description
      );

      // Verify policy data integrity
      const policy = await contracts.agroShieldPolicy.getPolicy(1);
      expect(policy.coverageAmount).to.equal(DEFAULT_POLICY_PARAMS.coverageAmount);
      expect(policy.rainfallThreshold).to.equal(DEFAULT_POLICY_PARAMS.rainfallThreshold);
      expect(policy.measurementPeriod).to.equal(DEFAULT_POLICY_PARAMS.measurementPeriod);
      expect(policy.location).to.equal(DEFAULT_POLICY_PARAMS.location);
      expect(policy.description).to.equal(DEFAULT_POLICY_PARAMS.description);
    });

    it("Should prevent weather data manipulation", async function () {
      // Submit legitimate weather data
      await contracts.agroShieldOracle.connect(users.oracle).submitWeatherData(
        DEFAULT_ORACLE_DATA.location,
        DEFAULT_ORACLE_DATA.timestamp,
        DEFAULT_ORACLE_DATA.rainfall,
        DEFAULT_ORACLE_DATA.temperature,
        DEFAULT_ORACLE_DATA.humidity
      );

      // Verify data integrity
      const weatherData = await contracts.agroShieldOracle.getWeatherData(DEFAULT_ORACLE_DATA.location);
      expect(weatherData.rainfall).to.equal(DEFAULT_ORACLE_DATA.rainfall);
      expect(weatherData.temperature).to.equal(DEFAULT_ORACLE_DATA.temperature);
      expect(weatherData.humidity).to.equal(DEFAULT_ORACLE_DATA.humidity);
      expect(weatherData.timestamp).to.equal(DEFAULT_ORACLE_DATA.timestamp);
      expect(weatherData.verified).to.be.true;
    });
  });

  describe("Denial of Service Protection", function () {
    it("Should prevent gas limit exhaustion attacks", async function () {
      // Test with reasonable gas limits
      const depositAmount = ethers.utils.parseEther("1000");
      
      const tx = await contracts.agroShieldPool.connect(users.investor1).deposit(depositAmount, {
        gasLimit: 500000 // Reasonable gas limit
      });
      
      const receipt = await tx.wait();
      expect(receipt.gasUsed).to.be.lt(500000);
    });

    it("Should handle high-volume operations gracefully", async function () {
      // Create multiple policies rapidly
      const policyPromises = [];
      for (let i = 0; i < 10; i++) {
        policyPromises.push(
          contracts.agroShieldPolicy.connect(users.farmer1).createPolicy(
            ethers.utils.parseEther("1000"),
            "50",
            "90",
            `${DEFAULT_ORACLE_DATA.location},${i}`,
            `Policy ${i}`
          )
        );
      }
      
      // Should handle batch operations without failing
      await Promise.all(policyPromises);
      
      expect(await contracts.agroShieldPolicy.policiesCount()).to.equal(10);
    });
  });
});
