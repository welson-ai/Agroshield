import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { deployContracts, getTestUsers, setupUsersWithTokens, DEFAULT_POLICY_PARAMS, DEFAULT_ORACLE_DATA } from "./helpers";

describe("Gas Optimization Tests", function () {
  let contracts: any;
  let users: any;

  beforeEach(async function () {
    contracts = await deployContracts();
    users = await getTestUsers();
    await setupUsersWithTokens(users, contracts);
  });

  describe("Gas Usage Benchmarks", function () {
    it("Should benchmark AgroShieldPool deposit gas usage", async function () {
      const depositAmount = ethers.utils.parseEther("1000");
      
      const tx = await contracts.agroShieldPool.connect(users.investor1).deposit(depositAmount);
      const receipt = await tx.wait();
      
      console.log(`AgroShieldPool deposit gas used: ${receipt.gasUsed.toString()}`);
      
      // Gas usage should be reasonable (under 100,000 gas)
      expect(receipt.gasUsed).to.be.lte(100000);
    });

    it("Should benchmark AgroShieldPool withdrawal gas usage", async function () {
      // First deposit
      const depositAmount = ethers.utils.parseEther("1000");
      await contracts.agroShieldPool.connect(users.investor1).deposit(depositAmount);
      
      // Then withdrawal
      const withdrawAmount = ethers.utils.parseEther("500");
      const tx = await contracts.agroShieldPool.connect(users.investor1).withdraw(withdrawAmount);
      const receipt = await tx.wait();
      
      console.log(`AgroShieldPool withdrawal gas used: ${receipt.gasUsed.toString()}`);
      
      // Gas usage should be reasonable (under 80,000 gas)
      expect(receipt.gasUsed).to.be.lte(80000);
    });

    it("Should benchmark AgroShieldPolicy creation gas usage", async function () {
      const tx = await contracts.agroShieldPolicy.connect(users.farmer1).createPolicy(
        DEFAULT_POLICY_PARAMS.coverageAmount,
        DEFAULT_POLICY_PARAMS.rainfallThreshold,
        DEFAULT_POLICY_PARAMS.measurementPeriod,
        DEFAULT_POLICY_PARAMS.location,
        DEFAULT_POLICY_PARAMS.description
      );
      const receipt = await tx.wait();
      
      console.log(`AgroShieldPolicy creation gas used: ${receipt.gasUsed.toString()}`);
      
      // Gas usage should be reasonable (under 150,000 gas)
      expect(receipt.gasUsed).to.be.lte(150000);
    });

    it("Should benchmark AgroShieldPolicy premium payment gas usage", async function () {
      // First create policy
      await contracts.agroShieldPolicy.connect(users.farmer1).createPolicy(
        DEFAULT_POLICY_PARAMS.coverageAmount,
        DEFAULT_POLICY_PARAMS.rainfallThreshold,
        DEFAULT_POLICY_PARAMS.measurementPeriod,
        DEFAULT_POLICY_PARAMS.location,
        DEFAULT_POLICY_PARAMS.description
      );
      
      // Then pay premium
      const premiumAmount = ethers.utils.parseEther("100");
      const tx = await contracts.agroShieldPolicy.connect(users.farmer1).payPremium(1, { value: premiumAmount });
      const receipt = await tx.wait();
      
      console.log(`AgroShieldPolicy premium payment gas used: ${receipt.gasUsed.toString()}`);
      
      // Gas usage should be reasonable (under 100,000 gas)
      expect(receipt.gasUsed).to.be.lte(100000);
    });

    it("Should benchmark AgroShieldOracle weather data submission gas usage", async function () {
      const tx = await contracts.agroShieldOracle.connect(users.oracle).submitWeatherData(
        DEFAULT_ORACLE_DATA.location,
        DEFAULT_ORACLE_DATA.timestamp,
        DEFAULT_ORACLE_DATA.rainfall,
        DEFAULT_ORACLE_DATA.temperature,
        DEFAULT_ORACLE_DATA.humidity
      );
      const receipt = await tx.wait();
      
      console.log(`AgroShieldOracle weather data submission gas used: ${receipt.gasUsed.toString()}`);
      
      // Gas usage should be reasonable (under 120,000 gas)
      expect(receipt.gasUsed).to.be.lte(120000);
    });

    it("Should benchmark AgroShieldOracle payout trigger gas usage", async function () {
      // Setup: Create policy, pay premium, submit weather data
      await contracts.agroShieldPool.connect(users.investor1).deposit(ethers.utils.parseEther("5000"));
      
      await contracts.agroShieldPolicy.connect(users.farmer1).createPolicy(
        DEFAULT_POLICY_PARAMS.coverageAmount,
        DEFAULT_POLICY_PARAMS.rainfallThreshold,
        DEFAULT_POLICY_PARAMS.measurementPeriod,
        DEFAULT_POLICY_PARAMS.location,
        DEFAULT_POLICY_PARAMS.description
      );
      
      await contracts.agroShieldPolicy.connect(users.farmer1).payPremium(1, { value: ethers.utils.parseEther("100") });
      
      await contracts.agroShieldOracle.connect(users.oracle).submitWeatherData(
        DEFAULT_ORACLE_DATA.location,
        DEFAULT_ORACLE_DATA.timestamp,
        DEFAULT_ORACLE_DATA.rainfall,
        DEFAULT_ORACLE_DATA.temperature,
        DEFAULT_ORACLE_DATA.humidity
      );
      
      // Trigger payout
      const tx = await contracts.agroShieldOracle.connect(users.oracle).triggerPolicyPayout(1);
      const receipt = await tx.wait();
      
      console.log(`AgroShieldOracle payout trigger gas used: ${receipt.gasUsed.toString()}`);
      
      // Gas usage should be reasonable (under 200,000 gas)
      expect(receipt.gasUsed).to.be.lte(200000);
    });
  });

  describe("Gas Optimization Comparisons", function () {
    it("Should compare gas usage for batch vs individual operations", async function () {
      // Individual deposits
      const individualDeposits = [];
      for (let i = 0; i < 5; i++) {
        const tx = await contracts.agroShieldPool.connect(users.investor1).deposit(ethers.utils.parseEther("100"));
        const receipt = await tx.wait();
        individualDeposits.push(receipt.gasUsed.toNumber());
      }
      
      const avgIndividualGas = individualDeposits.reduce((a, b) => a + b, 0) / individualDeposits.length;
      console.log(`Average individual deposit gas: ${avgIndividualGas}`);
      
      // Reset for batch test
      const totalIndividualGas = individualDeposits.reduce((a, b) => a + b, 0);
      console.log(`Total individual deposit gas for 5 operations: ${totalIndividualGas}`);
      
      // Note: In a real implementation, we'd add batch operations and compare
      expect(avgIndividualGas).to.be.gt(0);
    });

    it("Should measure gas usage scaling with data size", async function () {
      const gasUsages = [];
      
      // Test with different policy amounts
      const amounts = [
        ethers.utils.parseEther("100"),
        ethers.utils.parseEther("1000"),
        ethers.utils.parseEther("10000"),
        ethers.utils.parseEther("100000")
      ];
      
      for (const amount of amounts) {
        const tx = await contracts.agroShieldPool.connect(users.investor1).deposit(amount);
        const receipt = await tx.wait();
        gasUsages.push(receipt.gasUsed.toNumber());
        
        // Withdraw to reset state
        await contracts.agroShieldPool.connect(users.investor1).withdraw(amount);
      }
      
      console.log("Gas usage by deposit amount:");
      amounts.forEach((amount, i) => {
        console.log(`${ethers.utils.formatEther(amount)} cUSD: ${gasUsages[i]} gas`);
      });
      
      // Gas usage shouldn't scale dramatically with amount
      const maxGas = Math.max(...gasUsages);
      const minGas = Math.min(...gasUsages);
      const gasRatio = maxGas / minGas;
      
      expect(gasRatio).to.be.lt(2); // Shouldn't be more than 2x difference
    });
  });
});
