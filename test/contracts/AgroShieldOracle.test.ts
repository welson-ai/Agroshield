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
});
