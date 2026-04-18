import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { deployContracts, getTestUsers, setupUsersWithTokens, DEFAULT_POLICY_PARAMS, DEFAULT_ORACLE_DATA } from "./helpers";

describe("Performance Tests", function () {
  let contracts: any;
  let users: any;

  beforeEach(async function () {
    contracts = await deployContracts();
    users = await getTestUsers();
    await setupUsersWithTokens(users, contracts);
  });

  describe("Batch Operations Performance", function () {
    it("Should measure performance of batch policy creation", async function () {
      const batchSize = 50;
      const startTime = Date.now();
      
      // Create batch of policies
      const policyPromises = [];
      for (let i = 0; i < batchSize; i++) {
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
      
      await Promise.all(policyPromises);
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log(`Batch of ${batchSize} policies created in ${duration}ms`);
      console.log(`Average time per policy: ${duration / batchSize}ms`);
      
      // Should complete within reasonable time (under 30 seconds)
      expect(duration).to.be.lt(30000);
      
      // Verify all policies were created
      expect(await contracts.agroShieldPolicy.policiesCount()).to.equal(batchSize);
    });

    it("Should measure performance of batch premium payments", async function () {
      // First create 50 policies
      const policyCount = 50;
      for (let i = 0; i < policyCount; i++) {
        await contracts.agroShieldPolicy.connect(users.farmer1).createPolicy(
          ethers.utils.parseEther("1000"),
          "50",
          "90",
          `${DEFAULT_ORACLE_DATA.location},${i}`,
          `Policy ${i}`
        );
      }
      
      const startTime = Date.now();
      
      // Pay premiums for all policies
      const premiumPromises = [];
      for (let i = 1; i <= policyCount; i++) {
        premiumPromises.push(
          contracts.agroShieldPolicy.connect(users.farmer1).payPremium(i, { value: ethers.utils.parseEther("100") })
        );
      }
      
      await Promise.all(premiumPromises);
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log(`Batch of ${policyCount} premium payments processed in ${duration}ms`);
      console.log(`Average time per premium payment: ${duration / policyCount}ms`);
      
      // Should complete within reasonable time (under 20 seconds)
      expect(duration).to.be.lt(20000);
      
      // Verify all premiums were paid
      for (let i = 1; i <= policyCount; i++) {
        const policy = await contracts.agroShieldPolicy.getPolicy(i);
        expect(policy.isPaid).to.be.true;
      }
    });

    it("Should measure performance of batch weather data submissions", async function () {
      const batchSize = 100;
      const startTime = Date.now();
      
      // Submit weather data for many locations
      const submissionPromises = [];
      for (let i = 0; i < batchSize; i++) {
        submissionPromises.push(
          contracts.agroShieldOracle.connect(users.oracle).submitWeatherData(
            `${DEFAULT_ORACLE_DATA.location},${i}`,
            DEFAULT_ORACLE_DATA.timestamp,
            DEFAULT_ORACLE_DATA.rainfall,
            DEFAULT_ORACLE_DATA.temperature,
            DEFAULT_ORACLE_DATA.humidity
          )
        );
      }
      
      await Promise.all(submissionPromises);
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log(`Batch of ${batchSize} weather data submissions processed in ${duration}ms`);
      console.log(`Average time per submission: ${duration / batchSize}ms`);
      
      // Should complete within reasonable time (under 25 seconds)
      expect(duration).to.be.lt(25000);
      
      // Verify all submissions were recorded
      expect(await contracts.agroShieldOracle.weatherDataCount()).to.equal(batchSize);
    });

    it("Should measure performance of batch payouts", async function () {
      // Setup: Add liquidity, create policies, pay premiums, submit weather data
      await contracts.agroShieldPool.connect(users.investor1).deposit(ethers.utils.parseEther("100000"));
      
      const policyCount = 20;
      for (let i = 0; i < policyCount; i++) {
        await contracts.agroShieldPolicy.connect(users.farmer1).createPolicy(
          ethers.utils.parseEther("1000"),
          "30", // Low threshold for payout
          "90",
          `${DEFAULT_ORACLE_DATA.location},${i}`,
          `Policy ${i}`
        );
        
        await contracts.agroShieldPolicy.connect(users.farmer1).payPremium(i + 1, { value: ethers.utils.parseEther("100") });
        
        await contracts.agroShieldOracle.connect(users.oracle).submitWeatherData(
          `${DEFAULT_ORACLE_DATA.location},${i}`,
          DEFAULT_ORACLE_DATA.timestamp,
          "75", // Above threshold
          DEFAULT_ORACLE_DATA.temperature,
          DEFAULT_ORACLE_DATA.humidity
        );
      }
      
      const startTime = Date.now();
      
      // Trigger payouts for all policies
      const payoutPromises = [];
      for (let i = 1; i <= policyCount; i++) {
        payoutPromises.push(
          contracts.agroShieldOracle.connect(users.oracle).triggerPolicyPayout(i)
        );
      }
      
      await Promise.all(payoutPromises);
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log(`Batch of ${policyCount} payouts processed in ${duration}ms`);
      console.log(`Average time per payout: ${duration / policyCount}ms`);
      
      // Should complete within reasonable time (under 30 seconds)
      expect(duration).to.be.lt(30000);
      
      // Verify all payouts were processed
      for (let i = 1; i <= policyCount; i++) {
        const policy = await contracts.agroShieldPolicy.getPolicy(i);
        expect(policy.payoutProcessed).to.be.true;
      }
    });
  });

  describe("Query Performance", function () {
    it("Should measure performance of policy queries", async function () {
      // Create many policies
      const policyCount = 500;
      for (let i = 0; i < policyCount; i++) {
        await contracts.agroShieldPolicy.connect(users.farmer1).createPolicy(
          ethers.utils.parseEther("1000"),
          "50",
          "90",
          `${DEFAULT_ORACLE_DATA.location},${i}`,
          `Policy ${i}`
        );
      }
      
      const startTime = Date.now();
      
      // Query all policies
      const policyPromises = [];
      for (let i = 1; i <= policyCount; i++) {
        policyPromises.push(contracts.agroShieldPolicy.getPolicy(i));
      }
      
      const policies = await Promise.all(policyPromises);
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log(`Queried ${policyCount} policies in ${duration}ms`);
      console.log(`Average time per query: ${duration / policyCount}ms`);
      
      // Should complete within reasonable time (under 10 seconds)
      expect(duration).to.be.lt(10000);
      
      // Verify all policies were retrieved
      expect(policies.length).to.equal(policyCount);
      expect(policies.every(policy => policy.coverageAmount.eq(ethers.utils.parseEther("1000")))).to.be.true;
    });

    it("Should measure performance of weather data queries", async function () {
      // Submit many weather data points
      const dataCount = 500;
      for (let i = 0; i < dataCount; i++) {
        await contracts.agroShieldOracle.connect(users.oracle).submitWeatherData(
          `${DEFAULT_ORACLE_DATA.location},${i}`,
          DEFAULT_ORACLE_DATA.timestamp,
          DEFAULT_ORACLE_DATA.rainfall,
          DEFAULT_ORACLE_DATA.temperature,
          DEFAULT_ORACLE_DATA.humidity
        );
      }
      
      const startTime = Date.now();
      
      // Query all weather data
      const weatherPromises = [];
      for (let i = 0; i < dataCount; i++) {
        weatherPromises.push(contracts.agroShieldOracle.getWeatherData(`${DEFAULT_ORACLE_DATA.location},${i}`));
      }
      
      const weatherData = await Promise.all(weatherPromises);
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log(`Queried ${dataCount} weather data points in ${duration}ms`);
      console.log(`Average time per query: ${duration / dataCount}ms`);
      
      // Should complete within reasonable time (under 8 seconds)
      expect(duration).to.be.lt(8000);
      
      // Verify all data was retrieved
      expect(weatherData.length).to.equal(dataCount);
      expect(weatherData.every(data => data.verified)).to.be.true;
    });
  });

  describe("Memory Usage Performance", function () {
    it("Should measure memory usage during large operations", async function () {
      // Measure initial state
      const initialPolicyCount = await contracts.agroShieldPolicy.policiesCount();
      const initialWeatherCount = await contracts.agroShieldOracle.weatherDataCount();
      
      // Perform large operation
      const operationCount = 1000;
      const startTime = Date.now();
      
      for (let i = 0; i < operationCount; i++) {
        await contracts.agroShieldPolicy.connect(users.farmer1).createPolicy(
          ethers.utils.parseEther("1000"),
          "50",
          "90",
          `${DEFAULT_ORACLE_DATA.location},${i}`,
          `Policy ${i}`
        );
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Measure final state
      const finalPolicyCount = await contracts.agroShieldPolicy.policiesCount();
      const finalWeatherCount = await contracts.agroShieldOracle.weatherDataCount();
      
      console.log(`Created ${operationCount} policies in ${duration}ms`);
      console.log(`Policy count increased from ${initialPolicyCount} to ${finalPolicyCount}`);
      console.log(`Average time per policy: ${duration / operationCount}ms`);
      
      // Should complete within reasonable time (under 60 seconds)
      expect(duration).to.be.lt(60000);
      expect(finalPolicyCount.sub(initialPolicyCount)).to.equal(operationCount);
    });

    it("Should measure gas efficiency over time", async function () {
      const gasUsages = [];
      const operationCount = 50;
      
      for (let i = 0; i < operationCount; i++) {
        const tx = await contracts.agroShieldPolicy.connect(users.farmer1).createPolicy(
          ethers.utils.parseEther("1000"),
          "50",
          "90",
          `${DEFAULT_ORACLE_DATA.location},${i}`,
          `Policy ${i}`
        );
        const receipt = await tx.wait();
        gasUsages.push(receipt.gasUsed.toNumber());
      }
      
      // Calculate gas usage statistics
      const avgGas = gasUsages.reduce((a, b) => a + b, 0) / gasUsages.length;
      const maxGas = Math.max(...gasUsages);
      const minGas = Math.min(...gasUsages);
      const gasVariance = maxGas - minGas;
      
      console.log(`Gas usage statistics for ${operationCount} operations:`);
      console.log(`Average: ${avgGas}`);
      console.log(`Min: ${minGas}`);
      console.log(`Max: ${maxGas}`);
      console.log(`Variance: ${gasVariance}`);
      
      // Gas usage should be consistent (variance less than 20% of average)
      expect(gasVariance).to.be.lt(avgGas * 0.2);
    });
  });

  describe("Concurrency Performance", function () {
    it("Should handle concurrent read/write operations", async function () {
      const operationCount = 100;
      
      // Mix of reads and writes
      const operations = [];
      
      // Write operations (policy creation)
      for (let i = 0; i < operationCount / 2; i++) {
        operations.push(
          contracts.agroShieldPolicy.connect(users.farmer1).createPolicy(
            ethers.utils.parseEther("1000"),
            "50",
            "90",
            `${DEFAULT_ORACLE_DATA.location},${i}`,
            `Policy ${i}`
          )
        );
      }
      
      // Read operations (policy queries - will be executed after writes)
      for (let i = 1; i <= operationCount / 2; i++) {
        operations.push(contracts.agroShieldPolicy.getPolicy(i));
      }
      
      const startTime = Date.now();
      
      // Execute all operations
      await Promise.all(operations);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log(`Mixed ${operationCount} read/write operations completed in ${duration}ms`);
      console.log(`Average time per operation: ${duration / operationCount}ms`);
      
      // Should complete within reasonable time (under 25 seconds)
      expect(duration).to.be.lt(25000);
    });
  });

  describe("Scalability Tests", function () {
    it("Should measure performance scaling with data size", async function () {
      const testSizes = [10, 50, 100, 200];
      const performanceData = [];
      
      for (const size of testSizes) {
        const startTime = Date.now();
        
        // Create policies
        for (let i = 0; i < size; i++) {
          await contracts.agroShieldPolicy.connect(users.farmer1).createPolicy(
            ethers.utils.parseEther("1000"),
            "50",
            "90",
            `${DEFAULT_ORACLE_DATA.location},${i}`,
            `Policy ${i}`
          );
        }
        
        const endTime = Date.now();
        const duration = endTime - startTime;
        const avgTimePerPolicy = duration / size;
        
        performanceData.push({ size, duration, avgTimePerPolicy });
        
        console.log(`Size ${size}: ${duration}ms total, ${avgTimePerPolicy.toFixed(2)}ms per policy`);
        
        // Clean up for next test
        for (let i = 1; i <= size; i++) {
          await contracts.agroShieldPolicy.connect(users.owner).deactivatePolicy(i);
        }
      }
      
      // Performance should scale reasonably (not exponentially)
      const firstPerf = performanceData[0];
      const lastPerf = performanceData[performanceData.length - 1];
      const scalingFactor = lastPerf.avgTimePerPolicy / firstPerf.avgTimePerPolicy;
      
      console.log(`Scaling factor: ${scalingFactor.toFixed(2)}x`);
      
      // Should not scale more than 3x worse
      expect(scalingFactor).to.be.lt(3);
    });
  });
});
