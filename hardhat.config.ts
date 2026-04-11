import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import hardhatEthersPlugin from "@nomicfoundation/hardhat-ethers";
import { configVariable, defineConfig } from "hardhat/config";

export default defineConfig({
  plugins: [hardhatToolboxViemPlugin, hardhatEthersPlugin],
  solidity: {
    version: "0.8.19",
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
    // Celo Alfajores Testnet
    alfajores: {
      type: "http",
      chainType: "l1",
      url: "https://alfajores-forno.celo-testnet.org",
      chainId: 44787,
      accounts: [configVariable("PRIVATE_KEY")],
      gasPrice: 20000000000, // 20 gwei
      gas: 2100000,
    },
    // Celo Mainnet (for future production deployment)
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
