import { expect } from "chai";
import { ethers } from "hardhat";
import { MultiCropPolicy } from "../../typechain-types";

describe("MultiCropPolicy", function () {
  let multiCropPolicy: MultiCropPolicy;
  let cusdToken: any;
  let owner: any;
  let farmer: any;
  let insurer: any;

  beforeEach(async function () {
    [owner, farmer, insurer] = await ethers.getSigners();
    
    // Deploy mock cUSD token
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    cusdToken = await MockERC20.deploy("cUSD", "cUSD", 18, ethers.utils.parseEther("1000000"));
    await cusdToken.deployed();

    // Deploy MultiCropPolicy
    const MultiCropPolicyFactory = await ethers.getContractFactory("MultiCropPolicy");
    multiCropPolicy = await MultiCropPolicyFactory.deploy(cusdToken.address);
    await multiCropPolicy.deployed();

    // Mint tokens to farmer
    await cusdToken.mint(farmer.address, ethers.utils.parseEther("10000"));
    
    // Add insurer as authorized
    await multiCropPolicy.connect(owner).addAuthorizedInsurer(insurer.address);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await multiCropPolicy.owner()).to.equal(owner.address);
    });

    it("Should set the right cUSD token", async function () {
      expect(await multiCropPolicy.cusdToken()).to.equal(cusdToken.address);
    });

    it("Should initialize with zero policies", async function () {
      expect(await multiCropPolicy.totalPolicies()).to.equal(0);
    });

    it("Should initialize with default coverage limits", async function () {
      expect(await multiCropPolicy.maxCoveragePerPolicy()).to.equal(ethers.utils.parseEther("10000"));
    });
  });

  describe("Policy Creation", function () {
    const cropTypes = ["wheat", "corn", "rice"];
    const coverageAmounts = [
      ethers.utils.parseEther("1000"),
      ethers.utils.parseEther("2000"),
      ethers.utils.parseEther("1500")
    ];
    const totalCoverage = coverageAmounts.reduce((sum, amount) => sum.add(amount), ethers.BigNumber.from(0));

    beforeEach(async function () {
      await cusdToken.connect(farmer).approve(multiCropPolicy.address, totalCoverage);
    });

    it("Should create multi-crop policy", async function () {
      const tx = await multiCropPolicy.connect(farmer).createMultiCropPolicy(
        farmer.address,
        cropTypes,
        coverageAmounts,
        100, // rainfall threshold
        30, // measurement period
        "Nairobi"
      );
      
      const receipt = await tx.wait();
      expect(receipt.events[0].event).to.equal("MultiCropPolicyCreated");
      expect(receipt.events[0].args.farmer).to.equal(farmer.address);
      expect(receipt.events[0].args.totalCoverage).to.equal(totalCoverage);
    });

    it("Should store policy data correctly", async function () {
      await multiCropPolicy.connect(farmer).createMultiCropPolicy(
        farmer.address,
        cropTypes,
        coverageAmounts,
        100,
        30,
        "Nairobi"
      );

      const policy = await multiCropPolicy.getPolicy(1);
      expect(policy.farmer).to.equal(farmer.address);
      expect(policy.totalCoverage).to.equal(totalCoverage);
      expect(policy.cropTypes).to.deep.equal(cropTypes);
      expect(policy.coverageAmounts).to.deep.equal(coverageAmounts);
      expect(policy.rainfallThreshold).to.equal(100);
      expect(policy.measurementPeriod).to.equal(30);
      expect(policy.location).to.equal("Nairobi");
      expect(policy.isActive).to.be.true;
    });

    it("Should update farmer policy count", async function () {
      await multiCropPolicy.connect(farmer).createMultiCropPolicy(
        farmer.address,
        cropTypes,
        coverageAmounts,
        100,
        30,
        "Nairobi"
      );

      const farmerPolicies = await multiCropPolicy.getFarmerPolicies(farmer.address);
      expect(farmerPolicies).to.have.length(1);
      expect(farmerPolicies[0]).to.equal(1);
    });

    it("Should fail with empty crop types", async function () {
      await expect(
        multiCropPolicy.connect(farmer).createMultiCropPolicy(
          farmer.address,
          [],
          coverageAmounts,
          100,
          30,
          "Nairobi"
        )
      ).to.be.revertedWith("Crop types cannot be empty");
    });

    it("Should fail with mismatched array lengths", async function () {
      await expect(
        multiCropPolicy.connect(farmer).createMultiCropPolicy(
          farmer.address,
          ["wheat", "corn"], // 2 crops
          coverageAmounts, // 3 amounts
          100,
          30,
          "Nairobi"
        )
      ).to.be.revertedWith("Array lengths must match");
    });

    it("Should fail with insufficient allowance", async function () {
      const highCoverage = [ethers.utils.parseEther("50000")]; // Higher than approved
      
      await expect(
        multiCropPolicy.connect(farmer).createMultiCropPolicy(
          farmer.address,
          ["wheat"],
          highCoverage,
          100,
          30,
          "Nairobi"
        )
      ).to.be.revertedWith("ERC20: insufficient allowance");
    });
  });

  describe("Premium Calculation", function () {
    const cropTypes = ["wheat", "corn"];
    const coverageAmounts = [
      ethers.utils.parseEther("1000"),
      ethers.utils.parseEther("2000")
    ];

    beforeEach(async function () {
      await multiCropPolicy.connect(owner).setCropRiskFactor("wheat", 120); // 1.2x
      await multiCropPolicy.connect(owner).setCropRiskFactor("corn", 150); // 1.5x
      await multiCropPolicy.connect(owner).setLocationRiskFactor("Nairobi", 110); // 1.1x
    });

    it("Should calculate multi-crop premium correctly", async function () {
      const premium = await multiCropPolicy.calculateMultiCropPremium(
        cropTypes,
        coverageAmounts,
        "Nairobi"
      );

      // Expected: (1000 * 0.05 * 1.2 * 1.1) + (2000 * 0.05 * 1.5 * 1.1)
      const expectedPremium = ethers.utils.parseEther("1000")
        .mul(500).div(10000) // 5% base rate
        .mul(120).div(100) // wheat risk factor
        .mul(110).div(100) // location risk factor
        .add(
          ethers.utils.parseEther("2000")
            .mul(500).div(10000) // 5% base rate
            .mul(150).div(100) // corn risk factor
            .mul(110).div(100) // location risk factor
        );

      expect(premium).to.equal(expectedPremium);
    });

    it("Should handle unknown crop types", async function () {
      const premium = await multiCropPolicy.calculateMultiCropPremium(
        ["unknown_crop"],
        [ethers.utils.parseEther("1000")],
        "Nairobi"
      );

      // Should use default risk factor (100)
      const expectedPremium = ethers.utils.parseEther("1000")
        .mul(500).div(10000) // 5% base rate
        .mul(100).div(100) // default crop risk factor
        .mul(110).div(100); // location risk factor

      expect(premium).to.equal(expectedPremium);
    });
  });

  describe("Claim Processing", function () {
    const cropTypes = ["wheat", "corn"];
    const coverageAmounts = [
      ethers.utils.parseEther("1000"),
      ethers.utils.parseEther("2000")
    ];

    beforeEach(async function () {
      await cusdToken.connect(farmer).approve(multiCropPolicy.address, ethers.utils.parseEther("500"));
      await multiCropPolicy.connect(farmer).createMultiCropPolicy(
        farmer.address,
        cropTypes,
        coverageAmounts,
        100,
        30,
        "Nairobi"
      );
    });

    it("Should process valid claim", async function () {
      const rainfallData = [80, 90]; // Both below threshold of 100
      const claimAmount = ethers.utils.parseEther("500");

      const tx = await multiCropPolicy.connect(insurer).processMultiCropClaim(
        1, // policy ID
        rainfallData,
        claimAmount,
        "Drought conditions confirmed"
      );
      
      const receipt = await tx.wait();
      expect(receipt.events[0].event).to.equal("MultiCropClaimProcessed");
      expect(receipt.events[0].args.policyId).to.equal(1);
      expect(receipt.events[0].args.claimAmount).to.equal(claimAmount);
    });

    it("Should transfer claim amount to farmer", async function () {
      const rainfallData = [80, 90];
      const claimAmount = ethers.utils.parseEther("500");
      
      const farmerBalanceBefore = await cusdToken.balanceOf(farmer.address);
      
      await multiCropPolicy.connect(insurer).processMultiCropClaim(
        1,
        rainfallData,
        claimAmount,
        "Drought conditions confirmed"
      );
      
      const farmerBalanceAfter = await cusdToken.balanceOf(farmer.address);
      expect(farmerBalanceAfter).to.equal(farmerBalanceBefore.add(claimAmount));
    });

    it("Should calculate partial claims correctly", async function () {
      const rainfallData = [80, 120]; // One crop affected, one not
      const claimAmount = ethers.utils.parseEther("500");
      
      const tx = await multiCropPolicy.connect(insurer).processMultiCropClaim(
        1,
        rainfallData,
        claimAmount,
        "Partial drought conditions"
      );
      
      const receipt = await tx.wait();
      // Should only pay for affected crop (wheat)
      const expectedPartialAmount = ethers.utils.parseEther("1000") // wheat coverage
        .mul(500).div(10000) // 5% premium
        .mul(120).div(100) // wheat risk factor
        .mul(110).div(100); // location risk factor
      
      expect(receipt.events[0].args.payoutAmount).to.be.lte(expectedPartialAmount);
    });

    it("Should fail with invalid rainfall data length", async function () {
      await expect(
        multiCropPolicy.connect(insurer).processMultiCropClaim(
          1,
          [80], // Only 1 rainfall reading for 2 crops
          ethers.utils.parseEther("500"),
          "Drought conditions"
        )
      ).to.be.revertedWith("Rainfall data length must match crop types");
    });

    it("Should fail from unauthorized insurer", async function () {
      await expect(
        multiCropPolicy.connect(farmer).processMultiCropClaim(
          1,
          [80, 90],
          ethers.utils.parseEther("500"),
          "Drought conditions"
        )
      ).to.be.revertedWith("Not authorized insurer");
    });

    it("Should fail for inactive policy", async function () {
      await multiCropPolicy.connect(owner).deactivatePolicy(1);
      
      await expect(
        multiCropPolicy.connect(insurer).processMultiCropClaim(
          1,
          [80, 90],
          ethers.utils.parseEther("500"),
          "Drought conditions"
        )
      ).to.be.revertedWith("Policy is not active");
    });
  });

  describe("Policy Management", function () {
    const cropTypes = ["wheat", "corn"];
    const coverageAmounts = [
      ethers.utils.parseEther("1000"),
      ethers.utils.parseEther("2000")
    ];

    beforeEach(async function () {
      await cusdToken.connect(farmer).approve(multiCropPolicy.address, ethers.utils.parseEther("500"));
      await multiCropPolicy.connect(farmer).createMultiCropPolicy(
        farmer.address,
        cropTypes,
        coverageAmounts,
        100,
        30,
        "Nairobi"
      );
    });

    it("Should allow owner to deactivate policy", async function () {
      await multiCropPolicy.connect(owner).deactivatePolicy(1);
      
      const policy = await multiCropPolicy.getPolicy(1);
      expect(policy.isActive).to.be.false;
    });

    it("Should emit PolicyDeactivated event", async function () {
      await expect(multiCropPolicy.connect(owner).deactivatePolicy(1))
        .to.emit(multiCropPolicy, "PolicyDeactivated")
        .withArgs(1);
    });

    it("Should fail to deactivate from non-owner", async function () {
      await expect(
        multiCropPolicy.connect(farmer).deactivatePolicy(1)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should allow policy modification", async function () {
      const newRainfallThreshold = 150;
      const newMeasurementPeriod = 45;
      
      await multiCropPolicy.connect(owner).modifyPolicy(
        1,
        newRainfallThreshold,
        newMeasurementPeriod
      );
      
      const policy = await multiCropPolicy.getPolicy(1);
      expect(policy.rainfallThreshold).to.equal(newRainfallThreshold);
      expect(policy.measurementPeriod).to.equal(newMeasurementPeriod);
    });

    it("Should emit PolicyModified event", async function () {
      const newRainfallThreshold = 150;
      const newMeasurementPeriod = 45;
      
      await expect(multiCropPolicy.connect(owner).modifyPolicy(1, newRainfallThreshold, newMeasurementPeriod))
        .to.emit(multiCropPolicy, "PolicyModified")
        .withArgs(1, newRainfallThreshold, newMeasurementPeriod);
    });
  });

  describe("Risk Factor Management", function () {
    it("Should allow owner to set crop risk factor", async function () {
      const crop = "sorghum";
      const riskFactor = 130; // 1.3x multiplier
      
      await multiCropPolicy.connect(owner).setCropRiskFactor(crop, riskFactor);
      
      expect(await multiCropPolicy.cropRiskFactors(crop)).to.equal(riskFactor);
    });

    it("Should allow owner to set location risk factor", async function () {
      const location = "HighRiskRegion";
      const riskFactor = 180; // 1.8x multiplier
      
      await multiCropPolicy.connect(owner).setLocationRiskFactor(location, riskFactor);
      
      expect(await multiCropPolicy.locationRiskFactors(location)).to.equal(riskFactor);
    });

    it("Should emit RiskFactorUpdated events", async function () {
      const crop = "sorghum";
      const riskFactor = 130;
      
      await expect(multiCropPolicy.connect(owner).setCropRiskFactor(crop, riskFactor))
        .to.emit(multiCropPolicy, "CropRiskFactorUpdated")
        .withArgs(crop, riskFactor);
    });

    it("Should fail to set risk factor from non-owner", async function () {
      await expect(
        multiCropPolicy.connect(farmer).setCropRiskFactor("sorghum", 130)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Gas Optimization", function () {
    it("Should use reasonable gas for policy creation", async function () {
      const cropTypes = ["wheat", "corn", "rice"];
      const coverageAmounts = [
        ethers.utils.parseEther("1000"),
        ethers.utils.parseEther("2000"),
        ethers.utils.parseEther("1500")
      ];
      
      await cusdToken.connect(farmer).approve(multiCropPolicy.address, ethers.utils.parseEther("5000"));
      
      const tx = await multiCropPolicy.connect(farmer).createMultiCropPolicy(
        farmer.address,
        cropTypes,
        coverageAmounts,
        100,
        30,
        "Nairobi"
      );
      
      const receipt = await tx.wait();
      expect(receipt.gasUsed).to.be.lessThan(300000);
    });

    it("Should use reasonable gas for claim processing", async function () {
      const cropTypes = ["wheat", "corn"];
      const coverageAmounts = [
        ethers.utils.parseEther("1000"),
        ethers.utils.parseEther("2000")
      ];
      
      await cusdToken.connect(farmer).approve(multiCropPolicy.address, ethers.utils.parseEther("500"));
      await multiCropPolicy.connect(farmer).createMultiCropPolicy(
        farmer.address,
        cropTypes,
        coverageAmounts,
        100,
        30,
        "Nairobi"
      );
      
      const tx = await multiCropPolicy.connect(insurer).processMultiCropClaim(
        1,
        [80, 90],
        ethers.utils.parseEther("500"),
        "Drought conditions"
      );
      
      const receipt = await tx.wait();
      expect(receipt.gasUsed).to.be.lessThan(250000);
    });
  });

  describe("Edge Cases", function () {
    it("Should handle maximum number of crops", async function () {
      const maxCrops = 10;
      const cropTypes = Array.from({ length: maxCrops }, (_, i) => `crop${i}`);
      const coverageAmounts = Array.from({ length: maxCrops }, () => ethers.utils.parseEther("1000"));
      const totalCoverage = coverageAmounts.reduce((sum, amount) => sum.add(amount), ethers.BigNumber.from(0));
      
      await cusdToken.connect(farmer).approve(multiCropPolicy.address, totalCoverage);
      
      const tx = await multiCropPolicy.connect(farmer).createMultiCropPolicy(
        farmer.address,
        cropTypes,
        coverageAmounts,
        100,
        30,
        "Nairobi"
      );
      
      const receipt = await tx.wait();
      expect(receipt.events[0].args.cropTypes).to.have.length(maxCrops);
    });

    it("Should handle maximum coverage amount", async function () {
      const maxCoverage = ethers.utils.parseEther("10000"); // Maximum allowed
      
      await cusdToken.connect(farmer).approve(multiCropPolicy.address, maxCoverage);
      
      const tx = await multiCropPolicy.connect(farmer).createMultiCropPolicy(
        farmer.address,
        ["wheat"],
        [maxCoverage],
        100,
        30,
        "Nairobi"
      );
      
      const receipt = await tx.wait();
      expect(receipt.events[0].args.totalCoverage).to.equal(maxCoverage);
    });

    it("Should fail with coverage exceeding maximum", async function () {
      const excessiveCoverage = ethers.utils.parseEther("20000"); // Exceeds maximum
      
      await expect(
        multiCropPolicy.connect(farmer).createMultiCropPolicy(
          farmer.address,
          ["wheat"],
          [excessiveCoverage],
          100,
          30,
          "Nairobi"
        )
      ).to.be.revertedWith("Coverage exceeds maximum limit");
    });

    it("Should handle zero rainfall threshold", async function () {
      const cropTypes = ["wheat"];
      const coverageAmounts = [ethers.utils.parseEther("1000")];
      
      await cusdToken.connect(farmer).approve(multiCropPolicy.address, ethers.utils.parseEther("100"));
      
      await expect(
        multiCropPolicy.connect(farmer).createMultiCropPolicy(
          farmer.address,
          cropTypes,
          coverageAmounts,
          0, // Zero threshold
          30,
          "Nairobi"
        )
      ).to.be.revertedWith("Rainfall threshold must be greater than 0");
    });
  });
});
