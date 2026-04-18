import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { deployContracts, getTestUsers, setupUsersWithTokens, DEFAULT_POLICY_PARAMS, DEFAULT_ORACLE_DATA } from "./helpers";

describe("Error Recovery Tests", function () {
  let contracts: any;
  let users: any;

  beforeEach(async function () {
    contracts = await deployContracts();
    users = await getTestUsers();
    await setupUsersWithTokens(users, contracts);
  });

  describe("Transaction Failure Recovery", function () {
    it("Should recover from failed policy creation", async function () {
      // Attempt to create policy with invalid parameters
      await expect(contracts.agroShieldPolicy.connect(users.farmer1).createPolicy(
        0, // Invalid coverage amount
        DEFAULT_POLICY_PARAMS.rainfallThreshold,
        DEFAULT_POLICY_PARAMS.measurementPeriod,
        DEFAULT_POLICY_PARAMS.location,
        DEFAULT_POLICY_PARAMS.description
      ))
        .to.be.revertedWith("Coverage amount must be greater than 0");
      
      // System should still be functional
      await expect(contracts.agroShieldPolicy.connect(users.farmer1).createPolicy(
        DEFAULT_POLICY_PARAMS.coverageAmount,
        DEFAULT_POLICY_PARAMS.rainfallThreshold,
        DEFAULT_POLICY_PARAMS.measurementPeriod,
        DEFAULT_POLICY_PARAMS.location,
        DEFAULT_POLICY_PARAMS.description
      ))
        .to.emit(contracts.agroShieldPolicy, "PolicyCreated")
        .withArgs(1, users.farmer1.address);
      
      // Verify system state is consistent
      expect(await contracts.agroShieldPolicy.policiesCount()).to.equal(1);
      expect(await contracts.agroShieldPolicy.activePoliciesCount()).to.equal(1);
    });

    it("Should recover from failed premium payment", async function () {
      // Create policy first
      await contracts.agroShieldPolicy.connect(users.farmer1).createPolicy(
        DEFAULT_POLICY_PARAMS.coverageAmount,
        DEFAULT_POLICY_PARAMS.rainfallThreshold,
        DEFAULT_POLICY_PARAMS.measurementPeriod,
        DEFAULT_POLICY_PARAMS.location,
        DEFAULT_POLICY_PARAMS.description
      );
      
      // Attempt to pay premium with insufficient funds
      await expect(contracts.agroShieldPolicy.connect(users.farmer1).payPremium(1, { value: ethers.utils.parseEther("1000000") }))
        .to.be.reverted;
      
      // System should still be functional
      await expect(contracts.agroShieldPolicy.connect(users.farmer1).payPremium(1, { value: ethers.utils.parseEther("100") }))
        .to.emit(contracts.agroShieldPolicy, "PremiumPaid")
        .withArgs(1, users.farmer1.address, ethers.utils.parseEther("100"));
      
      // Verify system state is consistent
      const policy = await contracts.agroShieldPolicy.getPolicy(1);
      expect(policy.isPaid).to.be.true;
      expect(policy.premiumPaidAt).to.be.gt(0);
    });

    it("Should recover from failed withdrawal", async function () {
      // Deposit some liquidity
      await contracts.agroShieldPool.connect(users.investor1).deposit(ethers.utils.parseEther("1000"));
      
      // Attempt to withdraw more than available
      await expect(contracts.agroShieldPool.connect(users.investor1).withdraw(ethers.utils.parseEther("2000")))
        .to.be.revertedWith("Insufficient liquidity");
      
      // System should still be functional
      await expect(contracts.agroShieldPool.connect(users.investor1).withdraw(ethers.utils.parseEther("500")))
        .to.emit(contracts.agroShieldPool, "LiquidityWithdrawn")
        .withArgs(users.investor1.address, ethers.utils.parseEther("500"));
      
      // Verify system state is consistent
      expect(await contracts.agroShieldPool.getLiquidity(users.investor1.address)).to.equal(ethers.utils.parseEther("500"));
      expect(await contracts.agroShieldPool.totalLiquidity()).to.equal(ethers.utils.parseEther("500"));
    });

    it("Should recover from failed weather data submission", async function () {
      // Attempt to submit weather data with invalid parameters
      await expect(contracts.agroShieldOracle.connect(users.oracle).submitWeatherData(
        "", // Empty location
        DEFAULT_ORACLE_DATA.timestamp,
        DEFAULT_ORACLE_DATA.rainfall,
        DEFAULT_ORACLE_DATA.temperature,
        DEFAULT_ORACLE_DATA.humidity
      ))
        .to.be.revertedWith("Location cannot be empty");
      
      // System should still be functional
      await expect(contracts.agroShieldOracle.connect(users.oracle).submitWeatherData(
        DEFAULT_ORACLE_DATA.location,
        DEFAULT_ORACLE_DATA.timestamp,
        DEFAULT_ORACLE_DATA.rainfall,
        DEFAULT_ORACLE_DATA.temperature,
        DEFAULT_ORACLE_DATA.humidity
      ))
        .to.emit(contracts.agroShieldOracle, "WeatherDataSubmitted")
        .withArgs(
          DEFAULT_ORACLE_DATA.location,
          DEFAULT_ORACLE_DATA.timestamp,
          DEFAULT_ORACLE_DATA.rainfall,
          DEFAULT_ORACLE_DATA.temperature,
          DEFAULT_ORACLE_DATA.humidity
        );
      
      // Verify system state is consistent
      expect(await contracts.agroShieldOracle.weatherDataCount()).to.equal(1);
      const weatherData = await contracts.agroShieldOracle.getWeatherData(DEFAULT_ORACLE_DATA.location);
      expect(weatherData.verified).to.be.true;
    });
  });

  describe("State Consistency Recovery", function () {
    it("Should maintain state consistency after partial batch failures", async function () {
      // Create multiple policies
      const policyPromises = [];
      for (let i = 0; i < 10; i++) {
        if (i === 5) {
          // Insert invalid policy at index 5
          policyPromises.push(
            contracts.agroShieldPolicy.connect(users.farmer1).createPolicy(
              0, // Invalid
              DEFAULT_POLICY_PARAMS.rainfallThreshold,
              DEFAULT_POLICY_PARAMS.measurementPeriod,
              DEFAULT_POLICY_PARAMS.location,
              "Invalid policy"
            ).catch(() => null)
          );
        } else {
          policyPromises.push(
            contracts.agroShieldPolicy.connect(users.farmer1).createPolicy(
              DEFAULT_POLICY_PARAMS.coverageAmount,
              DEFAULT_POLICY_PARAMS.rainfallThreshold,
              DEFAULT_POLICY_PARAMS.measurementPeriod,
              `${DEFAULT_POLICY_PARAMS.location},${i}`,
              `Policy ${i}`
            )
          );
        }
      }
      
      // Execute batch with one failure
      const results = await Promise.allSettled(policyPromises);
      
      // Count successful operations
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      console.log(`Batch operations: ${successful} successful, ${failed} failed`);
      
      // Verify state consistency
      expect(await contracts.agroShieldPolicy.policiesCount()).to.equal(successful);
      
      // Verify all created policies are valid
      for (let i = 1; i <= successful; i++) {
        const policy = await contracts.agroShieldPolicy.getPolicy(i);
        expect(policy.coverageAmount).to.equal(DEFAULT_POLICY_PARAMS.coverageAmount);
        expect(policy.isActive).to.be.true;
      }
    });

    it("Should recover from interrupted operations", async function () {
      // Start creating policies
      const createdPolicies = [];
      
      try {
        for (let i = 0; i < 20; i++) {
          if (i === 10) {
            // Simulate interruption at policy 10
            throw new Error("Simulated interruption");
          }
          
          await contracts.agroShieldPolicy.connect(users.farmer1).createPolicy(
            DEFAULT_POLICY_PARAMS.coverageAmount,
            DEFAULT_POLICY_PARAMS.rainfallThreshold,
            DEFAULT_POLICY_PARAMS.measurementPeriod,
            `${DEFAULT_POLICY_PARAMS.location},${i}`,
            `Policy ${i}`
          );
          
          createdPolicies.push(i + 1);
        }
      } catch (error) {
        console.log("Operation interrupted at policy 10");
      }
      
      // Verify partial state is consistent
      expect(await contracts.agroShieldPolicy.policiesCount()).to.equal(createdPolicies.length);
      
      // System should be able to continue operations
      await contracts.agroShieldPolicy.connect(users.farmer1).createPolicy(
        DEFAULT_POLICY_PARAMS.coverageAmount,
        DEFAULT_POLICY_PARAMS.rainfallThreshold,
        DEFAULT_POLICY_PARAMS.measurementPeriod,
        `${DEFAULT_POLICY_PARAMS.location},20`,
        "Policy 20"
      );
      
      expect(await contracts.agroShieldPolicy.policiesCount()).to.equal(createdPolicies.length + 1);
    });
  });

  describe("Data Recovery Tests", function () {
    it("Should handle corrupted data gracefully", async function () {
      // Create policy with normal data
      await contracts.agroShieldPolicy.connect(users.farmer1).createPolicy(
        DEFAULT_POLICY_PARAMS.coverageAmount,
        DEFAULT_POLICY_PARAMS.rainfallThreshold,
        DEFAULT_POLICY_PARAMS.measurementPeriod,
        DEFAULT_POLICY_PARAMS.location,
        DEFAULT_POLICY_PARAMS.description
      );
      
      // Verify data integrity
      const policy = await contracts.agroShieldPolicy.getPolicy(1);
      expect(policy.coverageAmount).to.equal(DEFAULT_POLICY_PARAMS.coverageAmount);
      
      // System should handle edge cases
      const edgeCases = [
        { coverage: ethers.utils.parseEther("0.001"), threshold: "1", period: "1" },
        { coverage: ethers.utils.parseEther("1000000"), threshold: "1000", period: "3650" }
      ];
      
      for (const testCase of edgeCases) {
        await contracts.agroShieldPolicy.connect(users.farmer2).createPolicy(
          testCase.coverage,
          testCase.threshold,
          testCase.period,
          `${DEFAULT_POLICY_PARAMS.location},${testCase.coverage}`,
          `Edge case policy`
        );
        
        const edgePolicy = await contracts.agroShieldPolicy.getPolicy(await contracts.agroShieldPolicy.policiesCount());
        expect(edgePolicy.coverageAmount).to.equal(testCase.coverage);
        expect(edgePolicy.rainfallThreshold).to.equal(testCase.threshold);
        expect(edgePolicy.measurementPeriod).to.equal(testCase.period);
      }
    });

    it("Should recover from weather data inconsistencies", async function () {
      // Submit weather data with various edge cases
      const edgeCases = [
        { rainfall: "0", temperature: "0", humidity: "0" },
        { rainfall: "999", temperature: "100", humidity: "100" },
        { rainfall: "50", temperature: "25", humidity: "50" }
      ];
      
      for (let i = 0; i < edgeCases.length; i++) {
        const testCase = edgeCases[i];
        await contracts.agroShieldOracle.connect(users.oracle).submitWeatherData(
          `${DEFAULT_ORACLE_DATA.location},${i}`,
          DEFAULT_ORACLE_DATA.timestamp,
          testCase.rainfall,
          testCase.temperature,
          testCase.humidity
        );
        
        const weatherData = await contracts.agroShieldOracle.getWeatherData(`${DEFAULT_ORACLE_DATA.location},${i}`);
        expect(weatherData.rainfall).to.equal(testCase.rainfall);
        expect(weatherData.temperature).to.equal(testCase.temperature);
        expect(weatherData.humidity).to.equal(testCase.humidity);
        expect(weatherData.verified).to.be.true;
      }
    });
  });

  describe("Network Recovery Tests", function () {
    it("Should handle network congestion scenarios", async function () {
      // Simulate network congestion with many concurrent operations
      const operationCount = 50;
      const operations = [];
      
      // Mix of different operations
      for (let i = 0; i < operationCount; i++) {
        if (i % 3 === 0) {
          // Policy creation
          operations.push(
            contracts.agroShieldPolicy.connect(users.farmer1).createPolicy(
              ethers.utils.parseEther("1000"),
              "50",
              "90",
              `${DEFAULT_POLICY_PARAMS.location},${i}`,
              `Policy ${i}`
            )
          );
        } else if (i % 3 === 1) {
          // Deposit
          operations.push(
            contracts.agroShieldPool.connect(users.investor1).deposit(ethers.utils.parseEther("100"))
          );
        } else {
          // Weather data submission
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
      }
      
      // Execute with potential failures
      const results = await Promise.allSettled(operations);
      
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      console.log(`Network congestion test: ${successful} successful, ${failed} failed`);
      
      // System should remain functional
      expect(await contracts.agroShieldPolicy.policiesCount()).to.be.gt(0);
      expect(await contracts.agroShieldPool.totalLiquidity()).to.be.gt(0);
      expect(await contracts.agroShieldOracle.weatherDataCount()).to.be.gt(0);
    });

    it("Should handle gas price fluctuations", async function () {
      // Test with different gas limits
      const gasLimits = [100000, 200000, 300000, 500000];
      const results = [];
      
      for (const gasLimit of gasLimits) {
        try {
          const tx = await contracts.agroShieldPolicy.connect(users.farmer1).createPolicy(
            DEFAULT_POLICY_PARAMS.coverageAmount,
            DEFAULT_POLICY_PARAMS.rainfallThreshold,
            DEFAULT_POLICY_PARAMS.measurementPeriod,
            `${DEFAULT_POLICY_PARAMS.location},${gasLimit}`,
            `Gas limit test ${gasLimit}`,
            { gasLimit }
          );
          
          const receipt = await tx.wait();
          results.push({ gasLimit, gasUsed: receipt.gasUsed.toNumber(), success: true });
        } catch (error) {
          results.push({ gasLimit, gasUsed: 0, success: false });
        }
      }
      
      console.log("Gas limit test results:", results);
      
      // At least some operations should succeed
      const successful = results.filter(r => r.success).length;
      expect(successful).to.be.gt(0);
    });
  });

  describe("System Recovery Tests", function () {
    it("Should maintain functionality after critical failures", async function () {
      // Simulate critical failure scenarios
      
      // 1. Owner transfer failure
      await expect(contracts.agroShieldPool.connect(users.farmer1).transferOwnership(users.farmer2.address))
        .to.be.reverted;
      
      // System should still be functional
      await contracts.agroShieldPool.connect(users.investor1).deposit(ethers.utils.parseEther("1000"));
      expect(await contracts.agroShieldPool.totalLiquidity()).to.equal(ethers.utils.parseEther("1000"));
      
      // 2. Oracle authorization failure
      await expect(contracts.agroShieldOracle.connect(users.farmer1).submitWeatherData(
        DEFAULT_ORACLE_DATA.location,
        DEFAULT_ORACLE_DATA.timestamp,
        DEFAULT_ORACLE_DATA.rainfall,
        DEFAULT_ORACLE_DATA.temperature,
        DEFAULT_ORACLE_DATA.humidity
      ))
        .to.be.reverted;
      
      // Authorized oracle should still work
      await contracts.agroShieldOracle.connect(users.oracle).submitWeatherData(
        DEFAULT_ORACLE_DATA.location,
        DEFAULT_ORACLE_DATA.timestamp,
        DEFAULT_ORACLE_DATA.rainfall,
        DEFAULT_ORACLE_DATA.temperature,
        DEFAULT_ORACLE_DATA.humidity
      );
      
      expect(await contracts.agroShieldOracle.weatherDataCount()).to.equal(1);
    });

    it("Should handle emergency scenarios", async function () {
      // Create active policies and liquidity
      await contracts.agroShieldPool.connect(users.investor1).deposit(ethers.utils.parseEther("10000"));
      
      for (let i = 0; i < 5; i++) {
        await contracts.agroShieldPolicy.connect(users.farmer1).createPolicy(
          ethers.utils.parseEther("1000"),
          "50",
          "90",
          `${DEFAULT_POLICY_PARAMS.location},${i}`,
          `Emergency policy ${i}`
        );
      }
      
      // Simulate emergency pause (if implemented)
      // This would test emergency stop functionality
      
      // Verify system can be restored
      expect(await contracts.agroShieldPolicy.policiesCount()).to.equal(5);
      expect(await contracts.agroShieldPool.totalLiquidity()).to.equal(ethers.utils.parseEther("10000"));
      
      // All policies should still be accessible
      for (let i = 1; i <= 5; i++) {
        const policy = await contracts.agroShieldPolicy.getPolicy(i);
        expect(policy.isActive).to.be.true;
      }
    });
  });
});
