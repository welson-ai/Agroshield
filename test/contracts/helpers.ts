import { ethers } from "hardhat";
import { Contract } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

export interface TestContracts {
  agroShieldPool: Contract;
  agroShieldPolicy: Contract;
  agroShieldOracle: Contract;
  cUSDToken: Contract;
}

export interface TestUsers {
  owner: SignerWithAddress;
  farmer1: SignerWithAddress;
  farmer2: SignerWithAddress;
  investor1: SignerWithAddress;
  investor2: SignerWithAddress;
  oracle: SignerWithAddress;
}

export async function deployContracts(): Promise<TestContracts> {
  // Deploy mock cUSD token for testing
  const MockERC20 = await ethers.getContractFactory("MockERC20");
  const cUSDToken = await MockERC20.deploy("Celo Dollar", "cUSD", ethers.utils.parseEther("1000000"));
  await cUSDToken.deployed();

  // Deploy AgroShield contracts
  const AgroShieldOracle = await ethers.getContractFactory("AgroShieldOracle");
  const agroShieldOracle = await AgroShieldOracle.deploy();
  await agroShieldOracle.deployed();

  const AgroShieldPolicy = await ethers.getContractFactory("AgroShieldPolicy");
  const agroShieldPolicy = await AgroShieldPolicy.deploy(cUSDToken.address, agroShieldOracle.address);
  await agroShieldPolicy.deployed();

  const AgroShieldPool = await ethers.getContractFactory("AgroShieldPool");
  const agroShieldPool = await AgroShieldPool.deploy(cUSDToken.address, agroShieldPolicy.address);
  await agroShieldPool.deployed();

  // Set pool address in policy contract
  await agroShieldPolicy.setPoolAddress(agroShieldPool.address);
  await agroShieldPolicy.setOracleAddress(agroShieldOracle.address);

  return {
    agroShieldPool,
    agroShieldPolicy,
    agroShieldOracle,
    cUSDToken
  };
}

export async function getTestUsers(): Promise<TestUsers> {
  const [owner, farmer1, farmer2, investor1, investor2, oracle] = await ethers.getSigners();
  
  return {
    owner,
    farmer1,
    farmer2,
    investor1,
    investor2,
    oracle
  };
}

export async function setupUsersWithTokens(users: TestUsers, contracts: TestContracts) {
  const { farmer1, farmer2, investor1, investor2 } = users;
  const { cUSDToken } = contracts;

  // Mint tokens for testing
  const farmerTokens = ethers.utils.parseEther("10000");
  const investorTokens = ethers.utils.parseEther("50000");

  await cUSDToken.mint(farmer1.address, farmerTokens);
  await cUSDToken.mint(farmer2.address, farmerTokens);
  await cUSDToken.mint(investor1.address, investorTokens);
  await cUSDToken.mint(investor2.address, investorTokens);

  // Approve tokens for contracts
  await cUSDToken.connect(farmer1).approve(contracts.agroShieldPolicy.address, farmerTokens);
  await cUSDToken.connect(farmer2).approve(contracts.agroShieldPolicy.address, farmerTokens);
  await cUSDToken.connect(investor1).approve(contracts.agroShieldPool.address, investorTokens);
  await cUSDToken.connect(investor2).approve(contracts.agroShieldPool.address, investorTokens);
}

export const DEFAULT_POLICY_PARAMS = {
  coverageAmount: ethers.utils.parseEther("1000"),
  rainfallThreshold: "50",
  measurementPeriod: "90",
  location: "1.0152,35.0069", // Kitale coordinates
  description: "Test maize policy"
};

export const DEFAULT_ORACLE_DATA = {
  location: "1.0152",
  timestamp: Math.floor(Date.now() / 1000).toString(),
  rainfall: "75",
  temperature: "25",
  humidity: "60"
};

export async function advanceTime(days: number) {
  await ethers.provider.send("evm_increaseTime", [days * 24 * 60 * 60]);
  await ethers.provider.send("evm_mine", []);
}

export async function getLatestBlockTimestamp(): Promise<number> {
  const latestBlock = await ethers.provider.getBlock("latest");
  return latestBlock.timestamp;
}
