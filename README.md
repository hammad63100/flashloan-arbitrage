# Flashloan Arbitrage Smart Contract

A Solidity smart contract for executing flashloan-based arbitrage trades across multiple DEXs on BNB Chain (BSC).

## Features

- Flash loan integration with Aave V3
- Arbitrage trading across:
  - PancakeSwap V3
  - Thena Fusion
  - OpenOcean
- Owner-controlled functions for security
- Gas-optimized operations
- Comprehensive test coverage

## Prerequisites

- Node.js (v14+ recommended)
- npm or yarn
- Hardhat

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd flashloan-arbitrage
```

2. Install dependencies:

```bash
npm install
```

## Configuration

1. Create a `.env` file in the root directory:

```env
PRIVATE_KEY=your_private_key_here
BSC_RPC_URL=your_bsc_node_url_here
```

2. Update the token addresses in `scripts/deploy.js` if needed.

## Testing

Run the test suite:

```bash
npm run test
npx hardhat run scripts/deploy.js --network mainnet
```

The tests cover:

- Contract deployment
- Flash loan execution
- Token swaps
- Access control
- Edge cases
- Integration scenarios
- Gas optimization

## Contract Structure

### Main Components

1. `Arbitrage.sol`: Main contract implementing flash loan and arbitrage logic
2. Mock Contracts for Testing:
   - `MockERC20.sol`
   - `MockPancakeRouter.sol`
   - `MockThenaRouter.sol`
   - `MockOpenOceanRouter.sol`
   - `MockAavePool.sol`

### Key Functions

- `flashLoan`: Initiates a flash loan from Aave
- `executeOperation`: Handles the flash loan callback and executes arbitrage
- `swapOnPancakeSwap`: Executes swaps on PancakeSwap V3
- `swapOnThenaFusion`: Executes swaps on Thena Fusion
- `swapOnOpenOcean`: Executes swaps on OpenOcean

## Security Features

- Owner-only access control for sensitive operations
- Balance checks before swaps
- Proper approval management
- Flash loan validation

## Gas Optimization

The contract includes several gas optimization features:

- Efficient path management
- Minimal state variables
- Optimized approval handling
- Internal functions for repeated operations

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

MIT License - see the [LICENSE](LICENSE) file for details

## Disclaimer

This code is provided as-is. Users should perform their own security audits and testing before using in production. Flash loans and arbitrage trading involve significant risks and should be approached with caution.
