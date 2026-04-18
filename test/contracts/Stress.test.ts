import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { deployContracts, getTestUsers, setupUsersWithTokens, DEFAULT_POLICY_PARAMS, DEFAULT_ORACLE_DATA } from "./helpers";

describe("Stress Tests", function () {
  let contracts: any;
  let users: any;

  beforeEach(async function () {
    contracts = await deployContracts();
    users = await getTestUsers();
    await setupUsersWithTokens(users, contracts);
  });

  describe("High Volume Operations", function () {
    it("Should handle 100+ concurrent policy creations", async function () {
      const policyCount = 100;
      const policyPromises = [];
      
      // Create many policies concurrently
      for (let i = 0; i < policyCount; i++) {
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
      
      // Execute all promises
      await Promise.all(policyPromises);
      
      // Verify all policies were created
      expect(await contracts.agroShieldPolicy.policiesCount()).to.equal(policyCount);
      expect(await contracts.agroShieldPolicy.activePoliciesCount()).to.equal(policyCount);
    });

    it("Should handle 100+ concurrent deposits", async function () {
      const depositCount = 100;
      const depositAmount = ethers.utils.parseEther("100");
      const depositPromises = [];
      
      // Create many deposits concurrently
      for (let i = 0; i < depositCount; i++) {
        depositPromises.push(
          contracts.agroShieldPool.connect(users.investor1).deposit(depositAmount)
        );
      }
      
      // Execute all promises
      await Promise.all(depositPromises);
      
      // Verify total liquidity
      const expectedTotal = depositAmount.mul(depositCount);
      expect(await contracts.agroShieldPool.totalLiquidity()).to.equal(expectedTotal);
    });

    it("Should handle 100+ concurrent premium payments", async function () {
      // First create 100 policies
      const policyCount = 100;
      const policyPromises = [];
      
      for (let i = 0; i < policyCount; i++) {
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
      
      // Now pay premiums for all policies
      const premiumAmount = ethers.utils.parseEther("100");
      const premiumPromises = [];
      
      for (let i = 1; i <= policyCount; i++) {
        premiumPromises.push(
          contracts.agroShieldPolicy.connect(users.farmer1).payPremium(i, { value: premiumAmount })
        );
      }
      
      // Execute all premium payments
      await Promise.all(premiumPromises);
      
      // Verify all premiums were paid
      for (let i = 1; i <= policyCount; i++) {
        const policy = await contracts.agroShieldPolicy.getPolicy(i);
        expect(policy.isPaid).to.be.true;
      }
    });

    it("Should handle 100+ concurrent weather data submissions", async function () {
      const submissionCount = 100;
      const submissionPromises = [];
      
      // Submit weather data for many locations
      for (let i = 0; i < submissionCount; i++) {
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
      
      // Execute all submissions
      await Promise.all(submissionPromises);
      
      // Verify all submissions were recorded
      expect(await contracts.agroShieldOracle.weatherDataCount()).to.equal(submissionCount);
    });
  });

  describe("Large Number Handling", function () {
    it("Should handle very large coverage amounts", async function () {
      const largeAmount = ethers.utils.parseEther("1000000"); // 1M cUSD
      
      // Add sufficient liquidity
      await contracts.agroShieldPool.connect(users.investor1).deposit(largeAmount.mul(2));
      
      // Create policy with large coverage
      await contracts.agroShieldPolicy.connect(users.farmer1).createPolicy(
        largeAmount,
        "50",
        "90",
        DEFAULT_POLICY_PARAMS.location,
        "Large coverage policy"
      );
      
      // Pay premium (10% of coverage)
      const premiumAmount = largeAmount.div(10);
      await contracts.agroShieldPolicy.connect(users.farmer1).payPremium(1, { value: premiumAmount });
      
      // Verify policy was created correctly
      const policy = await contracts.agroShieldPolicy.getPolicy(1);
      expect(policy.coverageAmount).to.equal(largeAmount);
      expect(policy.isPaid).to.be.true;
    });

    it("Should handle very small amounts", async function () {
      const smallAmount = ethers.utils.parseEther("0.001"); // 0.001 cUSD
      
      // Create policy with small coverage
      await contracts.agroShieldPolicy.connect(users.farmer1).createPolicy(
        smallAmount,
        "50",
        "90",
        DEFAULT_POLICY_PARAMS.location,
        "Small coverage policy"
      );
      
      // Pay premium (10% of coverage)
      const premiumAmount = smallAmount.div(10);
      await contracts.agroShieldPolicy.connect(users.farmer1).payPremium(1, { value: premiumAmount });
      
      // Verify policy was created correctly
      const policy = await contracts.agroShieldPolicy.getPolicy(1);
      expect(policy.coverageAmount).to.equal(smallAmount);
      expect(policy.isPaid).to.be.true;
    });

    it("Should handle long measurement periods", async function () {
      const longPeriod = "3650"; // 10 years in days
      
      // Create policy with long measurement period
      await contracts.agroShieldPolicy.connect(users.farmer1).createPolicy(
        ethers.utils.parseEther("1000"),
        "50",
        longPeriod,
        DEFAULT_POLICY_PARAMS.location,
        "Long period policy"
      );
      
      // Verify policy was created correctly
      const policy = await contracts.agroShieldPolicy.getPolicy(1);
      expect(policy.measurementPeriod).to.equal(longPeriod);
    });
  });

  describe("Memory and Storage Stress", function () {
    it("Should handle storage of many active policies", async function () {
      const policyCount = 1000;
      
      // Create many policies
      for (let i = 0; i < policyCount; i++) {
        await contracts.agroShieldPolicy.connect(users.farmer1).createPolicy(
          ethers.utils.parseEther("1000"),
          "50",
          "90",
          `${DEFAULT_ORACLE_DATA.location},${i}`,
          `Policy ${i}`
        );
      }
      
      // Verify all policies are stored and accessible
      expect(await contracts.agroShieldPolicy.policiesCount()).to.equal(policyCount);
      
      // Test random access to policies
      const randomIndices = [1, 100, 500, 999];
      for (const index of randomIndices) {
        const policy = await contracts.agroShieldPolicy.getPolicy(index);
        expect(policy.coverageAmount).to.equal(ethers.utils.parseEther("1000"));
        expect(policy.isActive).to.be.true;
      }
    });

    it("Should handle storage of many weather data points", async function () {
      const dataCount = 1000;
      
      // Submit weather data for many locations
      for (let i = 0; i < dataCount; i++) {
        await contracts.agroShieldOracle.connect(users.oracle).submitWeatherData(
          `${DEFAULT_ORACLE_DATA.location},${i}`,
          DEFAULT_ORACLE_DATA.timestamp,
          (50 + i).toString(), // Varying rainfall
          DEFAULT_ORACLE_DATA.temperature,
          DEFAULT_ORACLE_DATA.humidity
        );
      }
      
      // Verify all data points are stored
      expect(await contracts.agroShieldOracle.weatherDataCount()).to.equal(dataCount);
      
      // Test random access to weather data
      const randomLocations = [`${DEFAULT_ORACLE_DATA.location},1`, `${DEFAULT_ORACLE_DATA.location},500`, `${DEFAULT_ORACLE_DATA.location},999`];
      for (const location of randomLocations) {
        const weatherData = await contracts.agroShieldOracle.getWeatherData(location);
        expect(weatherData.verified).to.be.true;
        expect(weatherData.rainfall).to.not.equal("0");
      }
    });
  });

  describe("Gas Limit Stress", function () {
    it("Should handle operations near gas limits", async function () {
      // Create complex policy with long description
      const longDescription = "A".repeat(1000); // 1000 character description
      
      const tx = await contracts.agroShieldPolicy.connect(users.farmer1).createPolicy(
        ethers.utils.parseEther("1000"),
        "50",
        "90",
        DEFAULT_POLICY_PARAMS.location,
        longDescription
      );
      
      const receipt = await tx.wait();
      
      // Should complete within reasonable gas limits
      expect(receipt.gasUsed).to.be.lt(300000);
      
      // Verify policy was created correctly
      const policy = await contracts.agroShieldPolicy.getPolicy(1);
      expect(policy.description).to.equal(longDescription);
    });

    it("Should handle batch operations efficiently", async function () {
      // Add large liquidity
      await contracts.agroShieldPool.connect(users.investor1).deposit(ethers.utils.parseEther("1000000"));
      
      // Create and pay for many policies
      const policyCount = 50;
      const totalGasUsed = [];
      
      for (let i = 0; i < policyCount; i++) {
        // Create policy
        const createTx = await contracts.agroShieldPolicy.connect(users.farmer1).createPolicy(
          ethers.utils.parseEther("1000"),
          "50",
          "90",
          `${DEFAULT_ORACLE_DATA.location},${i}`,
          `Policy ${i}`
        );
        const createReceipt = await createTx.wait();
        
        // Pay premium
        const premiumTx = await contracts.agroShieldPolicy.connect(users.farmer1).payPremium(i + 1, { value: ethers.utils.parseEther("100") });
        const premiumReceipt = await premiumTx.wait();
        
        totalGasUsed.push(createReceipt.gasUsed.toNumber() + premiumReceipt.gasUsed.toNumber());
      }
      
      // Calculate average gas usage
      const avgGasUsed = totalGasUsed.reduce((a, b) => a + b, 0) / totalGasUsed.length;
      console.log(`Average gas per policy (create + premium): ${avgGasUsed}`);
      
      // Should be efficient
      expect(avgGasUsed).to.be.lt(250000);
    });
  });

  describe("Time-Based Stress", function () {
    it("Should handle rapid time progression", async function () {
      // Create policy
      await contracts.agroShieldPolicy.connect(users.farmer1).createPolicy(
        ethers.utils.parseEther("1000"),
        "50",
        "90",
        DEFAULT_POLICY_PARAMS.location,
        "Time stress policy"
      );
      
      // Pay premium
      await contracts.agroShieldPolicy.connect(users.farmer1).payPremium(1, { value: ethers.utils.parseEther("100") });
      
      // Rapidly advance time and submit weather data
      for (let i = 0; i < 10; i++) {
        // Advance time by 10 days
        await ethers.provider.send("evm_increaseTime", [10 * 24 * 60 * 60]);
        await ethers.provider.send("evm_mine", []);
        
        // Submit weather data
        await contracts.agroShieldOracle.connect(users.oracle).submitWeatherData(
          DEFAULT_ORACLE_DATA.location,
          Math.floor(Date.now() / 1000).toString(),
          DEFAULT_ORACLE_DATA.rainfall,
          DEFAULT_ORACLE_DATA.temperature,
          DEFAULT_ORACLE_DATA.humidity
        );
      }
      
      // Policy should still be active
      const policy = await contracts.agroShieldPolicy.getPolicy(1);
      expect(policy.isActive).to.be.true;
    });
  });
});
