import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { deployContracts, getTestUsers, setupUsersWithTokens } from "./helpers";

describe("AgroShieldPool", function () {
  let contracts: any;
  let users: any;

  beforeEach(async function () {
    contracts = await deployContracts();
    users = await getTestUsers();
    await setupUsersWithTokens(users, contracts);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await contracts.agroShieldPool.owner()).to.equal(users.owner.address);
    });

    it("Should set the correct cUSD token address", async function () {
      expect(await contracts.agroShieldPool.cUSDToken()).to.equal(contracts.cUSDToken.address);
    });

    it("Should set the correct policy contract address", async function () {
      expect(await contracts.agroShieldPool.policyContract()).to.equal(contracts.agroShieldPolicy.address);
    });

    it("Should initialize with zero total liquidity", async function () {
      expect(await contracts.agroShieldPool.totalLiquidity()).to.equal(0);
    });

    it("Should initialize with zero active policies", async function () {
      expect(await contracts.agroShieldPool.activePoliciesCount()).to.equal(0);
    });
  });

  describe("Deposits", function () {
    it("Should allow investors to deposit liquidity", async function () {
      const depositAmount = ethers.utils.parseEther("1000");
      
      await expect(contracts.agroShieldPool.connect(users.investor1).deposit(depositAmount))
        .to.emit(contracts.agroShieldPool, "LiquidityDeposited")
        .withArgs(users.investor1.address, depositAmount);
      
      expect(await contracts.agroShieldPool.getLiquidity(users.investor1.address)).to.equal(depositAmount);
      expect(await contracts.agroShieldPool.totalLiquidity()).to.equal(depositAmount);
    });

    it("Should reject zero deposits", async function () {
      await expect(contracts.agroShieldPool.connect(users.investor1).deposit(0))
        .to.be.revertedWith("Amount must be greater than 0");
    });

    it("Should track multiple deposits from same investor", async function () {
      const firstDeposit = ethers.utils.parseEther("500");
      const secondDeposit = ethers.utils.parseEther("300");
      
      await contracts.agroShieldPool.connect(users.investor1).deposit(firstDeposit);
      await contracts.agroShieldPool.connect(users.investor1).deposit(secondDeposit);
      
      const totalDeposited = firstDeposit.add(secondDeposit);
      expect(await contracts.agroShieldPool.getLiquidity(users.investor1.address)).to.equal(totalDeposited);
      expect(await contracts.agroShieldPool.totalLiquidity()).to.equal(totalDeposited);
    });

    it("Should track multiple investors separately", async function () {
      const investor1Deposit = ethers.utils.parseEther("1000");
      const investor2Deposit = ethers.utils.parseEther("2000");
      
      await contracts.agroShieldPool.connect(users.investor1).deposit(investor1Deposit);
      await contracts.agroShieldPool.connect(users.investor2).deposit(investor2Deposit);
      
      expect(await contracts.agroShieldPool.getLiquidity(users.investor1.address)).to.equal(investor1Deposit);
      expect(await contracts.agroShieldPool.getLiquidity(users.investor2.address)).to.equal(investor2Deposit);
      
      const totalLiquidity = investor1Deposit.add(investor2Deposit);
      expect(await contracts.agroShieldPool.totalLiquidity()).to.equal(totalLiquidity);
    });

    it("Should fail when investor has insufficient cUSD balance", async function () {
      const hugeAmount = ethers.utils.parseEther("1000000"); // More than minted
      
      await expect(contracts.agroShieldPool.connect(users.investor1).deposit(hugeAmount))
        .to.be.reverted;
    });

    it("Should fail when investor has not approved cUSD", async function () {
      // Revoke approval
      await contracts.cUSDToken.connect(users.investor1).approve(contracts.agroShieldPool.address, 0);
      
      const depositAmount = ethers.utils.parseEther("100");
      
      await expect(contracts.agroShieldPool.connect(users.investor1).deposit(depositAmount))
        .to.be.reverted;
    });
  });

  describe("Withdrawals", function () {
    beforeEach(async function () {
      // Setup: Deposit some liquidity for withdrawal tests
      const depositAmount = ethers.utils.parseEther("1000");
      await contracts.agroShieldPool.connect(users.investor1).deposit(depositAmount);
    });

    it("Should allow investors to withdraw their liquidity", async function () {
      const withdrawAmount = ethers.utils.parseEther("500");
      const initialBalance = await contracts.cUSDToken.balanceOf(users.investor1.address);
      
      await expect(contracts.agroShieldPool.connect(users.investor1).withdraw(withdrawAmount))
        .to.emit(contracts.agroShieldPool, "LiquidityWithdrawn")
        .withArgs(users.investor1.address, withdrawAmount);
      
      const finalBalance = await contracts.cUSDToken.balanceOf(users.investor1.address);
      expect(finalBalance.sub(initialBalance)).to.equal(withdrawAmount);
      
      const remainingLiquidity = await contracts.agroShieldPool.getLiquidity(users.investor1.address);
      expect(remainingLiquidity).to.equal(ethers.utils.parseEther("500"));
    });

    it("Should reject zero withdrawals", async function () {
      await expect(contracts.agroShieldPool.connect(users.investor1).withdraw(0))
        .to.be.revertedWith("Amount must be greater than 0");
    });

    it("Should reject withdrawals exceeding deposited amount", async function () {
      const hugeAmount = ethers.utils.parseEther("2000"); // More than deposited
      
      await expect(contracts.agroShieldPool.connect(users.investor1).withdraw(hugeAmount))
        .to.be.revertedWith("Insufficient liquidity");
    });

    it("Should allow partial withdrawals", async function () {
      const firstWithdrawal = ethers.utils.parseEther("200");
      const secondWithdrawal = ethers.utils.parseEther("300");
      
      await contracts.agroShieldPool.connect(users.investor1).withdraw(firstWithdrawal);
      await contracts.agroShieldPool.connect(users.investor1).withdraw(secondWithdrawal);
      
      const remainingLiquidity = await contracts.agroShieldPool.getLiquidity(users.investor1.address);
      expect(remainingLiquidity).to.equal(ethers.utils.parseEther("500"));
    });

    it("Should allow full withdrawal of all liquidity", async function () {
      const fullAmount = ethers.utils.parseEther("1000");
      
      await contracts.agroShieldPool.connect(users.investor1).withdraw(fullAmount);
      
      expect(await contracts.agroShieldPool.getLiquidity(users.investor1.address)).to.equal(0);
      expect(await contracts.agroShieldPool.totalLiquidity()).to.equal(0);
    });

    it("Should fail when withdrawing from empty account", async function () {
      await expect(contracts.agroShieldPool.connect(users.investor2).withdraw(ethers.utils.parseEther("100")))
        .to.be.revertedWith("Insufficient liquidity");
    });

    it("Should update total liquidity correctly on withdrawal", async function () {
      const withdrawAmount = ethers.utils.parseEther("300");
      const initialTotalLiquidity = await contracts.agroShieldPool.totalLiquidity();
      
      await contracts.agroShieldPool.connect(users.investor1).withdraw(withdrawAmount);
      
      const finalTotalLiquidity = await contracts.agroShieldPool.totalLiquidity();
      expect(finalTotalLiquidity).to.equal(initialTotalLiquidity.sub(withdrawAmount));
    });

    it("Should handle multiple investors withdrawals correctly", async function () {
      // Add second investor
      await contracts.agroShieldPool.connect(users.investor2).deposit(ethers.utils.parseEther("2000"));
      
      const withdrawAmount1 = ethers.utils.parseEther("200");
      const withdrawAmount2 = ethers.utils.parseEther("500");
      
      await contracts.agroShieldPool.connect(users.investor1).withdraw(withdrawAmount1);
      await contracts.agroShieldPool.connect(users.investor2).withdraw(withdrawAmount2);
      
      expect(await contracts.agroShieldPool.getLiquidity(users.investor1.address)).to.equal(ethers.utils.parseEther("800"));
      expect(await contracts.agroShieldPool.getLiquidity(users.investor2.address)).to.equal(ethers.utils.parseEther("1500"));
      
      const expectedTotal = ethers.utils.parseEther("2300");
      expect(await contracts.agroShieldPool.totalLiquidity()).to.equal(expectedTotal);
    });
  });
});
