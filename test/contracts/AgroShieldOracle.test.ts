import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { deployContracts, getTestUsers, setupUsersWithTokens, DEFAULT_ORACLE_DATA } from "./helpers";

describe("AgroShieldOracle", function () {
  let contracts: any;
  let users: any;

  beforeEach(async function () {
    contracts = await deployContracts();
    users = await getTestUsers();
    await setupUsersWithTokens(users, contracts);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await contracts.agroShieldOracle.owner()).to.equal(users.owner.address);
    });

    it("Should initialize with zero weather data submissions", async function () {
      expect(await contracts.agroShieldOracle.weatherDataCount()).to.equal(0);
    });

    it("Should initialize with zero verified locations", async function () {
      expect(await contracts.agroShieldOracle.verifiedLocationsCount()).to.equal(0);
    });

    it("Should initialize with empty weather data mapping", async function () {
      const location = DEFAULT_ORACLE_DATA.location;
      const weatherData = await contracts.agroShieldOracle.getWeatherData(location);
      
      expect(weatherData.rainfall).to.equal(0);
      expect(weatherData.temperature).to.equal(0);
      expect(weatherData.humidity).to.equal(0);
      expect(weatherData.timestamp).to.equal(0);
      expect(weatherData.verified).to.be.false;
    });
  });

  describe("Weather Data Submission", function () {
    it("Should allow oracle to submit weather data", async function () {
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
      
      expect(await contracts.agroShieldOracle.weatherDataCount()).to.equal(1);
    });

    it("Should reject weather data submission from non-oracle", async function () {
      await expect(contracts.agroShieldOracle.connect(users.farmer1).submitWeatherData(
        DEFAULT_ORACLE_DATA.location,
        DEFAULT_ORACLE_DATA.timestamp,
        DEFAULT_ORACLE_DATA.rainfall,
        DEFAULT_ORACLE_DATA.temperature,
        DEFAULT_ORACLE_DATA.humidity
      ))
        .to.be.revertedWith("Only authorized oracle can submit weather data");
    });

    it("Should reject empty location", async function () {
      await expect(contracts.agroShieldOracle.connect(users.oracle).submitWeatherData(
        "",
        DEFAULT_ORACLE_DATA.timestamp,
        DEFAULT_ORACLE_DATA.rainfall,
        DEFAULT_ORACLE_DATA.temperature,
        DEFAULT_ORACLE_DATA.humidity
      ))
        .to.be.revertedWith("Location cannot be empty");
    });

    it("Should reject zero timestamp", async function () {
      await expect(contracts.agroShieldOracle.connect(users.oracle).submitWeatherData(
        DEFAULT_ORACLE_DATA.location,
        "0",
        DEFAULT_ORACLE_DATA.rainfall,
        DEFAULT_ORACLE_DATA.temperature,
        DEFAULT_ORACLE_DATA.humidity
      ))
        .to.be.revertedWith("Timestamp must be greater than 0");
    });

    it("Should store weather data correctly", async function () {
      await contracts.agroShieldOracle.connect(users.oracle).submitWeatherData(
        DEFAULT_ORACLE_DATA.location,
        DEFAULT_ORACLE_DATA.timestamp,
        DEFAULT_ORACLE_DATA.rainfall,
        DEFAULT_ORACLE_DATA.temperature,
        DEFAULT_ORACLE_DATA.humidity
      );
      
      const weatherData = await contracts.agroShieldOracle.getWeatherData(DEFAULT_ORACLE_DATA.location);
      
      expect(weatherData.rainfall).to.equal(DEFAULT_ORACLE_DATA.rainfall);
      expect(weatherData.temperature).to.equal(DEFAULT_ORACLE_DATA.temperature);
      expect(weatherData.humidity).to.equal(DEFAULT_ORACLE_DATA.humidity);
      expect(weatherData.timestamp).to.equal(DEFAULT_ORACLE_DATA.timestamp);
      expect(weatherData.verified).to.be.true;
    });

    it("Should handle multiple weather data submissions", async function () {
      const location1 = DEFAULT_ORACLE_DATA.location;
      const location2 = "1.5,35.5";
      
      await contracts.agroShieldOracle.connect(users.oracle).submitWeatherData(
        location1,
        DEFAULT_ORACLE_DATA.timestamp,
        DEFAULT_ORACLE_DATA.rainfall,
        DEFAULT_ORACLE_DATA.temperature,
        DEFAULT_ORACLE_DATA.humidity
      );
      
      await contracts.agroShieldOracle.connect(users.oracle).submitWeatherData(
        location2,
        DEFAULT_ORACLE_DATA.timestamp,
        "80",
        "30",
        "70"
      );
      
      expect(await contracts.agroShieldOracle.weatherDataCount()).to.equal(2);
      
      const weatherData1 = await contracts.agroShieldOracle.getWeatherData(location1);
      const weatherData2 = await contracts.agroShieldOracle.getWeatherData(location2);
      
      expect(weatherData1.rainfall).to.equal(DEFAULT_ORACLE_DATA.rainfall);
      expect(weatherData2.rainfall).to.equal("80");
    });

    it("Should update existing weather data", async function () {
      const location = DEFAULT_ORACLE_DATA.location;
      
      // First submission
      await contracts.agroShieldOracle.connect(users.oracle).submitWeatherData(
        location,
        DEFAULT_ORACLE_DATA.timestamp,
        DEFAULT_ORACLE_DATA.rainfall,
        DEFAULT_ORACLE_DATA.temperature,
        DEFAULT_ORACLE_DATA.humidity
      );
      
      // Second submission with updated data
      const newTimestamp = (parseInt(DEFAULT_ORACLE_DATA.timestamp) + 3600).toString();
      await contracts.agroShieldOracle.connect(users.oracle).submitWeatherData(
        location,
        newTimestamp,
        "90",
        "35",
        "80"
      );
      
      expect(await contracts.agroShieldOracle.weatherDataCount()).to.equal(1);
      
      const weatherData = await contracts.agroShieldOracle.getWeatherData(location);
      expect(weatherData.rainfall).to.equal("90");
      expect(weatherData.temperature).to.equal("35");
      expect(weatherData.humidity).to.equal("80");
      expect(weatherData.timestamp).to.equal(newTimestamp);
    });

    it("Should track submission timestamp correctly", async function () {
      const beforeTimestamp = await ethers.provider.getBlock("latest").then(block => block.timestamp);
      
      await contracts.agroShieldOracle.connect(users.oracle).submitWeatherData(
        DEFAULT_ORACLE_DATA.location,
        DEFAULT_ORACLE_DATA.timestamp,
        DEFAULT_ORACLE_DATA.rainfall,
        DEFAULT_ORACLE_DATA.temperature,
        DEFAULT_ORACLE_DATA.humidity
      );
      
      const weatherData = await contracts.agroShieldOracle.getWeatherData(DEFAULT_ORACLE_DATA.location);
      expect(weatherData.submittedAt).to.be.gt(beforeTimestamp);
    });
  });

  describe("Oracle Trigger", function () {
    beforeEach(async function () {
      // Setup: Submit weather data for trigger tests
      await contracts.agroShieldOracle.connect(users.oracle).submitWeatherData(
        DEFAULT_ORACLE_DATA.location,
        DEFAULT_ORACLE_DATA.timestamp,
        DEFAULT_ORACLE_DATA.rainfall,
        DEFAULT_ORACLE_DATA.temperature,
        DEFAULT_ORACLE_DATA.humidity
      );
    });

    it("Should allow oracle to trigger policy payout", async function () {
      // Create a policy first
      await contracts.agroShieldPolicy.connect(users.farmer1).createPolicy(
        ethers.utils.parseEther("1000"),
        "50",
        "90",
        DEFAULT_ORACLE_DATA.location,
        "Test policy"
      );
      
      // Pay premium
      await contracts.agroShieldPolicy.connect(users.farmer1).payPremium(1, { value: ethers.utils.parseEther("100") });
      
      await expect(contracts.agroShieldOracle.connect(users.oracle).triggerPolicyPayout(1))
        .to.emit(contracts.agroShieldOracle, "PolicyPayoutTriggered")
        .withArgs(1, DEFAULT_ORACLE_DATA.rainfall, "50");
      
      const policy = await contracts.agroShieldPolicy.getPolicy(1);
      expect(policy.payoutTriggered).to.be.true;
    });

    it("Should reject trigger for non-existent policy", async function () {
      await expect(contracts.agroShieldOracle.connect(users.oracle).triggerPolicyPayout(999))
        .to.be.revertedWith("Policy does not exist");
    });

    it("Should reject trigger from non-oracle", async function () {
      // Create a policy first
      await contracts.agroShieldPolicy.connect(users.farmer1).createPolicy(
        ethers.utils.parseEther("1000"),
        "50",
        "90",
        DEFAULT_ORACLE_DATA.location,
        "Test policy"
      );
      
      await expect(contracts.agroShieldOracle.connect(users.farmer1).triggerPolicyPayout(1))
        .to.be.revertedWith("Only authorized oracle can trigger payouts");
    });

    it("Should reject trigger for unpaid policy", async function () {
      // Create a policy without paying premium
      await contracts.agroShieldPolicy.connect(users.farmer1).createPolicy(
        ethers.utils.parseEther("1000"),
        "50",
        "90",
        DEFAULT_ORACLE_DATA.location,
        "Test policy"
      );
      
      await expect(contracts.agroShieldOracle.connect(users.oracle).triggerPolicyPayout(1))
        .to.be.revertedWith("Policy premium not paid");
    });

    it("Should reject trigger for inactive policy", async function () {
      // Create and pay for a policy
      await contracts.agroShieldPolicy.connect(users.farmer1).createPolicy(
        ethers.utils.parseEther("1000"),
        "50",
        "90",
        DEFAULT_ORACLE_DATA.location,
        "Test policy"
      );
      
      await contracts.agroShieldPolicy.connect(users.farmer1).payPremium(1, { value: ethers.utils.parseEther("100") });
      
      // Deactivate the policy
      await contracts.agroShieldPolicy.connect(users.owner).deactivatePolicy(1);
      
      await expect(contracts.agroShieldOracle.connect(users.oracle).triggerPolicyPayout(1))
        .to.be.revertedWith("Policy is not active");
    });

    it("Should reject duplicate trigger", async function () {
      // Create and pay for a policy
      await contracts.agroShieldPolicy.connect(users.farmer1).createPolicy(
        ethers.utils.parseEther("1000"),
        "50",
        "90",
        DEFAULT_ORACLE_DATA.location,
        "Test policy"
      );
      
      await contracts.agroShieldPolicy.connect(users.farmer1).payPremium(1, { value: ethers.utils.parseEther("100") });
      
      // First trigger
      await contracts.agroShieldOracle.connect(users.oracle).triggerPolicyPayout(1);
      
      // Second trigger should fail
      await expect(contracts.agroShieldOracle.connect(users.oracle).triggerPolicyPayout(1))
        .to.be.revertedWith("Payout already triggered");
    });

    it("Should handle rainfall below threshold", async function () {
      // Create a policy with high threshold
      await contracts.agroShieldPolicy.connect(users.farmer1).createPolicy(
        ethers.utils.parseEther("1000"),
        "100", // High threshold
        "90",
        DEFAULT_ORACLE_DATA.location,
        "Test policy"
      );
      
      await contracts.agroShieldPolicy.connect(users.farmer1).payPremium(1, { value: ethers.utils.parseEther("100") });
      
      // Trigger with rainfall below threshold
      await expect(contracts.agroShieldOracle.connect(users.oracle).triggerPolicyPayout(1))
        .to.emit(contracts.agroShieldOracle, "PolicyPayoutTriggered")
        .withArgs(1, DEFAULT_ORACLE_DATA.rainfall, "100");
      
      const policy = await contracts.agroShieldPolicy.getPolicy(1);
      expect(policy.payoutTriggered).to.be.true;
      expect(policy.shouldPayout).to.be.false; // No payout since rainfall below threshold
    });

    it("Should handle rainfall above threshold", async function () {
      // Create a policy with low threshold
      await contracts.agroShieldPolicy.connect(users.farmer1).createPolicy(
        ethers.utils.parseEther("1000"),
        "30", // Low threshold
        "90",
        DEFAULT_ORACLE_DATA.location,
        "Test policy"
      );
      
      await contracts.agroShieldPolicy.connect(users.farmer1).payPremium(1, { value: ethers.utils.parseEther("100") });
      
      // Trigger with rainfall above threshold
      await expect(contracts.agroShieldOracle.connect(users.oracle).triggerPolicyPayout(1))
        .to.emit(contracts.agroShieldOracle, "PolicyPayoutTriggered")
        .withArgs(1, DEFAULT_ORACLE_DATA.rainfall, "30");
      
      const policy = await contracts.agroShieldPolicy.getPolicy(1);
      expect(policy.payoutTriggered).to.be.true;
      expect(policy.shouldPayout).to.be.true; // Payout since rainfall above threshold
    });

    it("Should track trigger timestamp correctly", async function () {
      // Create and pay for a policy
      await contracts.agroShieldPolicy.connect(users.farmer1).createPolicy(
        ethers.utils.parseEther("1000"),
        "50",
        "90",
        DEFAULT_ORACLE_DATA.location,
        "Test policy"
      );
      
      await contracts.agroShieldPolicy.connect(users.farmer1).payPremium(1, { value: ethers.utils.parseEther("100") });
      
      const beforeTimestamp = await ethers.provider.getBlock("latest").then(block => block.timestamp);
      
      await contracts.agroShieldOracle.connect(users.oracle).triggerPolicyPayout(1);
      
      const policy = await contracts.agroShieldPolicy.getPolicy(1);
      expect(policy.payoutTriggeredAt).to.be.gt(beforeTimestamp);
    });
  });
});
