import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { deployContracts, getTestUsers, setupUsersWithTokens, DEFAULT_POLICY_PARAMS, DEFAULT_ORACLE_DATA } from "./helpers";

describe("Advanced Integration Tests", function () {
  let contracts: any;
  let users: any;
  let advancedContracts: any;

  beforeEach(async function () {
    contracts = await deployContracts();
    users = await getTestUsers();
    await setupUsersWithTokens(users, contracts);
    
    // Deploy advanced contracts
    advancedContracts = await deployAdvancedContracts();
  });

  async function deployAdvancedContracts() {
    const PolicyMarketplace = await ethers.getContractFactory("PolicyMarketplace");
    const marketplace = await PolicyMarketplace.deploy(
      contracts.cUSDToken.address,
      contracts.agroShieldPolicy.address,
      contracts.agroShieldOracle.address
    );
    await marketplace.deployed();

    const DynamicPremiums = await ethers.getContractFactory("DynamicPremiums");
    const dynamicPremiums = await DynamicPremiums.deploy(contracts.agroShieldOracle.address);
    await dynamicPremiums.deployed();

    const MultiCropPolicy = await ethers.getContractFactory("MultiCropPolicy");
    const multiCropPolicy = await MultiCropPolicy.deploy(
      contracts.cUSDToken.address,
      contracts.agroShieldPolicy.address,
      contracts.agroShieldOracle.address,
      dynamicPremiums.address
    );
    await multiCropPolicy.deployed();

    const WeatherPrediction = await ethers.getContractFactory("WeatherPrediction");
    const weatherPrediction = await WeatherPrediction.deploy(
      contracts.agroShieldOracle.address,
      dynamicPremiums.address
    );
    await weatherPrediction.deployed();

    const InsurancePoolStaking = await ethers.getContractFactory("InsurancePoolStaking");
    const staking = await InsurancePoolStaking.deploy(
      contracts.cUSDToken.address,
      contracts.agroShieldPool.address,
      contracts.agroShieldPolicy.address
    );
    await staking.deployed();

    return {
      marketplace,
      dynamicPremiums,
      multiCropPolicy,
      weatherPrediction,
      staking
    };
  }

  describe("Complete Policy Lifecycle with Advanced Features", function () {
    it("Should handle end-to-end policy creation with dynamic premiums", async function () {
      // Calculate dynamic premium
      const premiumCalc = await advancedContracts.dynamicPremiums.calculateDynamicPremium(
        DEFAULT_POLICY_PARAMS.coverageAmount,
        DEFAULT_POLICY_PARAMS.location,
        "Maize",
        DEFAULT_POLICY_PARAMS.measurementPeriod,
        DEFAULT_POLICY_PARAMS.rainfallThreshold
      );

      expect(premiumCalc.finalPremium).to.be.gt(0);
      expect(premiumCalc.locationFactor).to.be.gt(0);
      expect(premiumCalc.cropFactor).to.be.gt(0);

      // Create policy with calculated premium
      await contracts.agroShieldPolicy.connect(users.farmer1).createPolicy(
        DEFAULT_POLICY_PARAMS.coverageAmount,
        DEFAULT_POLICY_PARAMS.rainfallThreshold,
        DEFAULT_POLICY_PARAMS.measurementPeriod,
        DEFAULT_POLICY_PARAMS.location,
        "Dynamic premium test policy"
      );

      const policy = await contracts.agroShieldPolicy.getPolicy(1);
      expect(policy.farmer).to.equal(users.farmer1.address);
      expect(policy.isActive).to.be.true;
    });

    it("Should handle multi-crop policy creation and payout", async function () {
      // Create multi-crop policy
      const crops = [
        {
          cropType: "Maize",
          coverageAmount: ethers.utils.parseEther("2000"),
          rainfallThreshold: 80,
          weight: 5000 // 50%
        },
        {
          cropType: "Coffee",
          coverageAmount: ethers.utils.parseEther("1500"),
          rainfallThreshold: 100,
          weight: 5000 // 50%
        }
      ];

      const policyId = await advancedContracts.multiCropPolicy.connect(users.farmer1).callStatic.createMultiCropPolicy(
        crops,
        DEFAULT_POLICY_PARAMS.location,
        DEFAULT_POLICY_PARAMS.measurementPeriod,
        "Multi-crop test policy"
      );

      await advancedContracts.multiCropPolicy.connect(users.farmer1).createMultiCropPolicy(
        crops,
        DEFAULT_POLICY_PARAMS.location,
        DEFAULT_POLICY_PARAMS.measurementPeriod,
        "Multi-crop test policy"
      );

      const multiCropPolicy = await advancedContracts.multiCropPolicy.getMultiCropPolicy(policyId);
      expect(multiCropPolicy.totalCoverage).to.equal(ethers.utils.parseEther("3500"));
      expect(multiCropPolicy.crops.length).to.equal(2);

      // Pay premium
      await advancedContracts.multiCropPolicy.connect(users.farmer1).payMultiCropPremium(policyId, {
        value: multiCropPolicy.totalPremium
      });

      // Submit weather data and trigger payout
      await contracts.agroShieldOracle.connect(users.oracle).submitWeatherData(
        DEFAULT_POLICY_PARAMS.location,
        DEFAULT_ORACLE_DATA.timestamp,
        "50", // Below thresholds
        DEFAULT_ORACLE_DATA.temperature,
        DEFAULT_ORACLE_DATA.humidity
      );

      await advancedContracts.multiCropPolicy.processAllCropPayouts(policyId);

      // Verify payouts
      const payoutStatus = await advancedContracts.multiCropPolicy.getAllCropPayoutStatus(policyId);
      expect(payoutStatus[0]).to.be.true; // Maize payout
      expect(payoutStatus[1]).to.be.true; // Coffee payout
    });

    it("Should handle policy marketplace trading", async function () {
      // Create and pay for a policy
      await contracts.agroShieldPolicy.connect(users.farmer1).createPolicy(
        DEFAULT_POLICY_PARAMS.coverageAmount,
        DEFAULT_POLICY_PARAMS.rainfallThreshold,
        DEFAULT_POLICY_PARAMS.measurementPeriod,
        DEFAULT_POLICY_PARAMS.location,
        "Marketplace test policy"
      );

      await contracts.agroShieldPolicy.connect(users.farmer1).payPremium(1, {
        value: ethers.utils.parseEther("100")
      });

      // List policy on marketplace
      const price = ethers.utils.parseEther("1200");
      await advancedContracts.marketplace.connect(users.farmer1).listPolicy(
        1,
        price,
        7 * 24 * 60 * 60 // 7 days
      );

      // Make an offer
      const offerAmount = ethers.utils.parseEther("1300");
      await advancedContracts.marketplace.connect(users.farmer2).makeOffer(1, offerAmount);

      // Accept offer
      await advancedContracts.marketplace.connect(users.farmer1).acceptOffer(1, 0);

      // Verify policy transfer
      const policy = await contracts.agroShieldPolicy.getPolicy(1);
      expect(policy.farmer).to.equal(users.farmer2.address);

      // Verify marketplace fees
      const expectedFee = offerAmount.mul(250).div(10000); // 2.5%
      const ownerBalance = await contracts.cUSDToken.balanceOf(users.owner.address);
      expect(ownerBalance).to.be.gte(expectedFee);
    });

    it("Should handle weather prediction integration", async function () {
      // Submit weather prediction
      await advancedContracts.weatherPrediction.connect(users.oracle).submitWeatherPrediction(
        DEFAULT_POLICY_PARAMS.location,
        Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days from now
        "60", // Predicted rainfall
        8000, // 80% confidence
        7, // 7 day prediction
        "WeatherAPI"
      );

      // Calculate premium with prediction
      const premiumAdjustment = await advancedContracts.weatherPrediction.calculatePremiumWithPrediction(
        DEFAULT_POLICY_PARAMS.coverageAmount,
        DEFAULT_POLICY_PARAMS.location,
        "Maize",
        DEFAULT_POLICY_PARAMS.measurementPeriod,
        DEFAULT_POLICY_PARAMS.rainfallThreshold
      );

      expect(premiumAdjustment.basePremium).to.be.gt(0);
      expect(premiumAdjustment.finalPremium).to.be.gt(0);
      expect(premiumAdjustment.confidence).to.be.gte(minConfidence);

      // Validate prediction
      await advancedContracts.weatherPrediction.connect(users.oracle).validatePrediction(
        DEFAULT_POLICY_PARAMS.location,
        0, // First prediction
        "55" // Actual rainfall
      );

      const accuracy = await advancedContracts.weatherPrediction.getPredictionAccuracy(DEFAULT_POLICY_PARAMS.location);
      expect(accuracy.totalPredictions).to.equal(1);
    });

    it("Should handle insurance pool staking", async function () {
      // Deposit to pool
      await contracts.agroShieldPool.connect(users.investor1).deposit(ethers.utils.parseEther("10000"));

      // Create stake position
      const stakeAmount = ethers.utils.parseEther("5000");
      const positionId = await advancedContracts.staking.connect(users.investor1).callStatic.createStakePosition(
        stakeAmount,
        2 // Silver tier
      );

      await advancedContracts.staking.connect(users.investor1).createStakePosition(
        stakeAmount,
        2 // Silver tier
      );

      // Verify stake position
      const position = await advancedContracts.staking.getStakePosition(users.investor1.address, positionId);
      expect(position.amount).to.equal(stakeAmount);
      expect(position.tier).to.equal(2);
      expect(position.isActive).to.be.true;

      // Calculate rewards
      const rewards = await advancedContracts.staking.calculateRewards(positionId, users.investor1.address);
      expect(rewards).to.be.gte(0);

      // Get staker stats
      const stats = await advancedContracts.staking.getStakerStats(users.investor1.address);
      expect(stats.totalStaked).to.equal(stakeAmount);
      expect(stats.activePositions).to.equal(1);
    });
  });

  describe("Complex Multi-User Scenarios", function () {
    it("Should handle concurrent policy creation and trading", async function () {
      // Multiple farmers create policies
      const policyPromises = [];
      for (let i = 0; i < 5; i++) {
        policyPromises.push(
          contracts.agroShieldPolicy.connect(users[`farmer${i + 1}`]).createPolicy(
            DEFAULT_POLICY_PARAMS.coverageAmount,
            DEFAULT_POLICY_PARAMS.rainfallThreshold,
            DEFAULT_POLICY_PARAMS.measurementPeriod,
            `${DEFAULT_POLICY_PARAMS.location},${i}`,
            `Concurrent policy ${i}`
          )
        );
      }

      await Promise.all(policyPromises);

      // Multiple investors deposit to pool
      const depositPromises = [];
      for (let i = 0; i < 3; i++) {
        depositPromises.push(
          contracts.agroShieldPool.connect(users[`investor${i + 1}`]).deposit(ethers.utils.parseEther("3000"))
        );
      }

      await Promise.all(depositPromises);

      // Verify pool liquidity
      const poolLiquidity = await contracts.agroShieldPool.totalLiquidity();
      expect(poolLiquidity).to.equal(ethers.utils.parseEther("9000"));

      // Farmers pay premiums
      for (let i = 1; i <= 5; i++) {
        await contracts.agroShieldPolicy.connect(users[`farmer${i}`]).payPremium(i, {
          value: ethers.utils.parseEther("100")
        });
      }

      // List some policies on marketplace
      await advancedContracts.marketplace.connect(users.farmer1).listPolicy(
        1,
        ethers.utils.parseEther("1200"),
        7 * 24 * 60 * 60
      );

      await advancedContracts.marketplace.connect(users.farmer2).listPolicy(
        2,
        ethers.utils.parseEther("1100"),
        7 * 24 * 60 * 60
      );

      // Buyers make offers
      await advancedContracts.marketplace.connect(users.investor1).makeOffer(
        1,
        ethers.utils.parseEther("1300")
      );

      await advancedContracts.marketplace.connect(users.investor2).makeOffer(
        2,
        ethers.utils.parseEther("1200")
      );

      // Accept offers
      await advancedContracts.marketplace.connect(users.farmer1).acceptOffer(1, 0);
      await advancedContracts.marketplace.connect(users.farmer2).acceptOffer(2, 0);

      // Verify policy transfers
      const policy1 = await contracts.agroShieldPolicy.getPolicy(1);
      const policy2 = await contracts.agroShieldPolicy.getPolicy(2);

      expect(policy1.farmer).to.equal(users.investor1.address);
      expect(policy2.farmer).to.equal(users.investor2.address);
    });

    it("Should handle weather events affecting multiple policies", async function () {
      // Create multiple policies
      const policyIds = [];
      for (let i = 0; i < 3; i++) {
        await contracts.agroShieldPolicy.connect(users.farmer1).createPolicy(
          DEFAULT_POLICY_PARAMS.coverageAmount,
          DEFAULT_POLICY_PARAMS.rainfallThreshold,
          DEFAULT_POLICY_PARAMS.measurementPeriod,
          `${DEFAULT_POLICY_PARAMS.location},${i}`,
          `Weather test policy ${i}`
        );
        policyIds.push(i + 1);
      }

      // Pay premiums
      for (const policyId of policyIds) {
        await contracts.agroShieldPolicy.connect(users.farmer1).payPremium(policyId, {
          value: ethers.utils.parseEther("100")
        });
      }

      // Ensure pool has sufficient liquidity
      await contracts.agroShieldPool.connect(users.investor1).deposit(ethers.utils.parseEther("10000"));

      // Submit weather data (drought conditions)
      await contracts.agroShieldOracle.connect(users.oracle).submitWeatherData(
        DEFAULT_POLICY_PARAMS.location,
        DEFAULT_ORACLE_DATA.timestamp,
        "40", // Below threshold
        DEFAULT_ORACLE_DATA.temperature,
        DEFAULT_ORACLE_DATA.humidity
      );

      // Trigger payouts for all policies
      for (const policyId of policyIds) {
        await contracts.agroShieldOracle.connect(users.oracle).triggerPolicyPayout(policyId);
      }

      // Verify all payouts were processed
      for (const policyId of policyIds) {
        const policy = await contracts.agroShieldPolicy.getPolicy(policyId);
        expect(policy.payoutTriggered).to.be.true;
        expect(policy.payoutAmount).to.equal(DEFAULT_POLICY_PARAMS.coverageAmount);
      }

      // Verify pool liquidity decreased
      const finalLiquidity = await contracts.agroShieldPool.totalLiquidity();
      const expectedLiquidity = ethers.utils.parseEther("10000").sub(
        ethers.utils.parseEther("3000") // 3 policies * 1000 cUSD each
      );
      expect(finalLiquidity).to.equal(expectedLiquidity);
    });
  });

  describe("Risk Management and Premium Optimization", function () {
    it("Should optimize premiums based on risk factors", async function () {
      // Test different locations with varying risk
      const locations = [
        "1.0152,35.0069", // Kitale - Medium risk
        "0.4236,37.0643", // Nyeri - High risk
        "-0.3684,35.2850"  // Kericho - Very high risk
      ];

      const premiums = [];
      for (const location of locations) {
        const calc = await advancedContracts.dynamicPremiums.calculateDynamicPremium(
          ethers.utils.parseEther("1000"),
          location,
          "Maize",
          90, // 90 days
          80
        );
        premiums.push(calc.finalPremium);
      }

      // Higher risk locations should have higher premiums
      expect(premiums[1]).to.be.gt(premiums[0]); // Nyeri > Kitale
      expect(premiums[2]).to.be.gt(premiums[1]); // Kericho > Nyeri
    });

    it("Should apply bundle discounts for multi-crop policies", async function () {
      // Calculate individual premiums
      const maizedPremium = await advancedContracts.dynamicPremiums.calculateDynamicPremium(
        ethers.utils.parseEther("1000"),
        DEFAULT_POLICY_PARAMS.location,
        "Maize",
        90,
        80
      );

      const coffeePremium = await advancedContracts.dynamicPremiums.calculateDynamicPremium(
        ethers.utils.parseEther("1000"),
        DEFAULT_POLICY_PARAMS.location,
        "Coffee",
        90,
        100
      );

      const individualTotal = maizedPremium.finalPremium.add(coffeePremium.finalPremium);

      // Calculate bundle premium
      const crops = [
        {
          cropType: "Maize",
          coverageAmount: ethers.utils.parseEther("1000"),
          rainfallThreshold: 80,
          weight: 5000
        },
        {
          cropType: "Coffee",
          coverageAmount: ethers.utils.parseEther("1000"),
          rainfallThreshold: 100,
          weight: 5000
        }
      ];

      const bundlePremium = await advancedContracts.multiCropPolicy.calculateBundlePremium(
        crops,
        DEFAULT_POLICY_PARAMS.location,
        90
      );

      // Bundle should be cheaper than individual
      expect(bundlePremium).to.be.lt(individualTotal);
    });
  });

  describe("System Stress and Edge Cases", function () {
    it("Should handle rapid successive operations", async function () {
      // Rapid policy creation
      const creationPromises = [];
      for (let i = 0; i < 10; i++) {
        creationPromises.push(
          contracts.agroShieldPolicy.connect(users.farmer1).createPolicy(
            ethers.utils.parseEther("500"),
            80,
            30,
            `${DEFAULT_POLICY_PARAMS.location},${i}`,
            `Rapid policy ${i}`
          )
        );
      }

      await Promise.all(creationPromises);

      // Rapid premium payments
      const premiumPromises = [];
      for (let i = 1; i <= 10; i++) {
        premiumPromises.push(
          contracts.agroShieldPolicy.connect(users.farmer1).payPremium(i, {
            value: ethers.utils.parseEther("50")
          })
        );
      }

      await Promise.all(premiumPromises);

      // Verify all policies are active and paid
      for (let i = 1; i <= 10; i++) {
        const policy = await contracts.agroShieldPolicy.getPolicy(i);
        expect(policy.isActive).to.be.true;
        expect(policy.isPaid).to.be.true;
      }
    });

    it("Should handle emergency scenarios", async function () {
      // Create policies and stakes
      await contracts.agroShieldPolicy.connect(users.farmer1).createPolicy(
        DEFAULT_POLICY_PARAMS.coverageAmount,
        DEFAULT_POLICY_PARAMS.rainfallThreshold,
        DEFAULT_POLICY_PARAMS.measurementPeriod,
        DEFAULT_POLICY_PARAMS.location,
        "Emergency test policy"
      );

      await advancedContracts.staking.connect(users.investor1).createStakePosition(
        ethers.utils.parseEther("5000"),
        2
      );

      // Emergency pause marketplace
      await advancedContracts.marketplace.connect(users.owner).emergencyPause();

      // Verify marketplace is paused
      const activeListings = await advancedContracts.marketplace.getActiveListings();
      expect(activeListings.length).to.equal(0);

      // Emergency withdraw from staking
      const balanceBefore = await contracts.cUSDToken.balanceOf(users.owner.address);
      await advancedContracts.staking.connect(users.owner).emergencyWithdraw();
      const balanceAfter = await contracts.cUSDToken.balanceOf(users.owner.address);

      expect(balanceAfter).to.be.gt(balanceBefore);
    });
  });

  describe("Cross-Contract Data Consistency", function () {
    it("Should maintain data consistency across contracts", async function () {
      // Create policy and track across contracts
      await contracts.agroShieldPolicy.connect(users.farmer1).createPolicy(
        DEFAULT_POLICY_PARAMS.coverageAmount,
        DEFAULT_POLICY_PARAMS.rainfallThreshold,
        DEFAULT_POLICY_PARAMS.measurementPeriod,
        DEFAULT_POLICY_PARAMS.location,
        "Consistency test policy"
      );

      // Verify policy exists in main contract
      const policy = await contracts.agroShieldPolicy.getPolicy(1);
      expect(policy.farmer).to.equal(users.farmer1.address);

      // List on marketplace and verify consistency
      await advancedContracts.marketplace.connect(users.farmer1).listPolicy(
        1,
        ethers.utils.parseEther("1200"),
        7 * 24 * 60 * 60
      );

      const listing = await advancedContracts.marketplace.getListing(1);
      expect(listing.policyId).to.equal(1);
      expect(listing.seller).to.equal(users.farmer1.address);

      // Transfer policy and verify consistency
      await advancedContracts.marketplace.connect(users.investor1).buyPolicy(1);

      const updatedPolicy = await contracts.agroShieldPolicy.getPolicy(1);
      expect(updatedPolicy.farmer).to.equal(users.investor1.address);

      const updatedListing = await advancedContracts.marketplace.getListing(1);
      expect(updatedListing.isActive).to.be.false;
    });
  });
});
