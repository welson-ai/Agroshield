import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { deployContracts, getTestUsers, setupUsersWithTokens, DEFAULT_POLICY_PARAMS, DEFAULT_ORACLE_DATA } from "./helpers";

describe("Integration Tests", function () {
  let contracts: any;
  let users: any;

  beforeEach(async function () {
    contracts = await deployContracts();
    users = await getTestUsers();
    await setupUsersWithTokens(users, contracts);
  });

  describe("Complete Policy Lifecycle", function () {
    it("Should handle complete policy lifecycle from creation to payout", async function () {
      // 1. Add liquidity to pool
      const liquidityAmount = ethers.utils.parseEther("5000");
      await contracts.agroShieldPool.connect(users.investor1).deposit(liquidityAmount);
      
      // 2. Create policy
      await contracts.agroShieldPolicy.connect(users.farmer1).createPolicy(
        DEFAULT_POLICY_PARAMS.coverageAmount,
        DEFAULT_POLICY_PARAMS.rainfallThreshold,
        DEFAULT_POLICY_PARAMS.measurementPeriod,
        DEFAULT_POLICY_PARAMS.location,
        DEFAULT_POLICY_PARAMS.description
      );
      
      // 3. Pay premium
      const premiumAmount = ethers.utils.parseEther("100");
      await contracts.agroShieldPolicy.connect(users.farmer1).payPremium(1, { value: premiumAmount });
      
      // 4. Submit weather data
      await contracts.agroShieldOracle.connect(users.oracle).submitWeatherData(
        DEFAULT_ORACLE_DATA.location,
        DEFAULT_ORACLE_DATA.timestamp,
        DEFAULT_ORACLE_DATA.rainfall,
        DEFAULT_ORACLE_DATA.temperature,
        DEFAULT_ORACLE_DATA.humidity
      );
      
      // 5. Trigger payout (rainfall above threshold)
      await contracts.agroShieldOracle.connect(users.oracle).triggerPolicyPayout(1);
      
      // 6. Verify complete lifecycle
      const policy = await contracts.agroShieldPolicy.getPolicy(1);
      expect(policy.isActive).to.be.true;
      expect(policy.isPaid).to.be.true;
      expect(policy.payoutTriggered).to.be.true;
      expect(policy.shouldPayout).to.be.true;
      expect(policy.payoutProcessed).to.be.true;
    });

    it("Should handle complete lifecycle with no payout (rainfall below threshold)", async function () {
      // 1. Add liquidity to pool
      const liquidityAmount = ethers.utils.parseEther("5000");
      await contracts.agroShieldPool.connect(users.investor1).deposit(liquidityAmount);
      
      // 2. Create policy with high threshold
      await contracts.agroShieldPolicy.connect(users.farmer1).createPolicy(
        DEFAULT_POLICY_PARAMS.coverageAmount,
        "100", // High threshold
        DEFAULT_POLICY_PARAMS.measurementPeriod,
        DEFAULT_POLICY_PARAMS.location,
        DEFAULT_POLICY_PARAMS.description
      );
      
      // 3. Pay premium
      const premiumAmount = ethers.utils.parseEther("100");
      await contracts.agroShieldPolicy.connect(users.farmer1).payPremium(1, { value: premiumAmount });
      
      // 4. Submit weather data (rainfall below threshold)
      await contracts.agroShieldOracle.connect(users.oracle).submitWeatherData(
        DEFAULT_ORACLE_DATA.location,
        DEFAULT_ORACLE_DATA.timestamp,
        "50", // Below threshold
        DEFAULT_ORACLE_DATA.temperature,
        DEFAULT_ORACLE_DATA.humidity
      );
      
      // 5. Trigger payout
      await contracts.agroShieldOracle.connect(users.oracle).triggerPolicyPayout(1);
      
      // 6. Verify no payout occurred
      const policy = await contracts.agroShieldPolicy.getPolicy(1);
      expect(policy.isActive).to.be.true;
      expect(policy.isPaid).to.be.true;
      expect(policy.payoutTriggered).to.be.true;
      expect(policy.shouldPayout).to.be.false;
      expect(policy.payoutProcessed).to.be.false;
    });
  });

  describe("Multi-User Scenarios", function () {
    it("Should handle multiple investors and farmers", async function () {
      // Multiple investors add liquidity
      await contracts.agroShieldPool.connect(users.investor1).deposit(ethers.utils.parseEther("3000"));
      await contracts.agroShieldPool.connect(users.investor2).deposit(ethers.utils.parseEther("2000"));
      
      // Multiple farmers create policies
      await contracts.agroShieldPolicy.connect(users.farmer1).createPolicy(
        ethers.utils.parseEther("1000"),
        "50",
        "90",
        "1.0,35.0",
        "Farmer 1 policy"
      );
      
      await contracts.agroShieldPolicy.connect(users.farmer2).createPolicy(
        ethers.utils.parseEther("1500"),
        "60",
        "90",
        "1.5,35.5",
        "Farmer 2 policy"
      );
      
      // Pay premiums
      await contracts.agroShieldPolicy.connect(users.farmer1).payPremium(1, { value: ethers.utils.parseEther("100") });
      await contracts.agroShieldPolicy.connect(users.farmer2).payPremium(2, { value: ethers.utils.parseEther("150") });
      
      // Submit weather data for both locations
      await contracts.agroShieldOracle.connect(users.oracle).submitWeatherData(
        "1.0,35.0",
        DEFAULT_ORACLE_DATA.timestamp,
        "75",
        DEFAULT_ORACLE_DATA.temperature,
        DEFAULT_ORACLE_DATA.humidity
      );
      
      await contracts.agroShieldOracle.connect(users.oracle).submitWeatherData(
        "1.5,35.5",
        DEFAULT_ORACLE_DATA.timestamp,
        "80",
        DEFAULT_ORACLE_DATA.temperature,
        DEFAULT_ORACLE_DATA.humidity
      );
      
      // Trigger payouts
      await contracts.agroShieldOracle.connect(users.oracle).triggerPolicyPayout(1);
      await contracts.agroShieldOracle.connect(users.oracle).triggerPolicyPayout(2);
      
      // Verify both policies processed correctly
      const policy1 = await contracts.agroShieldPolicy.getPolicy(1);
      const policy2 = await contracts.agroShieldPolicy.getPolicy(2);
      
      expect(policy1.payoutProcessed).to.be.true;
      expect(policy2.payoutProcessed).to.be.true;
      
      // Verify total pool liquidity decreased correctly
      const expectedTotalPayout = ethers.utils.parseEther("2500");
      const remainingLiquidity = await contracts.agroShieldPool.totalLiquidity();
      expect(remainingLiquidity).to.equal(ethers.utils.parseEther("5000").sub(expectedTotalPayout));
    });
  });

  describe("Edge Cases", function () {
    it("Should handle policy expiration correctly", async function () {
      // Create policy
      await contracts.agroShieldPolicy.connect(users.farmer1).createPolicy(
        DEFAULT_POLICY_PARAMS.coverageAmount,
        DEFAULT_POLICY_PARAMS.rainfallThreshold,
        "1", // 1 day period
        DEFAULT_POLICY_PARAMS.location,
        DEFAULT_POLICY_PARAMS.description
      );
      
      // Pay premium
      await contracts.agroShieldPolicy.connect(users.farmer1).payPremium(1, { value: ethers.utils.parseEther("100") });
      
      // Advance time beyond policy period
      await ethers.provider.send("evm_increaseTime", [2 * 24 * 60 * 60]); // 2 days
      await ethers.provider.send("evm_mine", []);
      
      // Try to trigger payout after expiration
      await contracts.agroShieldOracle.connect(users.oracle).submitWeatherData(
        DEFAULT_ORACLE_DATA.location,
        DEFAULT_ORACLE_DATA.timestamp,
        DEFAULT_ORACLE_DATA.rainfall,
        DEFAULT_ORACLE_DATA.temperature,
        DEFAULT_ORACLE_DATA.humidity
      );
      
      await expect(contracts.agroShieldOracle.connect(users.oracle).triggerPolicyPayout(1))
        .to.be.revertedWith("Policy has expired");
    });

    it("Should handle concurrent operations correctly", async function () {
      // Add liquidity
      await contracts.agroShieldPool.connect(users.investor1).deposit(ethers.utils.parseEther("10000"));
      
      // Create multiple policies simultaneously
      const policyCreationPromises = [];
      for (let i = 0; i < 3; i++) {
        policyCreationPromises.push(
          contracts.agroShieldPolicy.connect(users.farmer1).createPolicy(
            ethers.utils.parseEther("1000"),
            "50",
            "90",
            `${DEFAULT_ORACLE_DATA.location},${i}`,
            `Policy ${i + 1}`
          )
        );
      }
      
      await Promise.all(policyCreationPromises);
      
      // Pay all premiums
      for (let i = 1; i <= 3; i++) {
        await contracts.agroShieldPolicy.connect(users.farmer1).payPremium(i, { value: ethers.utils.parseEther("100") });
      }
      
      // Submit weather data and trigger payouts
      await contracts.agroShieldOracle.connect(users.oracle).submitWeatherData(
        DEFAULT_ORACLE_DATA.location,
        DEFAULT_ORACLE_DATA.timestamp,
        DEFAULT_ORACLE_DATA.rainfall,
        DEFAULT_ORACLE_DATA.temperature,
        DEFAULT_ORACLE_DATA.humidity
      );
      
      for (let i = 1; i <= 3; i++) {
        await contracts.agroShieldOracle.connect(users.oracle).triggerPolicyPayout(i);
      }
      
      // Verify all policies processed
      for (let i = 1; i <= 3; i++) {
        const policy = await contracts.agroShieldPolicy.getPolicy(i);
        expect(policy.payoutProcessed).to.be.true;
      }
    });
  });
});
