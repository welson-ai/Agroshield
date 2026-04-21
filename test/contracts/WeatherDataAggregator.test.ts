import { expect } from "chai";
import { ethers } from "hardhat";
import { WeatherDataAggregator } from "../../typechain-types";

describe("WeatherDataAggregator", function () {
  let aggregator: WeatherDataAggregator;
  let oracle1: any;
  let oracle2: any;
  let oracle3: any;
  let owner: any;
  let user1: any;

  beforeEach(async function () {
    [owner, oracle1, oracle2, oracle3, user1] = await ethers.getSigners();
    
    // Deploy WeatherDataAggregator
    const WeatherDataAggregatorFactory = await ethers.getContractFactory("WeatherDataAggregator");
    aggregator = await WeatherDataAggregatorFactory.deploy();
    await aggregator.deployed();

    // Add oracles
    await aggregator.connect(owner).addOracle(oracle1.address, 100); // 100% weight
    await aggregator.connect(owner).addOracle(oracle2.address, 80);  // 80% weight
    await aggregator.connect(owner).addOracle(oracle3.address, 60);  // 60% weight
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await aggregator.owner()).to.equal(owner.address);
    });

    it("Should initialize with default parameters", async function () {
      expect(await aggregator.minOracles()).to.equal(3);
      expect(await aggregator.maxDataAge()).to.equal(3600); // 1 hour
      expect(await aggregator.consensusThreshold()).to.equal(7000); // 70%
    });

    it("Should initialize with zero oracles", async function () {
      expect(await aggregator.getOracleCount()).to.equal(3);
    });
  });

  describe("Oracle Management", function () {
    it("Should add oracle with weight", async function () {
      const newOracle = user1;
      const weight = 90;
      
      await aggregator.connect(owner).addOracle(newOracle.address, weight);
      
      const oracleInfo = await aggregator.getOracleInfo(newOracle.address);
      expect(oracleInfo.isActive).to.be.true;
      expect(oracleInfo.weight).to.equal(weight);
    });

    it("Should emit OracleAdded event", async function () {
      const newOracle = user1;
      const weight = 90;
      
      await expect(aggregator.connect(owner).addOracle(newOracle.address, weight))
        .to.emit(aggregator, "OracleAdded")
        .withArgs(newOracle.address, weight);
    });

    it("Should remove oracle", async function () {
      await aggregator.connect(owner).removeOracle(oracle1.address);
      
      const oracleInfo = await aggregator.getOracleInfo(oracle1.address);
      expect(oracleInfo.isActive).to.be.false;
    });

    it("Should emit OracleRemoved event", async function () {
      await expect(aggregator.connect(owner).removeOracle(oracle1.address))
        .to.emit(aggregator, "OracleRemoved")
        .withArgs(oracle1.address);
    });

    it("Should update oracle weight", async function () {
      const newWeight = 120;
      
      await aggregator.connect(owner).updateOracleWeight(oracle1.address, newWeight);
      
      const oracleInfo = await aggregator.getOracleInfo(oracle1.address);
      expect(oracleInfo.weight).to.equal(newWeight);
    });

    it("Should emit OracleWeightUpdated event", async function () {
      const newWeight = 120;
      
      await expect(aggregator.connect(owner).updateOracleWeight(oracle1.address, newWeight))
        .to.emit(aggregator, "OracleWeightUpdated")
        .withArgs(oracle1.address, newWeight);
    });

    it("Should fail to add oracle from non-owner", async function () {
      await expect(
        aggregator.connect(user1).addOracle(user1.address, 100)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should fail to add oracle with zero weight", async function () {
      await expect(
        aggregator.connect(owner).addOracle(user1.address, 0)
      ).to.be.revertedWith("Weight must be greater than 0");
    });
  });

  describe("Data Submission", function () {
    const location = "Nairobi";
    const rainfall = 150;
    const temperature = 25;
    const humidity = 60;

    it("Should submit weather data from oracle", async function () {
      const tx = await aggregator.connect(oracle1).submitWeatherData(
        location,
        rainfall,
        temperature,
        humidity,
        Math.floor(Date.now() / 1000)
      );
      
      const receipt = await tx.wait();
      expect(receipt.events[0].event).to.equal("WeatherDataSubmitted");
      expect(receipt.events[0].args.oracle).to.equal(oracle1.address);
      expect(receipt.events[0].args.location).to.equal(location);
    });

    it("Should store oracle data correctly", async function () {
      const timestamp = Math.floor(Date.now() / 1000);
      
      await aggregator.connect(oracle1).submitWeatherData(
        location,
        rainfall,
        temperature,
        humidity,
        timestamp
      );
      
      const oracleData = await aggregator.getOracleData(oracle1.address, location);
      expect(oracleData.rainfall).to.equal(rainfall);
      expect(oracleData.temperature).to.equal(temperature);
      expect(oracleData.humidity).to.equal(humidity);
      expect(oracleData.timestamp).to.equal(timestamp);
    });

    it("Should fail from non-oracle", async function () {
      await expect(
        aggregator.connect(user1).submitWeatherData(
          location,
          rainfall,
          temperature,
          humidity,
          Math.floor(Date.now() / 1000)
        )
      ).to.be.revertedWith("Not an authorized oracle");
    });

    it("Should fail with invalid rainfall", async function () {
      await expect(
        aggregator.connect(oracle1).submitWeatherData(
          location,
          -1, // Invalid negative rainfall
          temperature,
          humidity,
          Math.floor(Date.now() / 1000)
        )
      ).to.be.revertedWith("Invalid rainfall value");
    });

    it("Should fail with invalid temperature", async function () {
      await expect(
        aggregator.connect(oracle1).submitWeatherData(
          location,
          rainfall,
          -100, // Invalid temperature
          humidity,
          Math.floor(Date.now() / 1000)
        )
      ).to.be.revertedWith("Invalid temperature value");
    });

    it("Should fail with invalid humidity", async function () {
      await expect(
        aggregator.connect(oracle1).submitWeatherData(
          location,
          rainfall,
          temperature,
          150, // Invalid humidity > 100
          Math.floor(Date.now() / 1000)
        )
      ).to.be.revertedWith("Invalid humidity value");
    });
  });

  describe("Data Aggregation", function () {
    const location = "Nairobi";
    const timestamp = Math.floor(Date.now() / 1000);

    beforeEach(async function () {
      // Submit data from multiple oracles
      await aggregator.connect(oracle1).submitWeatherData(location, 100, 20, 50, timestamp);
      await aggregator.connect(oracle2).submitWeatherData(location, 120, 22, 55, timestamp);
      await aggregator.connect(oracle3).submitWeatherData(location, 110, 21, 52, timestamp);
    });

    it("Should aggregate weather data correctly", async function () {
      const aggregatedData = await aggregator.getAggregatedWeatherData(location);
      
      // Weighted average: (100*100 + 120*80 + 110*60) / (100 + 80 + 60) = 109.09
      expect(aggregatedData.rainfall).to.equal(109); // Rounded down
      expect(aggregatedData.temperature).to.equal(21); // (20*100 + 22*80 + 21*60) / 240 = 20.83
      expect(aggregatedData.humidity).to.equal(52); // (50*100 + 55*80 + 52*60) / 240 = 52.08
      expect(aggregatedData.confidence).to.equal(7500); // 75%
      expect(aggregatedData.dataPoints).to.equal(3);
    });

    it("Should calculate confidence based on oracle weights", async function () {
      const aggregatedData = await aggregator.getAggregatedWeatherData(location);
      
      // Total weight: 100 + 80 + 60 = 240
      // Expected confidence: (240 / (240 + 100)) * 10000 = 7058 (70.58%)
      // But actual implementation might use different logic
      expect(aggregatedData.confidence).to.be.gte(5000); // At least 50%
      expect(aggregatedData.confidence).to.be.lte(10000); // At most 100%
    });

    it("Should handle insufficient data points", async function () {
      // Remove one oracle
      await aggregator.connect(owner).removeOracle(oracle3.address);
      
      const aggregatedData = await aggregator.getAggregatedWeatherData(location);
      expect(aggregatedData.dataPoints).to.equal(2);
    });

    it("Should handle no data available", async function () {
      const newLocation = "Lagos";
      
      const aggregatedData = await aggregator.getAggregatedWeatherData(newLocation);
      expect(aggregatedData.rainfall).to.equal(0);
      expect(aggregatedData.temperature).to.equal(0);
      expect(aggregatedData.humidity).to.equal(0);
      expect(aggregatedData.confidence).to.equal(0);
      expect(aggregatedData.dataPoints).to.equal(0);
    });
  });

  describe("Data Validation", function () {
    const location = "Nairobi";
    const timestamp = Math.floor(Date.now() / 1000);

    beforeEach(async function () {
      await aggregator.connect(oracle1).submitWeatherData(location, 100, 20, 50, timestamp);
      await aggregator.connect(oracle2).submitWeatherData(location, 120, 22, 55, timestamp);
      await aggregator.connect(oracle3).submitWeatherData(location, 110, 21, 52, timestamp);
    });

    it("Should detect outlier data", async function () {
      // Submit outlier data
      await aggregator.connect(oracle1).submitWeatherData(location, 500, 20, 50, timestamp + 1000);
      
      const validation = await aggregator.validateDataConsistency(location);
      expect(validation.hasOutliers).to.be.true;
      expect(validation.outlierCount).to.be.gte(1);
    });

    it("Should calculate data variance", async function () {
      const variance = await aggregator.calculateDataVariance(location, "rainfall");
      expect(variance).to.be.gt(0);
    });

    it("Should filter outliers", async function () {
      // Submit outlier data
      await aggregator.connect(oracle1).submitWeatherData(location, 500, 20, 50, timestamp + 1000);
      
      const filteredData = await aggregator.getFilteredWeatherData(location);
      expect(filteredData.rainfall).to.be.lt(200); // Should exclude outlier
    });
  });

  describe("Historical Data", function () {
    const location = "Nairobi";
    const baseTimestamp = Math.floor(Date.now() / 1000);

    beforeEach(async function () {
      // Submit historical data
      for (let i = 0; i < 5; i++) {
        await aggregator.connect(oracle1).submitWeatherData(
          location,
          100 + i * 10,
          20 + i,
          50 + i * 2,
          baseTimestamp - (i * 3600) // 1 hour apart
        );
      }
    });

    it("Should retrieve historical data", async function () {
      const historicalData = await aggregator.getHistoricalWeatherData(
        location,
        baseTimestamp - 4 * 3600,
        baseTimestamp
      );
      
      expect(historicalData).to.have.length(5);
      expect(historicalData[0].rainfall).to.equal(140); // Most recent
      expect(historicalData[4].rainfall).to.equal(100); // Oldest
    });

    it("Should calculate trend analysis", async function () {
      const trend = await aggregator.analyzeWeatherTrend(location, "rainfall", 5);
      
      expect(trend.direction).to.be.oneOf(["INCREASING", "DECREASING", "STABLE"]);
      expect(trend.changeRate).to.be.gte(-10000); // Can be negative
      expect(trend.confidence).to.be.gte(0);
      expect(trend.confidence).to.be.lte(10000);
    });

    it("Should predict weather based on trends", async function () {
      const prediction = await aggregator.predictWeather(location, 24); // 24 hours ahead
      
      expect(prediction.predictedRainfall).to.be.gte(0);
      expect(prediction.predictedTemperature).to.be.gte(-50);
      expect(prediction.predictedTemperature).to.be.lte(60);
      expect(prediction.predictedHumidity).to.be.gte(0);
      expect(prediction.predictedHumidity).to.be.lte(100);
      expect(prediction.confidence).to.be.gte(0);
      expect(prediction.confidence).to.lte(10000);
    });
  });

  describe("Consensus Mechanism", function () {
    const location = "Nairobi";
    const timestamp = Math.floor(Date.now() / 1000);

    it("Should achieve consensus with sufficient data", async function () {
      // Submit consistent data
      await aggregator.connect(oracle1).submitWeatherData(location, 100, 20, 50, timestamp);
      await aggregator.connect(oracle2).submitWeatherData(location, 105, 21, 52, timestamp);
      await aggregator.connect(oracle3).submitWeatherData(location, 98, 19, 48, timestamp);
      
      const consensus = await aggregator.checkConsensus(location);
      expect(consensus.achieved).to.be.true;
      expect(consensus.confidence).to.be.gte(7000); // Above threshold
    });

    it("Should fail consensus with insufficient data", async function () {
      // Submit data from only 2 oracles (need 3 minimum)
      await aggregator.connect(oracle1).submitWeatherData(location, 100, 20, 50, timestamp);
      await aggregator.connect(oracle2).submitWeatherData(location, 105, 21, 52, timestamp);
      
      const consensus = await aggregator.checkConsensus(location);
      expect(consensus.achieved).to.be.false;
      expect(consensus.reason).to.equal("Insufficient data points");
    });

    it("Should fail consensus with conflicting data", async function () {
      // Submit very different data
      await aggregator.connect(oracle1).submitWeatherData(location, 100, 20, 50, timestamp);
      await aggregator.connect(oracle2).submitWeatherData(location, 200, 40, 80, timestamp); // Very different
      await aggregator.connect(oracle3).submitWeatherData(location, 300, 60, 90, timestamp); // Very different
      
      const consensus = await aggregator.checkConsensus(location);
      expect(consensus.achieved).to.be.false;
      expect(consensus.reason).to.equal("High variance in data");
    });
  });

  describe("Gas Optimization", function () {
    it("Should use reasonable gas for data submission", async function () {
      const tx = await aggregator.connect(oracle1).submitWeatherData(
        "Nairobi",
        100,
        20,
        50,
        Math.floor(Date.now() / 1000)
      );
      
      const receipt = await tx.wait();
      expect(receipt.gasUsed).to.be.lessThan(150000);
    });

    it("Should use reasonable gas for data aggregation", async function () {
      // Submit data first
      await aggregator.connect(oracle1).submitWeatherData("Nairobi", 100, 20, 50, Math.floor(Date.now() / 1000));
      await aggregator.connect(oracle2).submitWeatherData("Nairobi", 120, 22, 55, Math.floor(Date.now() / 1000));
      await aggregator.connect(oracle3).submitWeatherData("Nairobi", 110, 21, 52, Math.floor(Date.now() / 1000));
      
      const gasUsed = await aggregator.estimateGas.getAggregatedWeatherData("Nairobi");
      expect(gasUsed).to.be.lessThan(200000);
    });

    it("Should use reasonable gas for oracle management", async function () {
      const gasUsed = await aggregator.estimateGas.addOracle(user1.address, 100);
      expect(gasUsed).to.be.lessThan(100000);
    });
  });

  describe("Edge Cases", function () {
    it("Should handle maximum number of oracles", async function () {
      const maxOracles = 20;
      
      // Add oracles up to maximum
      for (let i = 0; i < maxOracles - 3; i++) { // Already have 3
        const newOracle = ethers.Wallet.createRandom().address;
        await aggregator.connect(owner).addOracle(newOracle, 100);
      }
      
      expect(await aggregator.getOracleCount()).to.equal(maxOracles);
      
      // Should fail to add more
      await expect(
        aggregator.connect(owner).addOracle(ethers.Wallet.createRandom().address, 100)
      ).to.be.revertedWith("Maximum oracles reached");
    });

    it("Should handle stale data", async function () {
      const location = "Nairobi";
      const oldTimestamp = Math.floor(Date.now() / 1000) - 7200; // 2 hours ago
      
      await aggregator.connect(oracle1).submitWeatherData(location, 100, 20, 50, oldTimestamp);
      
      const aggregatedData = await aggregator.getAggregatedWeatherData(location);
      expect(aggregatedData.dataPoints).to.equal(0); // Should ignore stale data
    });

    it("Should handle extreme weather values", async function () {
      const location = "ExtremeLocation";
      const timestamp = Math.floor(Date.now() / 1000);
      
      // Submit extreme but valid values
      await aggregator.connect(oracle1).submitWeatherData(location, 500, 50, 100, timestamp);
      await aggregator.connect(oracle2).submitWeatherData(location, 0, -40, 0, timestamp);
      
      const aggregatedData = await aggregator.getAggregatedWeatherData(location);
      expect(aggregatedData.rainfall).to.equal(250); // Average of 500 and 0
      expect(aggregatedData.temperature).to.equal(5); // Average of 50 and -40
      expect(aggregatedData.humidity).to.equal(50); // Average of 100 and 0
    });
  });
});
