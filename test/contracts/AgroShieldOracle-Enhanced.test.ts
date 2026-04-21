import { expect } from "chai";
import { ethers } from "hardhat";
import { AgroShieldOracle } from "../../typechain-types";

describe("AgroShieldOracle-Enhanced", function () {
  let oracle: AgroShieldOracle;
  let owner: any;
  let provider: any;
  let user1: any;

  beforeEach(async function () {
    [owner, provider, user1] = await ethers.getSigners();
    
    // Deploy AgroShieldOracle
    const AgroShieldOracleFactory = await ethers.getContractFactory("AgroShieldOracle");
    oracle = await AgroShieldOracleFactory.deploy();
    await oracle.deployed();
  });

  describe("Advanced Weather Features", function () {
    beforeEach(async function () {
      await oracle.connect(owner).addAuthorizedProvider(provider.address);
    });

    it("Should support weather predictions", async function () {
      const location = "Nairobi";
      const predictedRainfall = 120;
      const confidence = 8500; // 85%
      const predictionPeriod = 7; // 7 days

      const tx = await oracle.connect(provider).submitWeatherPrediction(
        location,
        predictedRainfall,
        confidence,
        predictionPeriod,
        "AI Weather Model v2"
      );
      
      const receipt = await tx.wait();
      expect(receipt.events[0].event).to.equal("WeatherPredictionSubmitted");
      expect(receipt.events[0].args.location).to.equal(location);
      expect(receipt.events[0].args.predictedRainfall).to.equal(predictedRainfall);
    });

    it("Should get active predictions", async function () {
      const location = "Nairobi";
      await oracle.connect(provider).submitWeatherPrediction(
        location,
        120,
        8500,
        7,
        "AI Weather Model v2"
      );

      const predictions = await oracle.getActivePredictions(location);
      expect(predictions).to.have.length(1);
      expect(predictions[0].predictedRainfall).to.equal(120);
    });

    it("Should support weather alerts", async function () {
      const location = "Nairobi";
      const alertType = "FLOOD_WARNING";
      const severity = 3; // High
      const message = "Heavy rainfall expected in next 24 hours";

      const tx = await oracle.connect(provider).submitWeatherAlert(
        location,
        alertType,
        severity,
        message
      );
      
      const receipt = await tx.wait();
      expect(receipt.events[0].event).to.equal("WeatherAlertSubmitted");
      expect(receipt.events[0].args.alertType).to.equal(alertType);
    });

    it("Should get weather alerts", async function () {
      const location = "Nairobi";
      await oracle.connect(provider).submitWeatherAlert(
        location,
        "FLOOD_WARNING",
        3,
        "Heavy rainfall expected"
      );

      const alerts = await oracle.getWeatherAlerts(location);
      expect(alerts).to.have.length(1);
      expect(alerts[0].alertType).to.equal("FLOOD_WARNING");
    });
  });

  describe("Data Aggregation", function () {
    beforeEach(async function () {
      await oracle.connect(owner).addAuthorizedProvider(provider.address);
    });

    it("Should calculate average weather data", async function () {
      const location = "Nairobi";
      const weatherData = [
        { rainfall: 100, temperature: 20, humidity: 50 },
        { rainfall: 150, temperature: 25, humidity: 60 },
        { rainfall: 120, temperature: 22, humidity: 55 }
      ];

      // Submit weather data
      for (const data of weatherData) {
        await oracle.connect(provider).submitWeatherData(
          location,
          data.rainfall,
          data.temperature,
          data.humidity,
          10,
          45,
          "Test Station"
        );
      }

      const averageData = await oracle.getAverageWeatherData(location, 3);
      expect(averageData.avgRainfall).to.equal(123); // (100+150+120)/3
      expect(averageData.avgTemperature).to.equal(22); // (20+25+22)/3
      expect(averageData.avgHumidity).to.equal(55); // (50+60+55)/3
    });

    it("Should calculate weather trends", async function () {
      const location = "Nairobi";
      
      // Submit increasing rainfall data
      for (let i = 0; i < 5; i++) {
        await oracle.connect(provider).submitWeatherData(
          location,
          100 + (i * 10),
          20 + i,
          50 + (i * 2),
          10 + i,
          40 + i,
          "Test Station"
        );
      }

      const trends = await oracle.getWeatherTrends(location, 5);
      expect(trends.rainfallTrend).to.equal("INCREASING");
      expect(trends.temperatureTrend).to.equal("INCREASING");
      expect(trends.humidityTrend).to.equal("INCREASING");
    });

    it("Should detect weather anomalies", async function () {
      const location = "Nairobi";
      
      // Submit normal weather data
      for (let i = 0; i < 4; i++) {
        await oracle.connect(provider).submitWeatherData(
          location,
          100,
          25,
          60,
          10,
          45,
          "Test Station"
        );
      }

      // Submit anomalous data
      await oracle.connect(provider).submitWeatherData(
        location,
        500, // Much higher rainfall
        25,
        60,
        10,
        45,
        "Test Station"
      );

      const anomalies = await oracle.getWeatherAnomalies(location, 5);
      expect(anomalies).to.have.length(1);
      expect(anomalies[0].type).to.equal("HIGH_RAINFALL");
    });
  });

  describe("Data Quality", function () {
    beforeEach(async function () {
      await oracle.connect(owner).addAuthorizedProvider(provider.address);
    });

    it("Should validate data quality", async function () {
      const location = "Nairobi";
      
      // Submit high-quality data
      const tx = await oracle.connect(provider).submitWeatherData(
        location,
        150,
        25,
        60,
        10,
        45,
        "High Quality Station"
      );

      const receipt = await tx.wait();
      expect(receipt.events[0].args.qualityScore).to.be.gte(80); // High quality
    });

    it("Should flag low-quality data", async function () {
      const location = "Nairobi";
      
      // Submit data with extreme values (lower quality)
      const tx = await oracle.connect(provider).submitWeatherData(
        location,
        450, // Very high rainfall
        45,  // High temperature
        95,  // High humidity
        50,  // High wind speed
        90,  // High soil moisture
        "Low Quality Station"
      );

      const receipt = await tx.wait();
      expect(receipt.events[0].args.qualityScore).to.be.lt(60); // Low quality
    });

    it("Should filter by quality threshold", async function () {
      const location = "Nairobi";
      
      // Submit mixed quality data
      await oracle.connect(provider).submitWeatherData(
        location,
        150,
        25,
        60,
        10,
        45,
        "High Quality Station"
      );
      
      await oracle.connect(provider).submitWeatherData(
        location,
        450,
        45,
        95,
        50,
        90,
        "Low Quality Station"
      );

      const highQualityData = await oracle.getHighQualityWeatherData(location, 70);
      expect(highQualityData).to.have.length(1);
      expect(highQualityData[0].qualityScore).to.be.gte(70);
    });
  });

  describe("Historical Analysis", function () {
    beforeEach(async function () {
      await oracle.connect(owner).addAuthorizedProvider(provider.address);
    });

    it("Should get monthly weather statistics", async function () {
      const location = "Nairobi";
      const year = 2024;
      const month = 6; // June
      
      // Submit data for the month
      for (let day = 1; day <= 30; day++) {
        await oracle.connect(provider).submitWeatherData(
          location,
          100 + (day % 50),
          20 + (day % 10),
          50 + (day % 30),
          10 + (day % 20),
          40 + (day % 40),
          "Test Station"
        );
      }

      const monthlyStats = await oracle.getMonthlyWeatherStats(location, year, month);
      expect(monthlyStats.totalReadings).to.equal(30);
      expect(monthlyStats.avgRainfall).to.be.gt(0);
      expect(monthlyStats.maxRainfall).to.be.gte(monthlyStats.minRainfall);
    });

    it("Should get yearly weather summary", async function () {
      const location = "Nairobi";
      const year = 2024;
      
      // Submit data for the year
      for (let month = 1; month <= 12; month++) {
        for (let day = 1; day <= 10; day++) {
          await oracle.connect(provider).submitWeatherData(
            location,
            100 + month * 10 + day,
            20 + month + day,
            50 + month * 5 + day,
            10 + month * 2 + day,
            40 + month * 3 + day,
            "Test Station"
          );
        }
      }

      const yearlySummary = await oracle.getYearlyWeatherSummary(location, year);
      expect(yearlySummary.totalReadings).to.equal(120); // 12 months * 10 days
      expect(yearlySummary.avgRainfall).to.be.gt(0);
      expect(yearlySummary.totalRainfall).to.be.gt(0);
    });

    it("Should compare historical periods", async function () {
      const location = "Nairobi";
      
      // Submit data for period 1
      for (let i = 0; i < 10; i++) {
        await oracle.connect(provider).submitWeatherData(
          location,
          100 + i,
          20 + i,
          50 + i,
          10 + i,
          40 + i,
          "Test Station"
        );
      }

      // Submit data for period 2 (different values)
      for (let i = 0; i < 10; i++) {
        await oracle.connect(provider).submitWeatherData(
          location,
          150 + i,
          25 + i,
          60 + i,
          15 + i,
          50 + i,
          "Test Station"
        );
      }

      const comparison = await oracle.compareHistoricalPeriods(
        location,
        10, // Last 10 readings
        20, // Previous 10 readings
        10  // Skip 10 readings between periods
      );

      expect(comparison.period2AvgRainfall).to.be.gt(comparison.period1AvgRainfall);
      expect(comparison.period2AvgTemperature).to.be.gt(comparison.period1AvgTemperature);
    });
  });

  describe("Gas Optimization", function () {
    beforeEach(async function () {
      await oracle.connect(owner).addAuthorizedProvider(provider.address);
    });

    it("Should optimize batch data submission", async function () {
      const locations = ["Nairobi", "Lagos", "Accra"];
      const weatherData = [
        { rainfall: 100, temperature: 20, humidity: 50 },
        { rainfall: 150, temperature: 25, humidity: 60 },
        { rainfall: 120, temperature: 22, humidity: 55 }
      ];

      const tx = await oracle.connect(provider).batchSubmitWeatherData(
        locations,
        weatherData,
        "Batch Station"
      );
      
      const receipt = await tx.wait();
      expect(receipt.events).to.have.length(3);
      expect(receipt.gasUsed).to.be.lessThan(500000); // Should be more efficient than individual calls
    });

    it("Should optimize data retrieval", async function () {
      const locations = ["Nairobi", "Lagos", "Accra"];
      
      // Submit data for all locations
      for (let i = 0; i < locations.length; i++) {
        await oracle.connect(provider).submitWeatherData(
          locations[i],
          100 + i * 10,
          20 + i * 2,
          50 + i * 5,
          10 + i * 3,
          40 + i * 4,
          "Test Station"
        );
      }

      const gasUsed = await oracle.estimateGas.getMultipleLatestWeatherData(locations);
      expect(gasUsed).to.be.lessThan(150000); // Should be efficient
    });
  });

  describe("Security and Access Control", function () {
    it("Should prevent unauthorized data modification", async function () {
      await expect(
        oracle.connect(user1).updateWeatherData(
          "Nairobi",
          150,
          25,
          60,
          10,
          45
        )
      ).to.be.revertedWith("Not authorized provider");
    });

    it("Should handle emergency pause", async function () {
      await oracle.connect(owner).emergencyPause();
      
      await expect(
        oracle.connect(provider).submitWeatherData(
          "Nairobi",
          150,
          25,
          60,
          10,
          45,
          "Test Station"
        )
      ).to.be.revertedWith("Contract is paused");
      
      await oracle.connect(owner).emergencyUnpause();
    });

    it("Should validate provider reputation", async function () {
      // Add provider with reputation tracking
      await oracle.connect(owner).addAuthorizedProviderWithReputation(provider.address, 100);
      
      const reputation = await oracle.getProviderReputation(provider.address);
      expect(reputation.score).to.equal(100);
      expect(reputation.totalSubmissions).to.equal(0);
    });

    it("Should update provider reputation based on data quality", async function () {
      await oracle.connect(owner).addAuthorizedProviderWithReputation(provider.address, 100);
      
      // Submit high-quality data
      await oracle.connect(provider).submitWeatherData(
        "Nairobi",
        150,
        25,
        60,
        10,
        45,
        "High Quality Station"
      );

      const reputation = await oracle.getProviderReputation(provider.address);
      expect(reputation.totalSubmissions).to.equal(1);
      expect(reputation.avgQualityScore).to.be.gte(80);
    });
  });
});
