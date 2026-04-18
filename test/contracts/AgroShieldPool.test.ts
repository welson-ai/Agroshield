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
});
