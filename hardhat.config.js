require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: "0.8.19",
    networks: {
        hardhat: {
            chainId: 56, // BSC chain ID
            // Disable forking for tests
            // forking: {
            //     url: process.env.BSC_RPC_URL || "https://bsc-dataseed.binance.org/",
            // },
        },
        testnet: {
            url: process.env.BSC_TESTNET_RPC_URL || "https://data-seed-prebsc-1-s1.binance.org:8545/",
            chainId: 97,
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
        },
        mainnet: {
            url: process.env.BSC_RPC_URL || "https://bsc-dataseed.binance.org/",
            chainId: 56,
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
        },
    },
    etherscan: {
        apiKey: process.env.BSCSCAN_API_KEY,
    },
    paths: {
        sources: "./contracts",
        tests: "./test",
        cache: "./cache",
        artifacts: "./artifacts"
    }
};
