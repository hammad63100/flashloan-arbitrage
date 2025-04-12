require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.0",  // Ensure you're using the correct Solidity version

  networks: {
    testnet: {
      url: process.env.BSC_TESTNET_RPC_URL || "https://data-seed-prebsc-1-s1.binance.org:8545/",
      chainId: 97,  // BSC Testnet chain ID
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    mainnet: {
      url: process.env.BSC_RPC_URL || "https://bsc-dataseed.binance.org/",
      chainId: 56, // BSC Mainnet chain ID
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },

  etherscan: {
    apiKey: process.env.BSCSCAN_API_KEY, // API key for BSCscan (for verifying contracts)
  },

  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};
