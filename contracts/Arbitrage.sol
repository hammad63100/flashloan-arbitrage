// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IFlashLoanReceiver {
    function executeOperation(
        address[] calldata assets,
        uint256[] calldata amounts,
        uint256[] calldata premiums,
        address initiator,
        bytes calldata params
    ) external returns (bool);
}

import "./interfaces/IPancakeRouter.sol";
import "./interfaces/IOpenOceanRouter.sol";
import "./interfaces/IERC20.sol";
import "./interfaces/IThenaRouter.sol";
import "./interfaces/IAavePool.sol";

contract Arbitrage is IFlashLoanReceiver {
    address public owner;
    IERC20 public USDT;
    IERC20 public WBNB;
    IERC20 public BUSD;
    IPancakeRouter public pancakeSwapV3Router;
    IThenaRouter public thenaFusionRouter;
    IOpenOceanRouter public openOceanRouter;
    IAavePool public aavePool;

    // Declare the path array globally to avoid "undeclared identifier"
    address[] private path;

   constructor(
    address _USDT,
    address _pancakeSwapV3Router,
    address _thenaFusionRouter,
    address _openOceanRouter,
    address _aavePool
) {
    owner = msg.sender;
    USDT = IERC20(_USDT);
    pancakeSwapV3Router = IPancakeRouter(_pancakeSwapV3Router);
    thenaFusionRouter = IThenaRouter(_thenaFusionRouter);
    openOceanRouter = IOpenOceanRouter(_openOceanRouter);
    aavePool = IAavePool(_aavePool);
}

    // Update token addresses for testing
    function updateTokenAddresses(address _WBNB, address _BUSD) external {
        require(msg.sender == owner, "Only owner can update");
        WBNB = IERC20(_WBNB);
        BUSD = IERC20(_BUSD);
    }

    // Flash loan callback function from Aave
    function executeOperation(
        address[] calldata assets,
        uint256[] calldata amounts,
        uint256[] calldata premiums,
        address /* initiator */,
        bytes calldata /* params */
    ) external override returns (bool) {
        require(msg.sender == address(aavePool), "Only Aave Pool can call this function");
        require(assets.length == 1 && amounts.length == 1, "Invalid flash loan parameters");
        require(amounts[0] > 0, "Amount must be greater than 0");
        
        uint256 amount = amounts[0];
        uint256 premium = premiums[0];
        uint256 loanAmount = amount + premium;

        // Example: Swap logic for Arbitrage
        // Track initial balance for profit calculation
        uint256 initialBalance = USDT.balanceOf(address(this));

        // PancakeSwap V3 Trade (example: USDT -> WBNB)
        _swapOnPancakeSwap(amount);

        // THENA Fusion Swap (example: WBNB -> BUSD)
        _swapOnThenaFusion();

        // OpenOcean Swap (example: BUSD -> USDT)
        _swapOnOpenOcean();

        // Calculate profit, if any, after swapping on all platforms
        uint256 finalBalance = USDT.balanceOf(address(this));
        require(finalBalance >= loanAmount, "Not enough profit to repay loan");

        // Approve Aave to take back the loan plus premium
        IERC20(assets[0]).approve(address(aavePool), loanAmount);

        // Transfer any profit to the owner
        uint256 profit = finalBalance - initialBalance;
        if (profit > premium) {
            USDT.transfer(owner, profit - premium);
        }
        
        return true;
    }

    // Internal function for PancakeSwap V3 swap
    function _swapOnPancakeSwap(uint256 amount) internal {
        require(amount > 0, "Amount must be greater than 0");
        require(USDT.balanceOf(address(this)) >= amount, "Insufficient balance");

        // Define the swap path for PancakeSwap (USDT -> WBNB)
        path = new address[](2); // Initialize the path array to hold 2 elements
        path[0] = address(USDT); // USDT contract address
        path[1] = address(WBNB); // WBNB contract address

        USDT.approve(address(pancakeSwapV3Router), amount);

        pancakeSwapV3Router.exactInputSingle(
            IPancakeRouter.ExactInputSingleParams({
                tokenIn: path[0],
                tokenOut: path[1],
                fee: uint24(3000), // 0.3% fee for PancakeSwap V3
                recipient: address(this),
                deadline: block.timestamp,
                amountIn: amount,
                amountOutMinimum: 0, // Set a minimum output for safety in production
                sqrtPriceLimitX96: 0
            })
        );
    }

    // Internal function for Thena Fusion swap
    function _swapOnThenaFusion() internal {
        // Example swap: WBNB -> BUSD
        uint256 tokenABalance = WBNB.balanceOf(address(this));
        require(tokenABalance > 0, "Amount must be greater than 0");
        WBNB.approve(address(thenaFusionRouter), tokenABalance);
        thenaFusionRouter.swapExactTokensForTokens(
            tokenABalance,
            0,
            getPath(address(WBNB), address(BUSD)),
            address(this),
            block.timestamp
        );
    }

    // Internal function for OpenOcean swap
    function _swapOnOpenOcean() internal {
        // Example swap: BUSD -> USDT
        uint256 tokenBBalance = BUSD.balanceOf(address(this));
        require(tokenBBalance > 0, "Amount must be greater than 0");
        BUSD.approve(address(openOceanRouter), tokenBBalance);
        openOceanRouter.swapExactTokensForTokens(
            tokenBBalance,
            0,
            getPath(address(BUSD), address(USDT)),
            address(this),
            block.timestamp
        );
    }

    // Public functions for testing
    function swapOnPancakeSwap(uint256 amount) public {
        require(msg.sender == owner || msg.sender == address(this), "Only owner or self can swap");
        _swapOnPancakeSwap(amount);
    }

    function swapOnThenaFusion() public {
        require(msg.sender == owner || msg.sender == address(this), "Only owner or self can swap");
        _swapOnThenaFusion();
    }

    function swapOnOpenOcean() public {
        require(msg.sender == owner || msg.sender == address(this), "Only owner or self can swap");
        _swapOnOpenOcean();
    }

    // Helper function to get the path for swapping tokens
    function getPath(address fromToken, address toToken) internal pure returns (address[] memory) {
        address[] memory swapPath = new address[](2);
        swapPath[0] = fromToken;
        swapPath[1] = toToken;
        return swapPath;
    }

    // Withdraw profits
    function withdraw(uint256 amount) external {
        require(msg.sender == owner, "Only owner can withdraw");
        require(USDT.balanceOf(address(this)) >= amount, "Insufficient funds");
        USDT.transfer(owner, amount);
    }

    // Ensure the contract owner can change settings
    function updateOwner(address newOwner) external {
        require(msg.sender == owner, "Only owner can update");
        owner = newOwner;
    }

    function flashLoan(
        address[] calldata assets,
        uint256[] calldata amounts,
        uint256[] calldata interestRateModes,
        address onBehalfOf,
        bytes calldata params,
        uint16 referralCode
    ) external {
        require(msg.sender == owner, "Only owner can flash loan");
        require(assets.length == 1 && amounts.length == 1, "Invalid flash loan parameters");
        require(amounts[0] > 0, "Amount must be greater than 0");
        aavePool.flashLoan(
            address(this),
            assets,
            amounts,
            interestRateModes,
            onBehalfOf,
            params,
            referralCode
        );
    }
}
