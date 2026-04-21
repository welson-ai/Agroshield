import { expect } from "chai";
import { ethers } from "hardhat";
import { DynamicPremiums } from "../../typechain-types";

describe("DynamicPremiums", function () {
  let premiums: DynamicPremiums;
  let owner: any;
  let user1: any;
  let user2: any;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    
    // Deploy DynamicPremiums
    const DynamicPremiumsFactory = await ethers.getContractFactory("DynamicPremiums");
    premiums = await DynamicPremiumsFactory.deploy();
    await premiums.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await premiums.owner()).to.equal(owner.address);
    });

    it("Should initialize with default base rate", async function () {
      expect(await premiums.baseRate()).to.equal(500); // 5%
    });

    it("Should initialize with default risk factors", async function () {
      const wheatRisk = await premiums.cropRiskFactors("wheat");
      expect(wheatRisk).to.equal(100); // 1.0x multiplier
    });
  });

  describe("Risk Factor Management", function () {
    it("Should allow owner to set crop risk factor", async function () {
      const crop = "corn";
      const riskFactor = 150; // 1.5x multiplier
      
      await premiums.connect(owner).setCropRiskFactor(crop, riskFactor);
      
      expect(await premiums.cropRiskFactors(crop)).to.equal(riskFactor);
    });

    it("Should emit CropRiskFactorUpdated event", async function () {
      const crop = "corn";
      const riskFactor = 150;
      
      await expect(premiums.connect(owner).setCropRiskFactor(crop, riskFactor))
        .to.emit(premiums, "CropRiskFactorUpdated")
        .withArgs(crop, riskFactor);
    });

    it("Should fail to set crop risk factor from non-owner", async function () {
      await expect(
        premiums.connect(user1).setCropRiskFactor("corn", 150)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should allow owner to set location risk factor", async function () {
      const location = "HighRiskArea";
      const riskFactor = 200; // 2.0x multiplier
      
      await premiums.connect(owner).setLocationRiskFactor(location, riskFactor);
      
      expect(await premiums.locationRiskFactors(location)).to.equal(riskFactor);
    });

    it("Should allow owner to set weather risk factor", async function () {
      const weatherCondition = "drought";
      const riskFactor = 180; // 1.8x multiplier
      
      await premiums.connect(owner).setWeatherRiskFactor(weatherCondition, riskFactor);
      
      expect(await premiums.weatherRiskFactors(weatherCondition)).to.equal(riskFactor);
    });
  });

  describe("Premium Calculation", function () {
    beforeEach(async function () {
      // Set up risk factors
      await premiums.connect(owner).setCropRiskFactor("wheat", 120); // 1.2x
      await premiums.connect(owner).setLocationRiskFactor("Nairobi", 110); // 1.1x
      await premiums.connect(owner).setWeatherRiskFactor("moderate", 105); // 1.05x
    });

    it("Should calculate basic premium correctly", async function () {
      const coverageAmount = ethers.utils.parseEther("1000");
      const expectedPremium = coverageAmount.mul(500).div(10000); // 5% of 1000 = 50
      
      const calculatedPremium = await premiums.calculateBasicPremium(coverageAmount);
      expect(calculatedPremium).to.equal(expectedPremium);
    });

    it("Should calculate dynamic premium with all factors", async function () {
      const coverageAmount = ethers.utils.parseEther("1000");
      const cropType = "wheat";
      const location = "Nairobi";
      const weatherCondition = "moderate";
      
      const dynamicPremium = await premiums.calculateDynamicPremium(
        coverageAmount,
        cropType,
        location,
        weatherCondition
      );
      
      // Expected: 50 * 1.2 * 1.1 * 1.05 = 69.3
      const expectedPremium = ethers.utils.parseEther("1000")
        .mul(500).div(10000) // Basic premium: 50
        .mul(120).div(100) // Crop factor: 1.2
        .mul(110).div(100) // Location factor: 1.1
        .mul(105).div(100); // Weather factor: 1.05
      
      expect(dynamicPremium).to.equal(expectedPremium);
    });

    it("Should handle unknown crop types", async function () {
      const coverageAmount = ethers.utils.parseEther("1000");
      const unknownCrop = "unknown_crop";
      
      const dynamicPremium = await premiums.calculateDynamicPremium(
        coverageAmount,
        unknownCrop,
        "Nairobi",
        "moderate"
      );
      
      // Should use default multiplier (100)
      const expectedPremium = ethers.utils.parseEther("1000")
        .mul(500).div(10000) // Basic premium: 50
        .mul(100).div(100) // Default crop factor: 1.0
        .mul(110).div(100) // Location factor: 1.1
        .mul(105).div(100); // Weather factor: 1.05
      
      expect(dynamicPremium).to.equal(expectedPremium);
    });

    it("Should handle zero coverage amount", async function () {
      const zeroCoverage = 0;
      
      const dynamicPremium = await premiums.calculateDynamicPremium(
        zeroCoverage,
        "wheat",
        "Nairobi",
        "moderate"
      );
      
      expect(dynamicPremium).to.equal(0);
    });
  });

  describe("Premium History", function () {
    it("Should record premium calculation history", async function () {
      const coverageAmount = ethers.utils.parseEther("1000");
      const cropType = "wheat";
      const location = "Nairobi";
      const weatherCondition = "moderate";
      
      const tx = await premiums.recordPremiumCalculation(
        user1.address,
        coverageAmount,
        cropType,
        location,
        weatherCondition
      );
      
      const receipt = await tx.wait();
      expect(receipt.events[0].event).to.equal("PremiumCalculated");
      expect(receipt.events[0].args.user).to.equal(user1.address);
      expect(receipt.events[0].args.coverageAmount).to.equal(coverageAmount);
    });

    it("Should retrieve user premium history", async function () {
      const coverageAmount = ethers.utils.parseEther("1000");
      
      // Record multiple calculations
      await premiums.recordPremiumCalculation(
        user1.address,
        coverageAmount,
        "wheat",
        "Nairobi",
        "moderate"
      );
      
      await premiums.recordPremiumCalculation(
        user1.address,
        coverageAmount.mul(2),
        "corn",
        "Lagos",
        "severe"
      );
      
      const history = await premiums.getUserPremiumHistory(user1.address, 10);
      expect(history).to.have.length(2);
      expect(history[0].coverageAmount).to.equal(coverageAmount);
      expect(history[1].coverageAmount).to.equal(coverageAmount.mul(2));
    });

    it("Should limit history retrieval", async function () {
      const coverageAmount = ethers.utils.parseEther("1000");
      
      // Record more calculations than requested
      for (let i = 0; i < 5; i++) {
        await premiums.recordPremiumCalculation(
          user1.address,
          coverageAmount,
          "wheat",
          "Nairobi",
          "moderate"
        );
      }
      
      const history = await premiums.getUserPremiumHistory(user1.address, 3);
      expect(history).to.have.length(3); // Should limit to 3
    });
  });

  describe("Discount Management", function () {
    it("Should allow owner to add discount", async function () {
      const discountCode = "FARMER20";
      const discountPercentage = 2000; // 20%
      const expiryTime = Math.floor(Date.now() / 1000) + 86400; // 24 hours from now
      
      await premiums.connect(owner).addDiscount(
        discountCode,
        discountPercentage,
        expiryTime
      );
      
      const discount = await premiums.discounts(discountCode);
      expect(discount.percentage).to.equal(discountPercentage);
      expect(discount.expiryTime).to.equal(expiryTime);
      expect(discount.isActive).to.be.true;
    });

    it("Should emit DiscountAdded event", async function () {
      const discountCode = "FARMER20";
      const discountPercentage = 2000;
      const expiryTime = Math.floor(Date.now() / 1000) + 86400;
      
      await expect(premiums.connect(owner).addDiscount(discountCode, discountPercentage, expiryTime))
        .to.emit(premiums, "DiscountAdded")
        .withArgs(discountCode, discountPercentage, expiryTime);
    });

    it("Should apply discount to premium", async function () {
      const coverageAmount = ethers.utils.parseEther("1000");
      const discountCode = "FARMER20";
      const discountPercentage = 2000; // 20%
      const expiryTime = Math.floor(Date.now() / 1000) + 86400;
      
      await premiums.connect(owner).addDiscount(discountCode, discountPercentage, expiryTime);
      
      const discountedPremium = await premiums.calculatePremiumWithDiscount(
        coverageAmount,
        "wheat",
        "Nairobi",
        "moderate",
        discountCode
      );
      
      // Should be 20% less than the dynamic premium
      const dynamicPremium = await premiums.calculateDynamicPremium(
        coverageAmount,
        "wheat",
        "Nairobi",
        "moderate"
      );
      
      const expectedDiscountedPremium = dynamicPremium
        .mul(10000 - discountPercentage)
        .div(10000);
      
      expect(discountedPremium).to.equal(expectedDiscountedPremium);
    });

    it("Should fail with expired discount", async function () {
      const coverageAmount = ethers.utils.parseEther("1000");
      const discountCode = "EXPIRED";
      const pastTime = Math.floor(Date.now() / 1000) - 86400; // 24 hours ago
      
      await premiums.connect(owner).addDiscount(discountCode, 2000, pastTime);
      
      await expect(
        premiums.calculatePremiumWithDiscount(
          coverageAmount,
          "wheat",
          "Nairobi",
          "moderate",
          discountCode
        )
      ).to.be.revertedWith("Discount has expired");
    });

    it("Should fail with invalid discount code", async function () {
      const coverageAmount = ethers.utils.parseEther("1000");
      const invalidCode = "INVALID";
      
      await expect(
        premiums.calculatePremiumWithDiscount(
          coverageAmount,
          "wheat",
          "Nairobi",
          "moderate",
          invalidCode
        )
      ).to.be.revertedWith("Invalid discount code");
    });
  });

  describe("Base Rate Management", function () {
    it("Should allow owner to update base rate", async function () {
      const newBaseRate = 600; // 6%
      
      await premiums.connect(owner).updateBaseRate(newBaseRate);
      
      expect(await premiums.baseRate()).to.equal(newBaseRate);
    });

    it("Should emit BaseRateUpdated event", async function () {
      const newBaseRate = 600;
      
      await expect(premiums.connect(owner).updateBaseRate(newBaseRate))
        .to.emit(premiums, "BaseRateUpdated")
        .withArgs(newBaseRate);
    });

    it("Should fail to update base rate from non-owner", async function () {
      await expect(
        premiums.connect(user1).updateBaseRate(600)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should fail with zero base rate", async function () {
      await expect(
        premiums.connect(owner).updateBaseRate(0)
      ).to.be.revertedWith("Base rate must be greater than 0");
    });

    it("Should fail with base rate over 100%", async function () {
      await expect(
        premiums.connect(owner).updateBaseRate(10001) // 100.01%
      ).to.be.revertedWith("Base rate cannot exceed 100%");
    });
  });

  describe("Gas Optimization", function () {
    it("Should use reasonable gas for premium calculation", async function () {
      const coverageAmount = ethers.utils.parseEther("1000");
      
      const gasUsed = await premiums.estimateGas.calculateDynamicPremium(
        coverageAmount,
        "wheat",
        "Nairobi",
        "moderate"
      );
      
      expect(gasUsed).to.be.lessThan(100000);
    });

    it("Should use reasonable gas for risk factor updates", async function () {
      const gasUsed = await premiums.estimateGas.setCropRiskFactor("corn", 150);
      expect(gasUsed).to.be.lessThan(80000);
    });

    it("Should use reasonable gas for premium recording", async function () {
      const coverageAmount = ethers.utils.parseEther("1000");
      
      const gasUsed = await premiums.estimateGas.recordPremiumCalculation(
        user1.address,
        coverageAmount,
        "wheat",
        "Nairobi",
        "moderate"
      );
      
      expect(gasUsed).to.be.lessThan(150000);
    });
  });

  describe("Edge Cases", function () {
    it("Should handle maximum coverage amount", async function () {
      const maxCoverage = ethers.utils.parseEther("1000000"); // 1M tokens
      
      const dynamicPremium = await premiums.calculateDynamicPremium(
        maxCoverage,
        "wheat",
        "Nairobi",
        "moderate"
      );
      
      expect(dynamicPremium).to.be.gt(0);
    });

    it("Should handle minimum coverage amount", async function () {
      const minCoverage = ethers.utils.parseEther("0.01"); // 0.01 tokens
      
      const dynamicPremium = await premiums.calculateDynamicPremium(
        minCoverage,
        "wheat",
        "Nairobi",
        "moderate"
      );
      
      expect(dynamicPremium).to.be.gte(0);
    });

    it("Should handle extreme risk factors", async function () {
      const extremeRiskFactor = 500; // 5x multiplier
      
      await premiums.connect(owner).setCropRiskFactor("extreme_crop", extremeRiskFactor);
      
      const coverageAmount = ethers.utils.parseEther("1000");
      const dynamicPremium = await premiums.calculateDynamicPremium(
        coverageAmount,
        "extreme_crop",
        "Nairobi",
        "moderate"
      );
      
      expect(dynamicPremium).to.be.gt(ethers.utils.parseEther("250")); // Should be > 5x base
    });

    it("Should handle zero risk factors", async function () {
      const zeroRiskFactor = 0; // 0x multiplier
      
      await premiums.connect(owner).setCropRiskFactor("zero_risk_crop", zeroRiskFactor);
      
      const coverageAmount = ethers.utils.parseEther("1000");
      const dynamicPremium = await premiums.calculateDynamicPremium(
        coverageAmount,
        "zero_risk_crop",
        "Nairobi",
        "moderate"
      );
      
      expect(dynamicPremium).to.be.gte(0);
    });
  });
});
