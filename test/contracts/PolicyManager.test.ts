import { expect } from "chai";
import { ethers } from "hardhat";
import { PolicyManager } from "../../typechain-types";

describe("PolicyManager", function () {
  let policyManager: PolicyManager;
  let owner: any;
  let user1: any;
  let user2: any;
  let cusdToken: any;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    
    // Deploy mock cUSD token
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    cusdToken = await MockERC20.deploy("cUSD", "cUSD", 18, ethers.utils.parseEther("10000"));
    await cusdToken.deployed();

    // Deploy PolicyManager
    const PolicyManagerFactory = await ethers.getContractFactory("PolicyManager");
    policyManager = await PolicyManagerFactory.deploy(cusdToken.address);
    await policyManager.deployed();

    // Mint tokens to users
    await cusdToken.mint(user1.address, ethers.utils.parseEther("1000"));
    await cusdToken.mint(user2.address, ethers.utils.parseEther("1000"));
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await policyManager.owner()).to.equal(owner.address);
    });

    it("Should set the right cUSD token", async function () {
      expect(await policyManager.cusdToken()).to.equal(cusdToken.address);
    });
  });

  describe("Policy Creation", function () {
    it("Should create a policy with valid parameters", async function () {
      const cropType = "wheat";
      const location = "Nairobi";
      const coverageAmount = ethers.utils.parseEther("1000");
      const rainfallThreshold = 100;
      const measurementPeriod = 30;

      await cusdToken.connect(user1).approve(policyManager.address, ethers.utils.parseEther("100"));
      
      const tx = await policyManager.connect(user1).createPolicy(
        cropType,
        location,
        coverageAmount,
        rainfallThreshold,
        measurementPeriod
      );
      
      const receipt = await tx.wait();
      expect(receipt.events).to.have.length(1);
      expect(receipt.events[0].event).to.equal("PolicyCreated");
    });

    it("Should fail with zero coverage amount", async function () {
      await expect(
        policyManager.connect(user1).createPolicy(
          "wheat",
          "Nairobi",
          0,
          100,
          30
        )
      ).to.be.revertedWith("Coverage amount must be greater than 0");
    });

    it("Should fail with insufficient allowance", async function () {
      await expect(
        policyManager.connect(user1).createPolicy(
          "wheat",
          "Nairobi",
          ethers.utils.parseEther("1000"),
          100,
          30
        )
      ).to.be.revertedWith("ERC20: insufficient allowance");
    });

    it("Should fail with invalid crop type", async function () {
      await cusdToken.connect(user1).approve(policyManager.address, ethers.utils.parseEther("100"));
      
      await expect(
        policyManager.connect(user1).createPolicy(
          "",
          "Nairobi",
          ethers.utils.parseEther("1000"),
          100,
          30
        )
      ).to.be.revertedWith("Crop type cannot be empty");
    });
  });

  describe("Policy Management", function () {
    let policyId: number;

    beforeEach(async function () {
      await cusdToken.connect(user1).approve(policyManager.address, ethers.utils.parseEther("100"));
      
      const tx = await policyManager.connect(user1).createPolicy(
        "wheat",
        "Nairobi",
        ethers.utils.parseEther("1000"),
        100,
        30
      );
      
      const receipt = await tx.wait();
      policyId = receipt.events[0].args.policyId;
    });

    it("Should get policy details correctly", async function () {
      const policy = await policyManager.getPolicy(policyId);
      
      expect(policy.farmer).to.equal(user1.address);
      expect(policy.coverageAmount).to.equal(ethers.utils.parseEther("1000"));
      expect(policy.rainfallThreshold).to.equal(100);
      expect(policy.measurementPeriod).to.equal(30);
      expect(policy.isActive).to.be.true;
    });

    it("Should get farmer policies correctly", async function () {
      const policies = await policyManager.getFarmerPolicies(user1.address);
      expect(policies).to.have.length(1);
      expect(policies[0]).to.equal(policyId);
    });

    it("Should update policy status correctly", async function () {
      await policyManager.connect(owner).updatePolicyStatus(policyId, false);
      
      const policy = await policyManager.getPolicy(policyId);
      expect(policy.isActive).to.be.false;
    });

    it("Should fail to update policy status from non-owner", async function () {
      await expect(
        policyManager.connect(user2).updatePolicyStatus(policyId, false)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Premium Calculation", function () {
    it("Should calculate premium correctly for standard policy", async function () {
      const coverageAmount = ethers.utils.parseEther("1000");
      const rainfallThreshold = 100;
      const measurementPeriod = 30;
      const cropType = "wheat";
      const location = "Nairobi";

      const premium = await policyManager.calculatePremium(
        coverageAmount,
        rainfallThreshold,
        measurementPeriod,
        cropType,
        location
      );

      // Expected premium: 5% of coverage amount = 50 cUSD
      expect(premium).to.equal(ethers.utils.parseEther("50"));
    });

    it("Should calculate higher premium for high-risk areas", async function () {
      const coverageAmount = ethers.utils.parseEther("1000");
      const rainfallThreshold = 50; // Lower threshold = higher risk
      const measurementPeriod = 30;
      const cropType = "rice";
      const location = "HighRiskArea";

      const premium = await policyManager.calculatePremium(
        coverageAmount,
        rainfallThreshold,
        measurementPeriod,
        cropType,
        location
      );

      // Should be higher than standard rate
      expect(premium).to.be.gt(ethers.utils.parseEther("50"));
    });

    it("Should calculate lower premium for low-risk areas", async function () {
      const coverageAmount = ethers.utils.parseEther("1000");
      const rainfallThreshold = 200; // Higher threshold = lower risk
      const measurementPeriod = 30;
      const cropType = "wheat";
      const location = "LowRiskArea";

      const premium = await policyManager.calculatePremium(
        coverageAmount,
        rainfallThreshold,
        measurementPeriod,
        cropType,
        location
      );

      // Should be lower than standard rate
      expect(premium).to.be.lt(ethers.utils.parseEther("50"));
    });
  });

  describe("Policy Validation", function () {
    it("Should validate policy parameters correctly", async function () {
      const isValid = await policyManager.validatePolicyParameters(
        "wheat",
        "Nairobi",
        ethers.utils.parseEther("1000"),
        100,
        30
      );

      expect(isValid).to.be.true;
    });

    it("Should reject invalid policy parameters", async function () {
      const isValid = await policyManager.validatePolicyParameters(
        "",
        "Nairobi",
        0,
        0,
        0
      );

      expect(isValid).to.be.false;
    });

    it("Should check crop type eligibility", async function () {
      const isEligible = await policyManager.isCropTypeEligible("wheat");
      expect(isEligible).to.be.true;

      const isNotEligible = await policyManager.isCropTypeEligible("illegal_crop");
      expect(isNotEligible).to.be.false;
    });
  });

  describe("Gas Optimization", function () {
    it("Should use reasonable gas for policy creation", async function () {
      await cusdToken.connect(user1).approve(policyManager.address, ethers.utils.parseEther("100"));
      
      const tx = await policyManager.connect(user1).createPolicy(
        "wheat",
        "Nairobi",
        ethers.utils.parseEther("1000"),
        100,
        30
      );
      
      const receipt = await tx.wait();
      expect(receipt.gasUsed).to.be.lessThan(200000);
    });

    it("Should use reasonable gas for policy retrieval", async function () {
      const gasUsed = await policyManager.estimateGas.getFarmerPolicies(user1.address);
      expect(gasUsed).to.be.lessThan(50000);
    });
  });

  describe("Edge Cases", function () {
    it("Should handle maximum coverage amount", async function () {
      const maxCoverage = ethers.utils.parseEther("1000000"); // 1M cUSD
      
      await cusdToken.connect(user1).approve(policyManager.address, ethers.utils.parseEther("50000"));
      
      const tx = await policyManager.connect(user1).createPolicy(
        "wheat",
        "Nairobi",
        maxCoverage,
        100,
        30
      );
      
      const receipt = await tx.wait();
      expect(receipt.events[0].args.coverageAmount).to.equal(maxCoverage);
    });

    it("Should handle minimum coverage amount", async function () {
      const minCoverage = ethers.utils.parseEther("1"); // 1 cUSD
      
      await cusdToken.connect(user1).approve(policyManager.address, ethers.utils.parseEther("0.1"));
      
      const tx = await policyManager.connect(user1).createPolicy(
        "wheat",
        "Nairobi",
        minCoverage,
        100,
        30
      );
      
      const receipt = await tx.wait();
      expect(receipt.events[0].args.coverageAmount).to.equal(minCoverage);
    });

    it("Should handle concurrent policy creation", async function () {
      await cusdToken.connect(user1).approve(policyManager.address, ethers.utils.parseEther("200"));
      await cusdToken.connect(user2).approve(policyManager.address, ethers.utils.parseEther("200"));
      
      const tx1 = policyManager.connect(user1).createPolicy(
        "wheat",
        "Nairobi",
        ethers.utils.parseEther("1000"),
        100,
        30
      );
      
      const tx2 = policyManager.connect(user2).createPolicy(
        "corn",
        "Lagos",
        ethers.utils.parseEther("1000"),
        100,
        30
      );
      
      const [receipt1, receipt2] = await Promise.all([
        tx1.wait(),
        tx2.wait()
      ]);
      
      expect(receipt1.events[0].event).to.equal("PolicyCreated");
      expect(receipt2.events[0].event).to.equal("PolicyCreated");
      expect(receipt1.events[0].args.policyId).to.not.equal(receipt2.events[0].args.policyId);
    });
  });
});
