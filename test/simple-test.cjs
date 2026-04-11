const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AgroShield Protocol", function () {
  let cusdToken;
  let agroShieldPool;
  let agroShieldPolicy;
  let agroShieldOracle;
  let owner, farmer, liquidityProvider, weatherProvider;
  
  // Mock cUSD token for testing
  const CUSD_SUPPLY = ethers.parseEther("1000000");
  const FARMER_COVERAGE = ethers.parseEther("1000");
  const RAINFALL_THRESHOLD = 50; // 50mm
  const MEASUREMENT_PERIOD = 30; // 30 days
  const LOCATION_ID = 1;
  const LIQUIDITY_AMOUNT = ethers.parseEther("10000");

  beforeEach(async function () {
    [owner, farmer, liquidityProvider, weatherProvider] = await ethers.getSigners();

    // Deploy mock cUSD token
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    cusdToken = await MockERC20.deploy("Celo Dollar", "cUSD", CUSD_SUPPLY);
    await cusdToken.waitForDeployment();

    // Deploy AgroShieldPool
    const AgroShieldPool = await ethers.getContractFactory("AgroShieldPool");
    agroShieldPool = await AgroShieldPool.deploy(await cusdToken.getAddress());
    await agroShieldPool.waitForDeployment();

    // Deploy AgroShieldOracle
    const AgroShieldOracle = await ethers.getContractFactory("AgroShieldOracle");
    agroShieldOracle = await AgroShieldOracle.deploy();
    await agroShieldOracle.waitForDeployment();

    // Deploy AgroShieldPolicy
    const AgroShieldPolicy = await ethers.getContractFactory("AgroShieldPolicy");
    agroShieldPolicy = await AgroShieldPolicy.deploy(
      await cusdToken.getAddress(),
      await agroShieldPool.getAddress()
    );
    await agroShieldPolicy.waitForDeployment();

    // Setup contract relationships
    await agroShieldPool.authorizePolicy(await agroShieldPolicy.getAddress());
    await agroShieldPolicy.setOracleContract(await agroShieldOracle.getAddress());
    await agroShieldOracle.setPolicyContract(await agroShieldPolicy.getAddress());
    await agroShieldOracle.authorizeProvider(weatherProvider.address);

    // Distribute tokens
    await cusdToken.transfer(farmer.address, ethers.parseEther("10000"));
    await cusdToken.transfer(liquidityProvider.address, ethers.parseEther("50000"));
  });

  describe("AgroShieldPool", function () {
    it("Should provide liquidity correctly", async function () {
      await cusdToken.connect(liquidityProvider).approve(await agroShieldPool.getAddress(), LIQUIDITY_AMOUNT);
      
      await expect(agroShieldPool.connect(liquidityProvider).provideLiquidity(LIQUIDITY_AMOUNT))
        .to.emit(agroShieldPool, "LiquidityProvided")
        .withArgs(liquidityProvider.address, LIQUIDITY_AMOUNT, LIQUIDITY_AMOUNT);

      expect(await agroShieldPool.totalLiquidity()).to.equal(LIQUIDITY_AMOUNT);
      expect(await agroShieldPool.userShares(liquidityProvider.address)).to.equal(LIQUIDITY_AMOUNT);
    });

    it("Should maintain reserve ratio", async function () {
      await cusdToken.connect(liquidityProvider).approve(await agroShieldPool.getAddress(), LIQUIDITY_AMOUNT);
      await agroShieldPool.connect(liquidityProvider).provideLiquidity(LIQUIDITY_AMOUNT);

      const reserve = await agroShieldPool.totalReserve();
      const expectedReserve = LIQUIDITY_AMOUNT * 1000n / 10000n; // 10% reserve
      expect(reserve).to.equal(expectedReserve);
    });
  });

  describe("AgroShieldPolicy", function () {
    beforeEach(async function () {
      // Provide liquidity to pool
      await cusdToken.connect(liquidityProvider).approve(await agroShieldPool.getAddress(), LIQUIDITY_AMOUNT);
      await agroShieldPool.connect(liquidityProvider).provideLiquidity(LIQUIDITY_AMOUNT);
    });

    it("Should create policy correctly", async function () {
      await expect(agroShieldPolicy.connect(farmer).createPolicy(
        FARMER_COVERAGE,
        RAINFALL_THRESHOLD,
        MEASUREMENT_PERIOD,
        LOCATION_ID
      ))
        .to.emit(agroShieldPolicy, "PolicyCreated")
        .withArgs(1, farmer.address, FARMER_COVERAGE, anyValue, RAINFALL_THRESHOLD, MEASUREMENT_PERIOD, LOCATION_ID);

      const policy = await agroShieldPolicy.getPolicy(1);
      expect(policy.farmer).to.equal(farmer.address);
      expect(policy.coverageAmount).to.equal(FARMER_COVERAGE);
      expect(policy.rainfallThreshold).to.equal(RAINFALL_THRESHOLD);
      expect(policy.active).to.be.false;
    });

    it("Should pay premium and activate policy", async function () {
      await agroShieldPolicy.connect(farmer).createPolicy(
        FARMER_COVERAGE,
        RAINFALL_THRESHOLD,
        MEASUREMENT_PERIOD,
        LOCATION_ID
      );

      const policy = await agroShieldPolicy.getPolicy(1);
      await cusdToken.connect(farmer).approve(await agroShieldPolicy.getAddress(), policy.premiumAmount);

      await expect(agroShieldPolicy.connect(farmer).payPremium(1))
        .to.emit(agroShieldPolicy, "PolicyActivated")
        .withArgs(1);

      const updatedPolicy = await agroShieldPolicy.getPolicy(1);
      expect(updatedPolicy.active).to.be.true;
      expect(updatedPolicy.startTime).to.be.greaterThan(0);
    });
  });

  describe("AgroShieldOracle", function () {
    it("Should submit and verify weather data", async function () {
      const timestamp = Math.floor(Date.now() / 1000);
      const rainfall = 30;
      const temperature = 25;
      const humidity = 60;

      await expect(agroShieldOracle.connect(weatherProvider).submitWeatherData(
        LOCATION_ID,
        timestamp,
        rainfall,
        temperature,
        humidity
      ))
        .to.emit(agroShieldOracle, "WeatherDataSubmitted")
        .withArgs(LOCATION_ID, timestamp, rainfall, weatherProvider.address);

      // Submit same data from another provider to reach min confirmations
      await agroShieldOracle.authorizeProvider(owner.address);
      await agroShieldOracle.connect(owner).submitWeatherData(
        LOCATION_ID,
        timestamp,
        rainfall,
        temperature,
        humidity
      );

      const weatherData = await agroShieldOracle.getWeatherData(LOCATION_ID, timestamp);
      expect(weatherData.verified).to.be.true;
      expect(weatherData.rainfall).to.equal(rainfall);
    });
  });

  describe("Integration Tests", function () {
    it("Should handle complete policy lifecycle", async function () {
      // 1. Provide liquidity
      await cusdToken.connect(liquidityProvider).approve(await agroShieldPool.getAddress(), LIQUIDITY_AMOUNT);
      await agroShieldPool.connect(liquidityProvider).provideLiquidity(LIQUIDITY_AMOUNT);

      // 2. Farmer creates policy
      await agroShieldPolicy.connect(farmer).createPolicy(
        FARMER_COVERAGE,
        RAINFALL_THRESHOLD,
        MEASUREMENT_PERIOD,
        LOCATION_ID
      );

      // 3. Farmer pays premium
      const policy = await agroShieldPolicy.getPolicy(1);
      await cusdToken.connect(farmer).approve(await agroShieldPolicy.getAddress(), policy.premiumAmount);
      await agroShieldPolicy.connect(farmer).payPremium(1);

      // 4. Weather data submitted (drought condition)
      const timestamp = Math.floor(Date.now() / 1000);
      const actualRainfall = 30; // Below threshold

      await agroShieldOracle.authorizeProvider(owner.address);
      await agroShieldOracle.connect(weatherProvider).submitWeatherData(
        LOCATION_ID,
        timestamp,
        actualRainfall,
        25,
        60
      );
      await agroShieldOracle.connect(owner).submitWeatherData(
        LOCATION_ID,
        timestamp,
        actualRainfall,
        25,
        60
      );

      // 5. Payout triggered
      await agroShieldOracle.triggerPayout(1, actualRainfall);

      // 6. Verify payout processed
      const finalPolicy = await agroShieldPolicy.getPolicy(1);
      expect(finalPolicy.paidOut).to.be.true;
      expect(finalPolicy.active).to.be.false;
    });
  });
});
