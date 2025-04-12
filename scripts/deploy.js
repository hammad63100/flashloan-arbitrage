const hre = require("hardhat");

async function main() {
  console.log("Starting deployment...");

  // Get the contract factory
  const Arbitrage = await hre.ethers.getContractFactory("Arbitrage");

  // Deploy with constructor parameters
  // Note: Replace these addresses with actual testnet/mainnet addresses
  const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955"; // BSC USDT
  const PANCAKESWAP_ROUTER = "0x13f4EA83D0bd40E75C8222255bc855a974568Dd4"; // PancakeSwap V3 Router
  const THENA_ROUTER = "0x0000000000000000000000000000000000000000"; // Replace with actual Thena router
  const OPENOCEAN_ROUTER = "0x0000000000000000000000000000000000000000"; // Replace with actual OpenOcean router

  const arbitrage = await Arbitrage.deploy(
    USDT_ADDRESS,
    PANCAKESWAP_ROUTER,
    THENA_ROUTER,
    OPENOCEAN_ROUTER
  );

  await arbitrage.deployed();

  console.log("Arbitrage contract deployed to:", arbitrage.address);
  console.log("USDT address:", USDT_ADDRESS);
  console.log("PancakeSwap Router:", PANCAKESWAP_ROUTER);
  console.log("Thena Router:", THENA_ROUTER);
  console.log("OpenOcean Router:", OPENOCEAN_ROUTER);
}

// Handle errors
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
