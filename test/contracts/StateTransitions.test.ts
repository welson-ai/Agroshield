import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { deployContracts, getTestUsers, setupUsersWithTokens, DEFAULT_POLICY_PARAMS, DEFAULT_ORACLE_DATA, advanceTime } from "./helpers";

describe("State Transition Tests", function () {
  let contracts: any;
  let users: any;

  beforeEach(async function () {
    contracts = await deployContracts();
    users = await getTestUsers();
    await setupUsersWithTokens(users, contracts);
  });

  describe("Policy State Transitions", function () {
    it("Should handle complete policy lifecycle state transitions", async function () {
      // Initial state: No policies
      expect(await contracts.agroShieldPolicy.policiesCount()).to.equal(0);
      expect(await contracts.agroShieldPolicy.activePoliciesCount()).to.equal(0);
      
      // State 1: Policy Created
      await contracts.agroShieldPolicy.connect(users.farmer1).createPolicy(
        DEFAULT_POLICY_PARAMS.coverageAmount,
        DEFAULT_POLICY_PARAMS.rainfallThreshold,
        DEFAULT_POLICY_PARAMS.measurementPeriod,
        DEFAULT_POLICY_PARAMS.location,
        DEFAULT_POLICY_PARAMS.description
      );
      
      let policy = await contracts.agroShieldPolicy.getPolicy(1);
      expect(policy.isActive).to.be.true;
      expect(policy.isPaid).to.be.false;
      expect(policy.payoutTriggered).to.be.false;
      expect(policy.payoutProcessed).to.be.false;
      expect(await contracts.agroShieldPolicy.policiesCount()).to.equal(1);
      expect(await contracts.agroShieldPolicy.activePoliciesCount()).to.equal(1);
      
      // State 2: Premium Paid
      await contracts.agroShieldPolicy.connect(users.farmer1).payPremium(1, { value: ethers.utils.parseEther("100") });
      
      policy = await contracts.agroShieldPolicy.getPolicy(1);
      expect(policy.isActive).to.be.true;
      expect(policy.isPaid).to.be.true;
      expect(policy.premiumPaidAt).to.be.gt(0);
      expect(policy.payoutTriggered).to.be.false;
      expect(policy.payoutProcessed).to.be.false;
      
      // State 3: Weather Data Submitted
      await contracts.agroShieldOracle.connect(users.oracle).submitWeatherData(
        DEFAULT_POLICY_PARAMS.location,
        DEFAULT_ORACLE_DATA.timestamp,
        DEFAULT_ORACLE_DATA.rainfall,
        DEFAULT_ORACLE_DATA.temperature,
        DEFAULT_ORACLE_DATA.humidity
      );
      
      // State 4: Payout Triggered
      await contracts.agroShieldOracle.connect(users.oracle).triggerPolicyPayout(1);
      
      policy = await contracts.agroShieldPolicy.getPolicy(1);
      expect(policy.isActive).to.be.true;
      expect(policy.isPaid).to.be.true;
      expect(policy.payoutTriggered).to.be.true;
      expect(policy.shouldPayout).to.be.true;
      expect(policy.payoutProcessed).to.be.true;
      expect(policy.payoutTriggeredAt).to.be.gt(0);
      expect(policy.payoutProcessedAt).to.be.gt(0);
    });

    it("Should handle policy expiration state transition", async function () {
      // Create policy with short duration
      await contracts.agroShieldPolicy.connect(users.farmer1).createPolicy(
        DEFAULT_POLICY_PARAMS.coverageAmount,
        DEFAULT_POLICY_PARAMS.rainfallThreshold,
        "1", // 1 day duration
        DEFAULT_POLICY_PARAMS.location,
        "Expiring policy"
      );
      
      // Pay premium
      await contracts.agroShieldPolicy.connect(users.farmer1).payPremium(1, { value: ethers.utils.parseEther("100") });
      
      let policy = await contracts.agroShieldPolicy.getPolicy(1);
      expect(policy.isActive).to.be.true;
      expect(policy.isPaid).to.be.true;
      
      // Advance time beyond policy period
      await advanceTime(2); // 2 days
      
      // Try to trigger payout after expiration
      await contracts.agroShieldOracle.connect(users.oracle).submitWeatherData(
        DEFAULT_POLICY_PARAMS.location,
        DEFAULT_ORACLE_DATA.timestamp,
        DEFAULT_ORACLE_DATA.rainfall,
        DEFAULT_ORACLE_DATA.temperature,
        DEFAULT_ORACLE_DATA.humidity
      );
      
      await expect(contracts.agroShieldOracle.connect(users.oracle).triggerPolicyPayout(1))
        .to.be.revertedWith("Policy has expired");
      
      // Policy should still exist but be expired
      policy = await contracts.agroShieldPolicy.getPolicy(1);
      expect(policy.isActive).to.be.true; // Still active until manually deactivated
      expect(policy.isPaid).to.be.true;
    });

    it("Should handle policy cancellation state transition", async function () {
      // Create policy
      await contracts.agroShieldPolicy.connect(users.farmer1).createPolicy(
        DEFAULT_POLICY_PARAMS.coverageAmount,
        DEFAULT_POLICY_PARAMS.rainfallThreshold,
        DEFAULT_POLICY_PARAMS.measurementPeriod,
        DEFAULT_POLICY_PARAMS.location,
        "Cancellable policy"
      );
      
      let policy = await contracts.agroShieldPolicy.getPolicy(1);
      expect(policy.isActive).to.be.true;
      expect(policy.isPaid).to.be.false;
      expect(await contracts.agroShieldPolicy.activePoliciesCount()).to.equal(1);
      
      // Cancel policy
      await contracts.agroShieldPolicy.connect(users.owner).deactivatePolicy(1);
      
      policy = await contracts.agroShieldPolicy.getPolicy(1);
      expect(policy.isActive).to.be.false;
      expect(policy.isPaid).to.be.false;
      expect(await contracts.agroShieldPolicy.activePoliciesCount()).to.equal(0);
      
      // Should not be able to pay premium for cancelled policy
      await expect(contracts.agroShieldPolicy.connect(users.farmer1).payPremium(1, { value: ethers.utils.parseEther("100") }))
        .to.be.revertedWith("Policy is not active");
      
      // Should not be able to trigger payout for cancelled policy
      await contracts.agroShieldOracle.connect(users.oracle).submitWeatherData(
        DEFAULT_POLICY_PARAMS.location,
        DEFAULT_ORACLE_DATA.timestamp,
        DEFAULT_ORACLE_DATA.rainfall,
        DEFAULT_ORACLE_DATA.temperature,
        DEFAULT_ORACLE_DATA.humidity
      );
      
      await expect(contracts.agroShieldOracle.connect(users.oracle).triggerPolicyPayout(1))
        .to.be.revertedWith("Policy is not active");
    });
  });

  describe("Pool State Transitions", function () {
    it("Should handle pool liquidity state transitions", async function () {
      // Initial state: Empty pool
      expect(await contracts.agroShieldPool.totalLiquidity()).to.equal(0);
      expect(await contracts.agroShieldPool.activePoliciesCount()).to.equal(0);
      
      // State 1: Liquidity Added
      const depositAmount = ethers.utils.parseEther("10000");
      await contracts.agroShieldPool.connect(users.investor1).deposit(depositAmount);
      
      expect(await contracts.agroShieldPool.totalLiquidity()).to.equal(depositAmount);
      expect(await contracts.agroShieldPool.getLiquidity(users.investor1.address)).to.equal(depositAmount);
      
      // State 2: Active Policy (requires liquidity)
      await contracts.agroShieldPolicy.connect(users.farmer1).createPolicy(
        DEFAULT_POLICY_PARAMS.coverageAmount,
        DEFAULT_POLICY_PARAMS.rainfallThreshold,
        DEFAULT_POLICY_PARAMS.measurementPeriod,
        DEFAULT_POLICY_PARAMS.location,
        "Test policy"
      );
      
      await contracts.agroShieldPolicy.connect(users.farmer1).payPremium(1, { value: ethers.utils.parseEther("100") });
      
      expect(await contracts.agroShieldPool.activePoliciesCount()).to.equal(1);
      
      // State 3: Payout Processed (reduces liquidity)
      await contracts.agroShieldPool.connect(users.investor1).deposit(ethers.utils.parseEther("5000")); // Add more liquidity
      
      await contracts.agroShieldOracle.connect(users.oracle).submitWeatherData(
        DEFAULT_POLICY_PARAMS.location,
        DEFAULT_ORACLE_DATA.timestamp,
        "75", // Above threshold
        DEFAULT_ORACLE_DATA.temperature,
        DEFAULT_ORACLE_DATA.humidity
      );
      
      await contracts.agroShieldOracle.connect(users.oracle).triggerPolicyPayout(1);
      
      // Liquidity should be reduced by payout amount
      const expectedLiquidity = depositAmount.add(ethers.utils.parseEther("5000")).sub(DEFAULT_POLICY_PARAMS.coverageAmount);
      expect(await contracts.agroShieldPool.totalLiquidity()).to.equal(expectedLiquidity);
      
      // State 4: Liquidity Withdrawn
      const withdrawAmount = ethers.utils.parseEther("2000");
      await contracts.agroShieldPool.connect(users.investor1).withdraw(withdrawAmount);
      
      expect(await contracts.agroShieldPool.totalLiquidity()).to.equal(expectedLiquidity.sub(withdrawAmount));
      expect(await contracts.agroShieldPool.getLiquidity(users.investor1.address)).to.equal(expectedLiquidity.sub(withdrawAmount));
    });

    it("Should handle multiple investors state transitions", async function () {
      // State 1: Multiple investors deposit
      const investor1Deposit = ethers.utils.parseEther("5000");
      const investor2Deposit = ethers.utils.parseEther("3000");
      
      await contracts.agroShieldPool.connect(users.investor1).deposit(investor1Deposit);
      await contracts.agroShieldPool.connect(users.investor2).deposit(investor2Deposit);
      
      expect(await contracts.agroShieldPool.totalLiquidity()).to.equal(investor1Deposit.add(investor2Deposit));
      expect(await contracts.agroShieldPool.getLiquidity(users.investor1.address)).to.equal(investor1Deposit);
      expect(await contracts.agroShieldPool.getLiquidity(users.investor2.address)).to.equal(investor2Deposit);
      
      // State 2: Payout affects pool liquidity
      await contracts.agroShieldPolicy.connect(users.farmer1).createPolicy(
        ethers.utils.parseEther("2000"),
        "50",
        "90",
        DEFAULT_POLICY_PARAMS.location,
        "Multi-investor policy"
      );
      
      await contracts.agroShieldPolicy.connect(users.farmer1).payPremium(1, { value: ethers.utils.parseEther("200") });
      
      await contracts.agroShieldOracle.connect(users.oracle).submitWeatherData(
        DEFAULT_POLICY_PARAMS.location,
        DEFAULT_ORACLE_DATA.timestamp,
        "75",
        DEFAULT_ORACLE_DATA.temperature,
        DEFAULT_ORACLE_DATA.humidity
      );
      
      await contracts.agroShieldOracle.connect(users.oracle).triggerPolicyPayout(1);
      
      // Total liquidity reduced proportionally
      const expectedTotalLiquidity = investor1Deposit.add(investor2Deposit).sub(ethers.utils.parseEther("2000"));
      expect(await contracts.agroShieldPool.totalLiquidity()).to.equal(expectedTotalLiquidity);
      
      // State 3: Individual withdrawals
      await contracts.agroShieldPool.connect(users.investor1).withdraw(ethers.utils.parseEther("1000"));
      await contracts.agroShieldPool.connect(users.investor2).withdraw(ethers.utils.parseEther("500"));
      
      const finalExpectedLiquidity = expectedTotalLiquidity.sub(ethers.utils.parseEther("1500"));
      expect(await contracts.agroShieldPool.totalLiquidity()).to.equal(finalExpectedLiquidity);
    });
  });

  describe("Oracle State Transitions", function () {
    it("Should handle oracle data state transitions", async function () {
      // Initial state: No weather data
      expect(await contracts.agroShieldOracle.weatherDataCount()).to.equal(0);
      
      let weatherData = await contracts.agroShieldOracle.getWeatherData(DEFAULT_ORACLE_DATA.location);
      expect(weatherData.rainfall).to.equal(0);
      expect(weatherData.verified).to.be.false;
      
      // State 1: Weather Data Submitted
      await contracts.agroShieldOracle.connect(users.oracle).submitWeatherData(
        DEFAULT_ORACLE_DATA.location,
        DEFAULT_ORACLE_DATA.timestamp,
        DEFAULT_ORACLE_DATA.rainfall,
        DEFAULT_ORACLE_DATA.temperature,
        DEFAULT_ORACLE_DATA.humidity
      );
      
      expect(await contracts.agroShieldOracle.weatherDataCount()).to.equal(1);
      
      weatherData = await contracts.agroShieldOracle.getWeatherData(DEFAULT_ORACLE_DATA.location);
      expect(weatherData.rainfall).to.equal(DEFAULT_ORACLE_DATA.rainfall);
      expect(weatherData.temperature).to.equal(DEFAULT_ORACLE_DATA.temperature);
      expect(weatherData.humidity).to.equal(DEFAULT_ORACLE_DATA.humidity);
      expect(weatherData.timestamp).to.equal(DEFAULT_ORACLE_DATA.timestamp);
      expect(weatherData.verified).to.be.true;
      expect(weatherData.submittedAt).to.be.gt(0);
      
      // State 2: Weather Data Updated
      const newTimestamp = (parseInt(DEFAULT_ORACLE_DATA.timestamp) + 3600).toString();
      const newRainfall = "80";
      
      await contracts.agroShieldOracle.connect(users.oracle).submitWeatherData(
        DEFAULT_ORACLE_DATA.location,
        newTimestamp,
        newRainfall,
        DEFAULT_ORACLE_DATA.temperature,
        DEFAULT_ORACLE_DATA.humidity
      );
      
      // Count should remain 1 (updated, not added)
      expect(await contracts.agroShieldOracle.weatherDataCount()).to.equal(1);
      
      weatherData = await contracts.agroShieldOracle.getWeatherData(DEFAULT_ORACLE_DATA.location);
      expect(weatherData.rainfall).to.equal(newRainfall);
      expect(weatherData.timestamp).to.equal(newTimestamp);
      expect(weatherData.verified).to.be.true;
    });

    it("Should handle multiple location data state transitions", async function () {
      const locations = [
        "1.0,35.0",
        "1.5,35.5",
        "2.0,36.0"
      ];
      
      // State 1: Multiple locations data
      for (let i = 0; i < locations.length; i++) {
        await contracts.agroShieldOracle.connect(users.oracle).submitWeatherData(
          locations[i],
          DEFAULT_ORACLE_DATA.timestamp,
          (50 + i * 10).toString(),
          DEFAULT_ORACLE_DATA.temperature,
          DEFAULT_ORACLE_DATA.humidity
        );
      }
      
      expect(await contracts.agroShieldOracle.weatherDataCount()).to.equal(locations.length);
      
      // Verify each location has correct data
      for (let i = 0; i < locations.length; i++) {
        const weatherData = await contracts.agroShieldOracle.getWeatherData(locations[i]);
        expect(weatherData.rainfall).to.equal((50 + i * 10).toString());
        expect(weatherData.verified).to.be.true;
      }
      
      // State 2: Partial updates
      await contracts.agroShieldOracle.connect(users.oracle).submitWeatherData(
        locations[1],
        DEFAULT_ORACLE_DATA.timestamp,
        "999", // Updated rainfall
        DEFAULT_ORACLE_DATA.temperature,
        DEFAULT_ORACLE_DATA.humidity
      );
      
      // Count should remain the same
      expect(await contracts.agroShieldOracle.weatherDataCount()).to.equal(locations.length);
      
      // Only updated location should have new data
      const updatedWeatherData = await contracts.agroShieldOracle.getWeatherData(locations[1]);
      expect(updatedWeatherData.rainfall).to.equal("999");
      
      // Other locations should remain unchanged
      const unchangedWeatherData = await contracts.agroShieldOracle.getWeatherData(locations[0]);
      expect(unchangedWeatherData.rainfall).to.equal("50");
    });
  });

  describe("Complex State Scenarios", function () {
    it("Should handle concurrent state transitions", async function () {
      // Setup multiple concurrent operations
      const operations = [];
      
      // Policy creations
      for (let i = 0; i < 5; i++) {
        operations.push(
          contracts.agroShieldPolicy.connect(users.farmer1).createPolicy(
            ethers.utils.parseEther("1000"),
            "50",
            "90",
            `${DEFAULT_POLICY_PARAMS.location},${i}`,
            `Concurrent policy ${i}`
          )
        );
      }
      
      // Deposits
      for (let i = 0; i < 3; i++) {
        operations.push(
          contracts.agroShieldPool.connect(users.investor1).deposit(ethers.utils.parseEther("1000"))
        );
      }
      
      // Weather data submissions
      for (let i = 0; i < 4; i++) {
        operations.push(
          contracts.agroShieldOracle.connect(users.oracle).submitWeatherData(
            `${DEFAULT_ORACLE_DATA.location},${i}`,
            DEFAULT_ORACLE_DATA.timestamp,
            DEFAULT_ORACLE_DATA.rainfall,
            DEFAULT_ORACLE_DATA.temperature,
            DEFAULT_ORACLE_DATA.humidity
          )
        );
      }
      
      // Execute all operations concurrently
      await Promise.all(operations);
      
      // Verify final state is consistent
      expect(await contracts.agroShieldPolicy.policiesCount()).to.equal(5);
      expect(await contracts.agroShieldPolicy.activePoliciesCount()).to.equal(5);
      expect(await contracts.agroShieldPool.totalLiquidity()).to.equal(ethers.utils.parseEther("3000"));
      expect(await contracts.agroShieldOracle.weatherDataCount()).to.equal(4);
      
      // Verify individual states
      for (let i = 1; i <= 5; i++) {
        const policy = await contracts.agroShieldPolicy.getPolicy(i);
        expect(policy.isActive).to.be.true;
        expect(policy.isPaid).to.be.false;
      }
    });

    it("Should handle state rollback scenarios", async function () {
      // Create initial state
      await contracts.agroShieldPool.connect(users.investor1).deposit(ethers.utils.parseEther("5000"));
      
      await contracts.agroShieldPolicy.connect(users.farmer1).createPolicy(
        DEFAULT_POLICY_PARAMS.coverageAmount,
        DEFAULT_POLICY_PARAMS.rainfallThreshold,
        DEFAULT_POLICY_PARAMS.measurementPeriod,
        DEFAULT_POLICY_PARAMS.location,
        "Rollback test policy"
      );
      
      // Record initial state
      const initialLiquidity = await contracts.agroShieldPool.totalLiquidity();
      const initialPolicyCount = await contracts.agroShieldPolicy.policiesCount();
      
      // Attempt operation that should fail
      await expect(contracts.agroShieldPolicy.connect(users.farmer1).payPremium(1, { value: ethers.utils.parseEther("1000000") }))
        .to.be.reverted;
      
      // State should be unchanged
      expect(await contracts.agroShieldPool.totalLiquidity()).to.equal(initialLiquidity);
      expect(await contracts.agroShieldPolicy.policiesCount()).to.equal(initialPolicyCount);
      
      const policy = await contracts.agroShieldPolicy.getPolicy(1);
      expect(policy.isPaid).to.be.false;
      
      // Successful operation should work normally
      await contracts.agroShieldPolicy.connect(users.farmer1).payPremium(1, { value: ethers.utils.parseEther("100") });
      
      const updatedPolicy = await contracts.agroShieldPolicy.getPolicy(1);
      expect(updatedPolicy.isPaid).to.be.true;
    });

    it("Should handle state persistence across operations", async function () {
      // Create complex state
      const policyIds = [];
      
      // Create multiple policies
      for (let i = 0; i < 10; i++) {
        await contracts.agroShieldPolicy.connect(users.farmer1).createPolicy(
          ethers.utils.parseEther("1000"),
          "50",
          "90",
          `${DEFAULT_POLICY_PARAMS.location},${i}`,
          `Persistence test ${i}`
        );
        policyIds.push(i + 1);
      }
      
      // Pay premiums for some policies
      for (let i = 0; i < 5; i++) {
        await contracts.agroShieldPolicy.connect(users.farmer1).payPremium(policyIds[i], { value: ethers.utils.parseEther("100") });
      }
      
      // Submit weather data
      await contracts.agroShieldOracle.connect(users.oracle).submitWeatherData(
        DEFAULT_POLICY_PARAMS.location,
        DEFAULT_ORACLE_DATA.timestamp,
        DEFAULT_ORACLE_DATA.rainfall,
        DEFAULT_ORACLE_DATA.temperature,
        DEFAULT_ORACLE_DATA.humidity
      );
      
      // Trigger payouts for paid policies
      for (let i = 0; i < 5; i++) {
        await contracts.agroShieldOracle.connect(users.oracle).triggerPolicyPayout(policyIds[i]);
      }
      
      // Verify state persistence
      expect(await contracts.agroShieldPolicy.policiesCount()).to.equal(10);
      expect(await contracts.agroShieldPolicy.activePoliciesCount()).to.equal(10);
      
      // Check individual policy states
      for (let i = 0; i < 10; i++) {
        const policy = await contracts.agroShieldPolicy.getPolicy(policyIds[i]);
        
        if (i < 5) {
          // Paid and processed policies
          expect(policy.isPaid).to.be.true;
          expect(policy.payoutTriggered).to.be.true;
          expect(policy.payoutProcessed).to.be.true;
        } else {
          // Unpaid policies
          expect(policy.isPaid).to.be.false;
          expect(policy.payoutTriggered).to.be.false;
          expect(policy.payoutProcessed).to.be.false;
        }
        
        expect(policy.isActive).to.be.true;
      }
    });
  });
});
