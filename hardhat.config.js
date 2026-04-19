require("@nomicfoundation/hardhat-toolbox-viem/config");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  networks: {
    celo: {
      url: "https://forno.celo.org",
      chainId: 42220,
      accounts: {
        mnemonic: process.env.MNEMONIC,
      },
    },
    "celo-alfajores": {
      url: "https://alfajores-forno.celo.org",
      chainId: 44787,
      accounts: {
        mnemonic: process.env.MNEMONIC,
      },
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
  },
  etherscan: {
    apiKey: process.env.CELOSCAN_API_KEY,
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  mocha: {
    timeout: 60000,
  },
};
