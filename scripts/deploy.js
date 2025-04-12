const hre = require("hardhat");

async function main() {
  console.log("Starting deployment...");

  // Get the contract factory
  const Arbitrage = await hre.ethers.getContractFactory("Arbitrage");

  // Load addresses from environment variables
  const USDT_ADDRESS = process.env.USDT_ADDRESS;
  const PANCAKESWAP_ROUTER = process.env.PANCAKESWAP_ROUTER;
  const THENA_ROUTER = process.env.THENA_ROUTER;
  const OPENOCEAN_ROUTER = process.env.OPENOCEAN_ROUTER;
  const AAVE_POOL_ADDRESS = process.env.AAVE_POOL_ADDRESS;  // Add the Aave Pool address

  console.log(`Deploying with the following parameters:
    USDT_ADDRESS: ${USDT_ADDRESS}
    PANCAKESWAP_ROUTER: ${PANCAKESWAP_ROUTER}
    THENA_ROUTER: ${THENA_ROUTER}
    OPENOCEAN_ROUTER: ${OPENOCEAN_ROUTER}
    AAVE_POOL_ADDRESS: ${AAVE_POOL_ADDRESS}`);

  // Deploy the Arbitrage contract
  const arbitrage = await Arbitrage.deploy(
    USDT_ADDRESS,
    PANCAKESWAP_ROUTER,
    THENA_ROUTER,
    OPENOCEAN_ROUTER,
    AAVE_POOL_ADDRESS  // Pass the Aave Pool address here
  );

  await arbitrage.deployed();

  console.log("Arbitrage contract deployed to:", arbitrage.address);
}

// Handle errors
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
