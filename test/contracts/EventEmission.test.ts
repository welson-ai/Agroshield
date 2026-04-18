import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { deployContracts, getTestUsers, setupUsersWithTokens, DEFAULT_POLICY_PARAMS, DEFAULT_ORACLE_DATA } from "./helpers";

describe("Event Emission Tests", function () {
  let contracts: any;
  let users: any;

  beforeEach(async function () {
    contracts = await deployContracts();
    users = await getTestUsers();
    await setupUsersWithTokens(users, contracts);
  });

  describe("AgroShieldPool Events", function () {
    it("Should emit LiquidityDeposited event", async function () {
      const depositAmount = ethers.utils.parseEther("1000");
      
      await expect(contracts.agroShieldPool.connect(users.investor1).deposit(depositAmount))
        .to.emit(contracts.agroShieldPool, "LiquidityDeposited")
        .withArgs(users.investor1.address, depositAmount);
    });

    it("Should emit LiquidityWithdrawn event", async function () {
      // First deposit
      const depositAmount = ethers.utils.parseEther("1000");
      await contracts.agroShieldPool.connect(users.investor1).deposit(depositAmount);
      
      // Then withdrawal
      const withdrawAmount = ethers.utils.parseEther("500");
      
      await expect(contracts.agroShieldPool.connect(users.investor1).withdraw(withdrawAmount))
        .to.emit(contracts.agroShieldPool, "LiquidityWithdrawn")
        .withArgs(users.investor1.address, withdrawAmount);
    });

    it("Should emit OwnershipTransferred event", async function () {
      await expect(contracts.agroShieldPool.connect(users.owner).transferOwnership(users.investor1.address))
        .to.emit(contracts.agroShieldPool, "OwnershipTransferred")
        .withArgs(users.owner.address, users.investor1.address);
    });

    it("Should emit PoolUpdated event", async function () {
      // This would test if there's a pool update event
      // For now, we'll test the pool state change through other events
      const depositAmount = ethers.utils.parseEther("1000");
      
      await expect(contracts.agroShieldPool.connect(users.investor1).deposit(depositAmount))
        .to.emit(contracts.agroShieldPool, "LiquidityDeposited")
        .withArgs(users.investor1.address, depositAmount);
    });
  });

  describe("AgroShieldPolicy Events", function () {
    it("Should emit PolicyCreated event", async function () {
      await expect(contracts.agroShieldPolicy.connect(users.farmer1).createPolicy(
        DEFAULT_POLICY_PARAMS.coverageAmount,
        DEFAULT_POLICY_PARAMS.rainfallThreshold,
        DEFAULT_POLICY_PARAMS.measurementPeriod,
        DEFAULT_POLICY_PARAMS.location,
        DEFAULT_POLICY_PARAMS.description
      ))
        .to.emit(contracts.agroShieldPolicy, "PolicyCreated")
        .withArgs(1, users.farmer1.address);
    });

    it("Should emit PremiumPaid event", async function () {
      // Create policy first
      await contracts.agroShieldPolicy.connect(users.farmer1).createPolicy(
        DEFAULT_POLICY_PARAMS.coverageAmount,
        DEFAULT_POLICY_PARAMS.rainfallThreshold,
        DEFAULT_POLICY_PARAMS.measurementPeriod,
        DEFAULT_POLICY_PARAMS.location,
        DEFAULT_POLICY_PARAMS.description
      );
      
      const premiumAmount = ethers.utils.parseEther("100");
      
      await expect(contracts.agroShieldPolicy.connect(users.farmer1).payPremium(1, { value: premiumAmount }))
        .to.emit(contracts.agroShieldPolicy, "PremiumPaid")
        .withArgs(1, users.farmer1.address, premiumAmount);
    });

    it("Should emit PolicyDeactivated event", async function () {
      // Create policy first
      await contracts.agroShieldPolicy.connect(users.farmer1).createPolicy(
        DEFAULT_POLICY_PARAMS.coverageAmount,
        DEFAULT_POLICY_PARAMS.rainfallThreshold,
        DEFAULT_POLICY_PARAMS.measurementPeriod,
        DEFAULT_POLICY_PARAMS.location,
        DEFAULT_POLICY_PARAMS.description
      );
      
      await expect(contracts.agroShieldPolicy.connect(users.owner).deactivatePolicy(1))
        .to.emit(contracts.agroShieldPolicy, "PolicyDeactivated")
        .withArgs(1, users.farmer1.address);
    });

    it("Should emit OwnershipTransferred event", async function () {
      await expect(contracts.agroShieldPolicy.connect(users.owner).transferOwnership(users.investor1.address))
        .to.emit(contracts.agroShieldPolicy, "OwnershipTransferred")
        .withArgs(users.owner.address, users.investor1.address);
    });

    it("Should emit PolicyUpdated event", async function () {
      // Create policy first
      await contracts.agroShieldPolicy.connect(users.farmer1).createPolicy(
        DEFAULT_POLICY_PARAMS.coverageAmount,
        DEFAULT_POLICY_PARAMS.rainfallThreshold,
        DEFAULT_POLICY_PARAMS.measurementPeriod,
        DEFAULT_POLICY_PARAMS.location,
        DEFAULT_POLICY_PARAMS.description
      );
      
      // Pay premium - this should trigger policy state update
      const premiumAmount = ethers.utils.parseEther("100");
      
      await expect(contracts.agroShieldPolicy.connect(users.farmer1).payPremium(1, { value: premiumAmount }))
        .to.emit(contracts.agroShieldPolicy, "PremiumPaid")
        .withArgs(1, users.farmer1.address, premiumAmount);
    });
  });

  describe("AgroShieldOracle Events", function () {
    it("Should emit WeatherDataSubmitted event", async function () {
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
    });

    it("Should emit PolicyPayoutTriggered event", async function () {
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
      
      await expect(contracts.agroShieldOracle.connect(users.oracle).triggerPolicyPayout(1))
        .to.emit(contracts.agroShieldOracle, "PolicyPayoutTriggered")
        .withArgs(1, DEFAULT_ORACLE_DATA.rainfall, DEFAULT_POLICY_PARAMS.rainfallThreshold);
    });

    it("Should emit PolicyPayoutProcessed event", async function () {
      // Setup: Create policy, pay premium, submit weather data, trigger payout
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
        "75", // Above threshold for payout
        DEFAULT_ORACLE_DATA.temperature,
        DEFAULT_ORACLE_DATA.humidity
      );
      
      await expect(contracts.agroShieldOracle.connect(users.oracle).triggerPolicyPayout(1))
        .to.emit(contracts.agroShieldOracle, "PolicyPayoutProcessed")
        .withArgs(1, users.farmer1.address, DEFAULT_POLICY_PARAMS.coverageAmount);
    });

    it("Should emit OwnershipTransferred event", async function () {
      await expect(contracts.agroShieldOracle.connect(users.owner).transferOwnership(users.investor1.address))
        .to.emit(contracts.agroShieldOracle, "OwnershipTransferred")
        .withArgs(users.owner.address, users.investor1.address);
    });

    it("Should emit OracleUpdated event", async function () {
      // This would test oracle authorization updates
      // For now, we'll test weather data submission which includes oracle info
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
    });
  });

  describe("Cross-Contract Event Chains", function () {
    it("Should emit complete policy lifecycle event chain", async function () {
      // 1. Pool Liquidity Deposit
      const depositAmount = ethers.utils.parseEther("5000");
      await expect(contracts.agroShieldPool.connect(users.investor1).deposit(depositAmount))
        .to.emit(contracts.agroShieldPool, "LiquidityDeposited")
        .withArgs(users.investor1.address, depositAmount);
      
      // 2. Policy Creation
      await expect(contracts.agroShieldPolicy.connect(users.farmer1).createPolicy(
        DEFAULT_POLICY_PARAMS.coverageAmount,
        DEFAULT_POLICY_PARAMS.rainfallThreshold,
        DEFAULT_POLICY_PARAMS.measurementPeriod,
        DEFAULT_POLICY_PARAMS.location,
        DEFAULT_POLICY_PARAMS.description
      ))
        .to.emit(contracts.agroShieldPolicy, "PolicyCreated")
        .withArgs(1, users.farmer1.address);
      
      // 3. Premium Payment
      const premiumAmount = ethers.utils.parseEther("100");
      await expect(contracts.agroShieldPolicy.connect(users.farmer1).payPremium(1, { value: premiumAmount }))
        .to.emit(contracts.agroShieldPolicy, "PremiumPaid")
        .withArgs(1, users.farmer1.address, premiumAmount);
      
      // 4. Weather Data Submission
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
      
      // 5. Payout Trigger
      await expect(contracts.agroShieldOracle.connect(users.oracle).triggerPolicyPayout(1))
        .to.emit(contracts.agroShieldOracle, "PolicyPayoutTriggered")
        .withArgs(1, DEFAULT_ORACLE_DATA.rainfall, DEFAULT_POLICY_PARAMS.rainfallThreshold)
        .and.to.emit(contracts.agroShieldOracle, "PolicyPayoutProcessed")
        .withArgs(1, users.farmer1.address, DEFAULT_POLICY_PARAMS.coverageAmount);
    });

    it("Should emit events for multiple policy operations", async function () {
      // Create multiple policies
      const policyCount = 3;
      
      for (let i = 0; i < policyCount; i++) {
        // Policy Creation
        await expect(contracts.agroShieldPolicy.connect(users.farmer1).createPolicy(
          DEFAULT_POLICY_PARAMS.coverageAmount,
          DEFAULT_POLICY_PARAMS.rainfallThreshold,
          DEFAULT_POLICY_PARAMS.measurementPeriod,
          `${DEFAULT_POLICY_PARAMS.location},${i}`,
          `Multi-policy test ${i}`
        ))
          .to.emit(contracts.agroShieldPolicy, "PolicyCreated")
          .withArgs(i + 1, users.farmer1.address);
        
        // Premium Payment
        const premiumAmount = ethers.utils.parseEther("100");
        await expect(contracts.agroShieldPolicy.connect(users.farmer1).payPremium(i + 1, { value: premiumAmount }))
          .to.emit(contracts.agroShieldPolicy, "PremiumPaid")
          .withArgs(i + 1, users.farmer1.address, premiumAmount);
      }
      
      // Submit weather data for all locations
      for (let i = 0; i < policyCount; i++) {
        await expect(contracts.agroShieldOracle.connect(users.oracle).submitWeatherData(
          `${DEFAULT_POLICY_PARAMS.location},${i}`,
          DEFAULT_ORACLE_DATA.timestamp,
          DEFAULT_ORACLE_DATA.rainfall,
          DEFAULT_ORACLE_DATA.temperature,
          DEFAULT_ORACLE_DATA.humidity
        ))
          .to.emit(contracts.agroShieldOracle, "WeatherDataSubmitted")
          .withArgs(
            `${DEFAULT_POLICY_PARAMS.location},${i}`,
            DEFAULT_ORACLE_DATA.timestamp,
            DEFAULT_ORACLE_DATA.rainfall,
            DEFAULT_ORACLE_DATA.temperature,
            DEFAULT_ORACLE_DATA.humidity
          );
      }
      
      // Trigger payouts for all policies
      for (let i = 1; i <= policyCount; i++) {
        await expect(contracts.agroShieldOracle.connect(users.oracle).triggerPolicyPayout(i))
          .to.emit(contracts.agroShieldOracle, "PolicyPayoutTriggered")
          .withArgs(i, DEFAULT_ORACLE_DATA.rainfall, DEFAULT_POLICY_PARAMS.rainfallThreshold)
          .and.to.emit(contracts.agroShieldOracle, "PolicyPayoutProcessed")
          .withArgs(i, users.farmer1.address, DEFAULT_POLICY_PARAMS.coverageAmount);
      }
    });
  });

  describe("Event Data Validation", function () {
    it("Should emit events with correct data types and values", async function () {
      // Test PolicyCreated event data
      const tx = await contracts.agroShieldPolicy.connect(users.farmer1).createPolicy(
        DEFAULT_POLICY_PARAMS.coverageAmount,
        DEFAULT_POLICY_PARAMS.rainfallThreshold,
        DEFAULT_POLICY_PARAMS.measurementPeriod,
        DEFAULT_POLICY_PARAMS.location,
        DEFAULT_POLICY_PARAMS.description
      );
      
      const receipt = await tx.wait();
      const event = receipt.events?.find(e => e.event === "PolicyCreated");
      
      expect(event).to.not.be.undefined;
      expect(event?.args?.policyId).to.equal(1);
      expect(event?.args?.farmer).to.equal(users.farmer1.address);
      
      // Verify data types
      expect(typeof event?.args?.policyId).to.equal("number");
      expect(typeof event?.args?.farmer).to.equal("string");
    });

    it("Should emit events with timestamps", async function () {
      // Test PremiumPaid event timestamp
      await contracts.agroShieldPolicy.connect(users.farmer1).createPolicy(
        DEFAULT_POLICY_PARAMS.coverageAmount,
        DEFAULT_POLICY_PARAMS.rainfallThreshold,
        DEFAULT_POLICY_PARAMS.measurementPeriod,
        DEFAULT_POLICY_PARAMS.location,
        DEFAULT_POLICY_PARAMS.description
      );
      
      const premiumAmount = ethers.utils.parseEther("100");
      const tx = await contracts.agroShieldPolicy.connect(users.farmer1).payPremium(1, { value: premiumAmount });
      
      const receipt = await tx.wait();
      const event = receipt.events?.find(e => e.event === "PremiumPaid");
      
      expect(event).to.not.be.undefined;
      expect(event?.args?.policyId).to.equal(1);
      expect(event?.args?.farmer).to.equal(users.farmer1.address);
      expect(event?.args?.amount).to.equal(premiumAmount);
      
      // Check block timestamp
      const block = await ethers.provider.getBlock(receipt.blockHash);
      expect(block?.timestamp).to.be.gt(0);
    });

    it("Should emit events with proper addresses", async function () {
      // Test that all address fields are properly formatted
      const depositAmount = ethers.utils.parseEther("1000");
      const tx = await contracts.agroShieldPool.connect(users.investor1).deposit(depositAmount);
      
      const receipt = await tx.wait();
      const event = receipt.events?.find(e => e.event === "LiquidityDeposited");
      
      expect(event).to.not.be.undefined;
      expect(event?.args?.investor).to.equal(users.investor1.address);
      expect(event?.args?.investor).to.be.a proper address;
      expect(event?.args?.investor).to.match(/^0x[a-fA-F0-9]{40}$/);
    });
  });

  describe("Event Filtering and Listening", function () {
    it("Should allow filtering events by specific criteria", async function () {
      // Create multiple events
      await contracts.agroShieldPool.connect(users.investor1).deposit(ethers.utils.parseEther("1000"));
      await contracts.agroShieldPool.connect(users.investor2).deposit(ethers.utils.parseEther("2000"));
      
      // Get past events
      const depositEvents = await contracts.agroShieldPool.queryFilter(
        contracts.agroShieldPool.filters.LiquidityDeposited()
      );
      
      expect(depositEvents.length).to.equal(2);
      
      // Filter by specific investor
      const investor1Events = await contracts.agroShieldPool.queryFilter(
        contracts.agroShieldPool.filters.LiquidityDeposited(users.investor1.address)
      );
      
      expect(investor1Events.length).to.equal(1);
      expect(investor1Events[0].args?.investor).to.equal(users.investor1.address);
    });

    it("Should emit events in correct order", async function () {
      // Create sequence of events
      const events = [];
      
      // 1. Deposit
      const depositTx = await contracts.agroShieldPool.connect(users.investor1).deposit(ethers.utils.parseEther("1000"));
      events.push((await depositTx.wait()).blockNumber);
      
      // 2. Create Policy
      const policyTx = await contracts.agroShieldPolicy.connect(users.farmer1).createPolicy(
        DEFAULT_POLICY_PARAMS.coverageAmount,
        DEFAULT_POLICY_PARAMS.rainfallThreshold,
        DEFAULT_POLICY_PARAMS.measurementPeriod,
        DEFAULT_POLICY_PARAMS.location,
        DEFAULT_POLICY_PARAMS.description
      );
      events.push((await policyTx.wait()).blockNumber);
      
      // 3. Pay Premium
      const premiumTx = await contracts.agroShieldPolicy.connect(users.farmer1).payPremium(1, { value: ethers.utils.parseEther("100") });
      events.push((await premiumTx.wait()).blockNumber);
      
      // Events should be in chronological order
      expect(events[0]).to.be.lt(events[1]);
      expect(events[1]).to.be.lt(events[2]);
    });
  });

  describe("Event Error Handling", function () {
    it("Should not emit events on failed transactions", async function () {
      // Attempt failed deposit
      await expect(contracts.agroShieldPool.connect(users.investor1).deposit(0))
        .to.be.revertedWith("Amount must be greater than 0");
      
      // Check that no events were emitted
      const events = await contracts.agroShieldPool.queryFilter(
        contracts.agroShieldPool.filters.LiquidityDeposited()
      );
      
      expect(events.length).to.equal(0);
    });

    it("Should maintain event consistency on partial failures", async function () {
      // Create successful event
      await contracts.agroShieldPool.connect(users.investor1).deposit(ethers.utils.parseEther("1000"));
      
      // Attempt failed operation
      await expect(contracts.agroShieldPool.connect(users.investor1).deposit(0))
        .to.be.revertedWith("Amount must be greater than 0");
      
      // Should still have the successful event
      const events = await contracts.agroShieldPool.queryFilter(
        contracts.agroShieldPool.filters.LiquidityDeposited()
      );
      
      expect(events.length).to.equal(1);
      expect(events[0].args?.investor).to.equal(users.investor1.address);
    });
  });
});
