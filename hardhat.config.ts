import { configVariable, defineConfig } from "hardhat/config";
import * as dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  plugins: [],
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      type: "edr-simulated",
      chainType: "l1",
      chainId: 1337,
    },
    localhost: {
      type: "http",
      url: "http://127.0.0.1:8545",
      chainId: 1337,
    },
    // Celo Sepolia Testnet
    "celo-sepolia": {
      type: "http",
      chainType: "l1",
      url: "https://forno.celo.org/sepolia",
      chainId: 11142220,
      accounts: [configVariable("PRIVATE_KEY")],
      gasPrice: 20000000000, // 20 gwei
      gas: 2100000,
    },
    // Celo Mainnet
    celo: {
      type: "http",
      chainType: "l1",
      url: "https://forno.celo.org",
      chainId: 42220,
      accounts: [configVariable("PRIVATE_KEY")],
      gasPrice: 20000000000, // 20 gwei
      gas: 2100000,
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
});
