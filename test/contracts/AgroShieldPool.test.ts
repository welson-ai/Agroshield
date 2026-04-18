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
});
