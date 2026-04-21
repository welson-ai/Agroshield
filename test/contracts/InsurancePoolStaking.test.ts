import { expect } from "chai";
import { ethers } from "hardhat";
import { InsurancePoolStaking } from "../../typechain-types";

describe("InsurancePoolStaking", function () {
  let staking: InsurancePoolStaking;
  let pool: any;
  let rewardToken: any;
  let owner: any;
  let user1: any;
  let user2: any;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    
    // Deploy mock reward token
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    rewardToken = await MockERC20.deploy("Reward Token", "REWARD", 18, ethers.utils.parseEther("1000000"));
    await rewardToken.deployed();

    // Deploy mock pool
    const MockPool = await ethers.getContractFactory("MockPool");
    pool = await MockPool.deploy();
    await pool.deployed();

    // Deploy InsurancePoolStaking
    const InsurancePoolStakingFactory = await ethers.getContractFactory("InsurancePoolStaking");
    staking = await InsurancePoolStakingFactory.deploy(pool.address, rewardToken.address);
    await staking.deployed();

    // Mint reward tokens to staking contract
    await rewardToken.mint(staking.address, ethers.utils.parseEther("100000"));
    
    // Mint pool tokens to users
    await pool.mint(user1.address, ethers.utils.parseEther("1000"));
    await pool.mint(user2.address, ethers.utils.parseEther("1000"));
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await staking.owner()).to.equal(owner.address);
    });

    it("Should set the right pool address", async function () {
      expect(await staking.pool()).to.equal(pool.address);
    });

    it("Should set the right reward token address", async function () {
      expect(await staking.rewardToken()).to.equal(rewardToken.address);
    });

    it("Should initialize with zero total staked", async function () {
      expect(await staking.totalStaked()).to.equal(0);
    });

    it("Should initialize with default reward rate", async function () {
      expect(await staking.rewardRate()).to.equal(100); // 1% per day
    });
  });

  describe("Staking", function () {
    const stakeAmount = ethers.utils.parseEther("100");

    beforeEach(async function () {
      await pool.connect(user1).approve(staking.address, stakeAmount);
    });

    it("Should stake pool tokens", async function () {
      const tx = await staking.connect(user1).stake(stakeAmount);
      const receipt = await tx.wait();
      
      expect(receipt.events[0].event).to.equal("TokensStaked");
      expect(receipt.events[0].args.user).to.equal(user1.address);
      expect(receipt.events[0].args.amount).to.equal(stakeAmount);
    });

    it("Should update user stake correctly", async function () {
      await staking.connect(user1).stake(stakeAmount);
      
      const userStake = await staking.getUserStake(user1.address);
      expect(userStake.amount).to.equal(stakeAmount);
      expect(userStake.isActive).to.be.true;
    });

    it("Should update total staked correctly", async function () {
      await staking.connect(user1).stake(stakeAmount);
      
      expect(await staking.totalStaked()).to.equal(stakeAmount);
    });

    it("Should fail with zero amount", async function () {
      await expect(
        staking.connect(user1).stake(0)
      ).to.be.revertedWith("Amount must be greater than 0");
    });

    it("Should fail with insufficient allowance", async function () {
      await expect(
        staking.connect(user1).stake(ethers.utils.parseEther("1000"))
      ).to.be.revertedWith("ERC20: insufficient allowance");
    });

    it("Should fail with insufficient balance", async function () {
      await expect(
        staking.connect(user1).stake(ethers.utils.parseEther("2000"))
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
    });
  });

  describe("Unstaking", function () {
    const stakeAmount = ethers.utils.parseEther("100");

    beforeEach(async function () {
      await pool.connect(user1).approve(staking.address, stakeAmount);
      await staking.connect(user1).stake(stakeAmount);
    });

    it("Should unstake pool tokens", async function () {
      const tx = await staking.connect(user1).unstake(stakeAmount);
      const receipt = await tx.wait();
      
      expect(receipt.events[0].event).to.equal("TokensUnstaked");
      expect(receipt.events[0].args.user).to.equal(user1.address);
      expect(receipt.events[0].args.amount).to.equal(stakeAmount);
    });

    it("Should update user stake correctly", async function () {
      await staking.connect(user1).unstake(stakeAmount);
      
      const userStake = await staking.getUserStake(user1.address);
      expect(userStake.amount).to.equal(0);
      expect(userStake.isActive).to.be.false;
    });

    it("Should update total staked correctly", async function () {
      await staking.connect(user1).unstake(stakeAmount);
      
      expect(await staking.totalStaked()).to.equal(0);
    });

    it("Should fail with insufficient staked amount", async function () {
      await expect(
        staking.connect(user1).unstake(ethers.utils.parseEther("200"))
      ).to.be.revertedWith("Insufficient staked amount");
    });

    it("Should fail with zero amount", async function () {
      await expect(
        staking.connect(user1).unstake(0)
      ).to.be.revertedWith("Amount must be greater than 0");
    });
  });

  describe("Reward Calculation", function () {
    const stakeAmount = ethers.utils.parseEther("100");

    beforeEach(async function () {
      await pool.connect(user1).approve(staking.address, stakeAmount);
      await staking.connect(user1).stake(stakeAmount);
    });

    it("Should calculate rewards correctly", async function () {
      // Wait for some time to pass
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const rewards = await staking.calculateRewards(user1.address);
      expect(rewards).to.be.gt(0);
    });

    it("Should increase rewards over time", async function () {
      const rewards1 = await staking.calculateRewards(user1.address);
      
      // Wait for more time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const rewards2 = await staking.calculateRewards(user1.address);
      expect(rewards2).to.be.gt(rewards1);
    });

    it("Should reset rewards after claiming", async function () {
      const rewardsBefore = await staking.calculateRewards(user1.address);
      
      await staking.connect(user1).claimRewards();
      
      const rewardsAfter = await staking.calculateRewards(user1.address);
      expect(rewardsAfter).to.be.lt(rewardsBefore);
    });
  });

  describe("Reward Claiming", function () {
    const stakeAmount = ethers.utils.parseEther("100");

    beforeEach(async function () {
      await pool.connect(user1).approve(staking.address, stakeAmount);
      await staking.connect(user1).stake(stakeAmount);
    });

    it("Should claim rewards", async function () {
      const tx = await staking.connect(user1).claimRewards();
      const receipt = await tx.wait();
      
      expect(receipt.events[0].event).to.equal("RewardsClaimed");
      expect(receipt.events[0].args.user).to.equal(user1.address);
      expect(receipt.events[0].args.amount).to.be.gt(0);
    });

    it("Should transfer reward tokens to user", async function () {
      const balanceBefore = await rewardToken.balanceOf(user1.address);
      
      await staking.connect(user1).claimRewards();
      
      const balanceAfter = await rewardToken.balanceOf(user1.address);
      expect(balanceAfter).to.be.gt(balanceBefore);
    });

    it("Should fail with no rewards to claim", async function () {
      // Claim all rewards first
      await staking.connect(user1).claimRewards();
      
      await expect(
        staking.connect(user1).claimRewards()
      ).to.be.revertedWith("No rewards to claim");
    });
  });

  describe("Multiple Users", function () {
    const stakeAmount1 = ethers.utils.parseEther("100");
    const stakeAmount2 = ethers.utils.parseEther("200");

    beforeEach(async function () {
      await pool.connect(user1).approve(staking.address, stakeAmount1);
      await pool.connect(user2).approve(staking.address, stakeAmount2);
      
      await staking.connect(user1).stake(stakeAmount1);
      await staking.connect(user2).stake(stakeAmount2);
    });

    it("Should handle multiple stakers correctly", async function () {
      const totalStaked = await staking.totalStaked();
      expect(totalStaked).to.equal(stakeAmount1.add(stakeAmount2));
    });

    it("Should calculate rewards for each user independently", async function () {
      const rewards1 = await staking.calculateRewards(user1.address);
      const rewards2 = await staking.calculateRewards(user2.address);
      
      // User2 should earn more rewards due to larger stake
      expect(rewards2).to.be.gt(rewards1);
    });

    it("Should allow independent unstaking", async function () {
      await staking.connect(user1).unstake(stakeAmount1);
      
      const user1Stake = await staking.getUserStake(user1.address);
      const user2Stake = await staking.getUserStake(user2.address);
      
      expect(user1Stake.amount).to.equal(0);
      expect(user2Stake.amount).to.equal(stakeAmount2);
    });
  });

  describe("Reward Rate Management", function () {
    it("Should allow owner to update reward rate", async function () {
      const newRate = 200; // 2% per day
      
      await staking.connect(owner).updateRewardRate(newRate);
      
      expect(await staking.rewardRate()).to.equal(newRate);
    });

    it("Should emit RewardRateUpdated event", async function () {
      const newRate = 200;
      
      await expect(staking.connect(owner).updateRewardRate(newRate))
        .to.emit(staking, "RewardRateUpdated")
        .withArgs(newRate);
    });

    it("Should fail to update rate from non-owner", async function () {
      await expect(
        staking.connect(user1).updateRewardRate(200)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should fail with zero reward rate", async function () {
      await expect(
        staking.connect(owner).updateRewardRate(0)
      ).to.be.revertedWith("Reward rate must be greater than 0");
    });
  });

  describe("Gas Optimization", function () {
    it("Should use reasonable gas for staking", async function () {
      const stakeAmount = ethers.utils.parseEther("100");
      await pool.connect(user1).approve(staking.address, stakeAmount);
      
      const tx = await staking.connect(user1).stake(stakeAmount);
      const receipt = await tx.wait();
      
      expect(receipt.gasUsed).to.be.lessThan(150000);
    });

    it("Should use reasonable gas for unstaking", async function () {
      const stakeAmount = ethers.utils.parseEther("100");
      await pool.connect(user1).approve(staking.address, stakeAmount);
      await staking.connect(user1).stake(stakeAmount);
      
      const tx = await staking.connect(user1).unstake(stakeAmount);
      const receipt = await tx.wait();
      
      expect(receipt.gasUsed).to.be.lessThan(150000);
    });

    it("Should use reasonable gas for reward claiming", async function () {
      const stakeAmount = ethers.utils.parseEther("100");
      await pool.connect(user1).approve(staking.address, stakeAmount);
      await staking.connect(user1).stake(stakeAmount);
      
      // Wait for rewards to accumulate
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const tx = await staking.connect(user1).claimRewards();
      const receipt = await tx.wait();
      
      expect(receipt.gasUsed).to.be.lessThan(200000);
    });
  });

  describe("Edge Cases", function () {
    it("Should handle maximum stake amount", async function () {
      const maxStake = ethers.utils.parseEther("1000000"); // 1M tokens
      await pool.connect(user1).approve(staking.address, maxStake);
      
      const tx = await staking.connect(user1).stake(maxStake);
      const receipt = await tx.wait();
      
      expect(receipt.events[0].args.amount).to.equal(maxStake);
    });

    it("Should handle partial unstaking", async function () {
      const stakeAmount = ethers.utils.parseEther("100");
      const unstakeAmount = ethers.utils.parseEther("50");
      
      await pool.connect(user1).approve(staking.address, stakeAmount);
      await staking.connect(user1).stake(stakeAmount);
      
      await staking.connect(user1).unstake(unstakeAmount);
      
      const userStake = await staking.getUserStake(user1.address);
      expect(userStake.amount).to.equal(stakeAmount.sub(unstakeAmount));
    });

    it("Should handle multiple reward claims", async function () {
      const stakeAmount = ethers.utils.parseEther("100");
      await pool.connect(user1).approve(staking.address, stakeAmount);
      await staking.connect(user1).stake(stakeAmount);
      
      // Wait for rewards
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // First claim
      const balanceBefore1 = await rewardToken.balanceOf(user1.address);
      await staking.connect(user1).claimRewards();
      const balanceAfter1 = await rewardToken.balanceOf(user1.address);
      
      // Wait for more rewards
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Second claim
      const balanceBefore2 = await rewardToken.balanceOf(user1.address);
      await staking.connect(user1).claimRewards();
      const balanceAfter2 = await rewardToken.balanceOf(user1.address);
      
      expect(balanceAfter1).to.be.gt(balanceBefore1);
      expect(balanceAfter2).to.be.gt(balanceBefore2);
    });
  });
});
