import { expect } from "chai";
import { ethers } from "hardhat";
import { AgroShieldPool } from "../../typechain-types";

describe("AgroShieldPool - Enhanced Tests", function () {
  let pool: AgroShieldPool;
  let owner: any;
  let user1: any;
  let user2: any;
  let cusdToken: any;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    
    // Deploy mock cUSD token
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    cusdToken = await MockERC20.deploy("cUSD", "cUSD", 18, ethers.utils.parseEther("1000"));
    await cusdToken.deployed();

    // Deploy AgroShieldPool
    const AgroShieldPoolFactory = await ethers.getContractFactory("AgroShieldPool");
    pool = await AgroShieldPoolFactory.deploy(cusdToken.address);
    await pool.deployed();

    // Mint tokens to users
    await cusdToken.mint(user1.address, ethers.utils.parseEther("100"));
    await cusdToken.mint(user2.address, ethers.utils.parseEther("100"));
  });

  describe("Advanced Liquidity Management", function () {
    it("Should handle multiple users correctly", async function () {
      const amount1 = ethers.utils.parseEther("10");
      const amount2 = ethers.utils.parseEther("20");
      
      await cusdToken.connect(user1).approve(pool.address, amount1);
      await cusdToken.connect(user2).approve(pool.address, amount2);
      
      await pool.connect(user1).provideLiquidity(amount1);
      await pool.connect(user2).provideLiquidity(amount2);
      
      const totalLiquidity = await pool.totalLiquidity();
      expect(totalLiquidity).to.equal(ethers.utils.parseEther("30"));
    });

    it("Should handle partial withdrawals correctly", async function () {
      const depositAmount = ethers.utils.parseEther("50");
      
      await cusdToken.connect(user1).approve(pool.address, depositAmount);
      await pool.connect(user1).provideLiquidity(depositAmount);
      
      const withdrawAmount = ethers.utils.parseEther("20");
      await pool.connect(user1).withdrawLiquidity(withdrawAmount);
      
      const userDeposits = await pool.userDeposits(user1.address);
      const userShares = await pool.userShares(user1.address);
      
      expect(userDeposits).to.equal(ethers.utils.parseEther("30"));
      expect(userShares).to.equal(ethers.utils.parseEther("30"));
    });

    it("Should track share percentages correctly", async function () {
      const amount1 = ethers.utils.parseEther("10");
      const amount2 = ethers.utils.parseEther("40");
      
      await cusdToken.connect(user1).approve(pool.address, amount1);
      await cusdToken.connect(user2).approve(pool.address, amount2);
      
      await pool.connect(user1).provideLiquidity(amount1);
      await pool.connect(user2).provideLiquidity(amount2);
      
      const position1 = await pool.getUserPosition(user1.address);
      const position2 = await pool.getUserPosition(user2.address);
      
      expect(position1.sharePercentage).to.equal(2000); // 20%
      expect(position2.sharePercentage).to.equal(8000); // 80%
    });
  });

  describe("Edge Cases", function () {
    it("Should handle maximum amounts", async function () {
      const maxAmount = ethers.utils.parseEther("1000");
      
      await cusdToken.connect(user1).approve(pool.address, maxAmount);
      await pool.connect(user1).provideLiquidity(maxAmount);
      
      const userDeposits = await pool.userDeposits(user1.address);
      expect(userDeposits).to.equal(maxAmount);
    });

    it("Should handle minimum amounts", async function () {
      const minAmount = ethers.utils.parseEther("0.01");
      
      await cusdToken.connect(user1).approve(pool.address, minAmount);
      await pool.connect(user1).provideLiquidity(minAmount);
      
      const userDeposits = await pool.userDeposits(user1.address);
      expect(userDeposits).to.equal(minAmount);
    });

    it("Should prevent double withdrawals", async function () {
      const amount = ethers.utils.parseEther("10");
      
      await cusdToken.connect(user1).approve(pool.address, amount);
      await pool.connect(user1).provideLiquidity(amount);
      
      await pool.connect(user1).withdrawLiquidity(amount);
      
      // Second withdrawal should fail
      await expect(
        pool.connect(user1).withdrawLiquidity(amount)
      ).to.be.revertedWith("Insufficient shares");
    });
  });

  describe("Performance Tests", function () {
    it("Should maintain gas efficiency under load", async function () {
      const amount = ethers.utils.parseEther("10");
      
      await cusdToken.connect(user1).approve(pool.address, amount);
      
      const tx1 = await pool.connect(user1).provideLiquidity(amount);
      const receipt1 = await tx1.wait();
      
      const tx2 = await pool.connect(user1).withdrawLiquidity(amount);
      const receipt2 = await tx2.wait();
      
      // Both transactions should use reasonable gas
      expect(receipt1.gasUsed).to.be.lessThan(80000);
      expect(receipt2.gasUsed).to.be.lessThan(80000);
    });

    it("Should handle concurrent operations", async function () {
      const amount = ethers.utils.parseEther("10");
      
      await cusdToken.connect(user1).approve(pool.address, amount);
      await cusdToken.connect(user2).approve(pool.address, amount);
      
      // Concurrent operations should work
      const tx1 = pool.connect(user1).provideLiquidity(amount);
      const tx2 = pool.connect(user2).provideLiquidity(amount);
      
      await Promise.all([tx1.wait(), tx2.wait()]);
      
      const totalLiquidity = await pool.totalLiquidity();
      expect(totalLiquidity).to.equal(ethers.utils.parseEther("20"));
    });
  });

  describe("Integration Tests", function () {
    it("Should work with real cUSD token", async function () {
      // This test would use real cUSD on testnet
      const realCUSDAddress = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1";
      
      const AgroShieldPoolFactory = await ethers.getContractFactory("AgroShieldPool");
      const realPool = await AgroShieldPoolFactory.deploy(realCUSDAddress);
      await realPool.deployed();
      
      expect(await realPool.cusdToken()).to.equal(realCUSDAddress);
    });

    it("Should emit correct events", async function () {
      const amount = ethers.utils.parseEther("10");
      
      await cusdToken.connect(user1).approve(pool.address, amount);
      
      await expect(pool.connect(user1).provideLiquidity(amount))
        .to.emit(pool, "LiquidityProvided")
        .withArgs(user1.address, amount, amount);
    });
  });
});
