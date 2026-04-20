import { expect } from "chai";
import { ethers } from "hardhat";
import { WeatherOracle } from "../../typechain-types";

describe("WeatherOracle", function () {
  let weatherOracle: WeatherOracle;
  let owner: any;
  let provider: any;
  let user1: any;

  beforeEach(async function () {
    [owner, provider, user1] = await ethers.getSigners();
    
    // Deploy WeatherOracle
    const WeatherOracleFactory = await ethers.getContractFactory("WeatherOracle");
    weatherOracle = await WeatherOracleFactory.deploy();
    await weatherOracle.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await weatherOracle.owner()).to.equal(owner.address);
    });

    it("Should initialize with zero providers", async function () {
      expect(await weatherOracle.getAuthorizedProvidersCount()).to.equal(0);
    });
  });

  describe("Provider Management", function () {
    it("Should add authorized provider", async function () {
      await weatherOracle.connect(owner).addAuthorizedProvider(provider.address);
      
      expect(await weatherOracle.isAuthorizedProvider(provider.address)).to.be.true;
      expect(await weatherOracle.getAuthorizedProvidersCount()).to.equal(1);
    });

    it("Should emit ProviderAdded event", async function () {
      await expect(weatherOracle.connect(owner).addAuthorizedProvider(provider.address))
        .to.emit(weatherOracle, "ProviderAdded")
        .withArgs(provider.address);
    });

    it("Should fail to add provider from non-owner", async function () {
      await expect(
        weatherOracle.connect(user1).addAuthorizedProvider(user1.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should remove authorized provider", async function () {
      await weatherOracle.connect(owner).addAuthorizedProvider(provider.address);
      await weatherOracle.connect(owner).removeAuthorizedProvider(provider.address);
      
      expect(await weatherOracle.isAuthorizedProvider(provider.address)).to.be.false;
      expect(await weatherOracle.getAuthorizedProvidersCount()).to.equal(0);
    });

    it("Should emit ProviderRemoved event", async function () {
      await weatherOracle.connect(owner).addAuthorizedProvider(provider.address);
      
      await expect(weatherOracle.connect(owner).removeAuthorizedProvider(provider.address))
        .to.emit(weatherOracle, "ProviderRemoved")
        .withArgs(provider.address);
    });
  });

  describe("Weather Data Management", function () {
    const location = "Nairobi";
    const rainfall = 150;
    const temperature = 25;
    const humidity = 60;

    beforeEach(async function () {
      await weatherOracle.connect(owner).addAuthorizedProvider(provider.address);
    });

    it("Should submit weather data", async function () {
      const tx = await weatherOracle.connect(provider).submitWeatherData(
        location,
        rainfall,
        temperature,
        humidity,
        "Test Station"
      );
      
      const receipt = await tx.wait();
      expect(receipt.events[0].event).to.equal("WeatherDataSubmitted");
      expect(receipt.events[0].args.location).to.equal(location);
      expect(receipt.events[0].args.rainfall).to.equal(rainfall);
    });

    it("Should store weather data correctly", async function () {
      await weatherOracle.connect(provider).submitWeatherData(
        location,
        rainfall,
        temperature,
        humidity,
        "Test Station"
      );

      const weatherData = await weatherOracle.getLatestWeatherData(location);
      expect(weatherData.rainfall).to.equal(rainfall);
      expect(weatherData.temperature).to.equal(temperature);
      expect(weatherData.humidity).to.equal(humidity);
      expect(weatherData.location).to.equal(location);
    });

    it("Should fail to submit data from unauthorized provider", async function () {
      await expect(
        weatherOracle.connect(user1).submitWeatherData(
          location,
          rainfall,
          temperature,
          humidity,
          "Test Station"
        )
      ).to.be.revertedWith("Not authorized provider");
    });

    it("Should fail with invalid rainfall values", async function () {
      await expect(
        weatherOracle.connect(provider).submitWeatherData(
          location,
          -1, // Invalid negative rainfall
          temperature,
          humidity,
          "Test Station"
        )
      ).to.be.revertedWith("Invalid rainfall value");
    });

    it("Should fail with invalid temperature values", async function () {
      await expect(
        weatherOracle.connect(provider).submitWeatherData(
          location,
          rainfall,
          -100, // Invalid temperature
          humidity,
          "Test Station"
        )
      ).to.be.revertedWith("Invalid temperature value");
    });

    it("Should fail with invalid humidity values", async function () {
      await expect(
        weatherOracle.connect(provider).submitWeatherData(
          location,
          rainfall,
          temperature,
          150, // Invalid humidity > 100
          "Test Station"
        )
      ).to.be.revertedWith("Invalid humidity value");
    });
  });

  describe("Weather Data Retrieval", function () {
    const location = "Nairobi";
    const testData = [
      { rainfall: 100, temperature: 20, humidity: 50 },
      { rainfall: 150, temperature: 25, humidity: 60 },
      { rainfall: 120, temperature: 22, humidity: 55 }
    ];

    beforeEach(async function () {
      await weatherOracle.connect(owner).addAuthorizedProvider(provider.address);
      
      for (const data of testData) {
        await weatherOracle.connect(provider).submitWeatherData(
          location,
          data.rainfall,
          data.temperature,
          data.humidity,
          "Test Station"
        );
      }
    });

    it("Should get latest weather data", async function () {
      const latestData = await weatherOracle.getLatestWeatherData(location);
      
      expect(latestData.rainfall).to.equal(testData[testData.length - 1].rainfall);
      expect(latestData.temperature).to.equal(testData[testData.length - 1].temperature);
      expect(latestData.humidity).to.equal(testData[testData.length - 1].humidity);
    });

    it("Should get weather data history", async function () {
      const history = await weatherOracle.getWeatherDataHistory(location, 3);
      
      expect(history).to.have.length(3);
      expect(history[0].rainfall).to.equal(testData[0].rainfall);
      expect(history[1].rainfall).to.equal(testData[1].rainfall);
      expect(history[2].rainfall).to.equal(testData[2].rainfall);
    });

    it("Should get multiple locations data", async function () {
      const location2 = "Lagos";
      await weatherOracle.connect(provider).submitWeatherData(
        location2,
        80,
        30,
        70,
        "Test Station 2"
      );

      const locations = await weatherOracle.getAvailableLocations();
      expect(locations).to.include(location);
      expect(locations).to.include(location2);
    });

    it("Should handle non-existent location", async function () {
      const nonExistentData = await weatherOracle.getLatestWeatherData("NonExistent");
      
      expect(nonExistentData.rainfall).to.equal(0);
      expect(nonExistentData.temperature).to.equal(0);
      expect(nonExistentData.humidity).to.equal(0);
    });
  });

  describe("Data Validation", function () {
    beforeEach(async function () {
      await weatherOracle.connect(owner).addAuthorizedProvider(provider.address);
    });

    it("Should validate rainfall range", async function () {
      const validRainfall = 150;
      const invalidRainfall = 1000; // Too high

      await expect(
        weatherOracle.connect(provider).submitWeatherData(
          "Test",
          validRainfall,
          25,
          60,
          "Test Station"
        )
      ).to.not.be.reverted;

      await expect(
        weatherOracle.connect(provider).submitWeatherData(
          "Test",
          invalidRainfall,
          25,
          60,
          "Test Station"
        )
      ).to.be.revertedWith("Invalid rainfall value");
    });

    it("Should validate temperature range", async function () {
      const validTemp = 25;
      const invalidTemp = 100; // Too high

      await expect(
        weatherOracle.connect(provider).submitWeatherData(
          "Test",
          150,
          validTemp,
          60,
          "Test Station"
        )
      ).to.not.be.reverted;

      await expect(
        weatherOracle.connect(provider).submitWeatherData(
          "Test",
          150,
          invalidTemp,
          60,
          "Test Station"
        )
      ).to.be.revertedWith("Invalid temperature value");
    });

    it("Should validate humidity range", async function () {
      const validHumidity = 60;
      const invalidHumidity = 150; // Too high

      await expect(
        weatherOracle.connect(provider).submitWeatherData(
          "Test",
          150,
          25,
          validHumidity,
          "Test Station"
        )
      ).to.not.be.reverted;

      await expect(
        weatherOracle.connect(provider).submitWeatherData(
          "Test",
          150,
          25,
          invalidHumidity,
          "Test Station"
        )
      ).to.be.revertedWith("Invalid humidity value");
    });
  });

  describe("Gas Optimization", function () {
    beforeEach(async function () {
      await weatherOracle.connect(owner).addAuthorizedProvider(provider.address);
    });

    it("Should use reasonable gas for data submission", async function () {
      const tx = await weatherOracle.connect(provider).submitWeatherData(
        "Test",
        150,
        25,
        60,
        "Test Station"
      );
      
      const receipt = await tx.wait();
      expect(receipt.gasUsed).to.be.lessThan(150000);
    });

    it("Should use reasonable gas for data retrieval", async function () {
      await weatherOracle.connect(provider).submitWeatherData(
        "Test",
        150,
        25,
        60,
        "Test Station"
      );

      const gasUsed = await weatherOracle.estimateGas.getLatestWeatherData("Test");
      expect(gasUsed).to.be.lessThan(50000);
    });
  });

  describe("Edge Cases", function () {
    beforeEach(async function () {
      await weatherOracle.connect(owner).addAuthorizedProvider(provider.address);
    });

    it("Should handle multiple submissions for same location", async function () {
      const location = "TestLocation";
      
      await weatherOracle.connect(provider).submitWeatherData(location, 100, 20, 50, "Station 1");
      await weatherOracle.connect(provider).submitWeatherData(location, 150, 25, 60, "Station 2");
      
      const latest = await weatherOracle.getLatestWeatherData(location);
      expect(latest.rainfall).to.equal(150); // Should get latest
    });

    it("Should handle empty location name", async function () {
      await expect(
        weatherOracle.connect(provider).submitWeatherData(
          "",
          150,
          25,
          60,
          "Test Station"
        )
      ).to.be.revertedWith("Location cannot be empty");
    });

    it("Should handle maximum history request", async function () {
      const location = "TestLocation";
      const maxHistory = 100;
      
      // Submit some data
      for (let i = 0; i < 5; i++) {
        await weatherOracle.connect(provider).submitWeatherData(
          location,
          100 + i,
          20 + i,
          50 + i,
          "Test Station"
        );
      }
      
      const history = await weatherOracle.getWeatherDataHistory(location, maxHistory);
      expect(history).to.have.length(5); // Should only return available data
    });
  });
});
