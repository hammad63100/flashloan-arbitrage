// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../interfaces/IPancakeRouter.sol";

contract MockPancakeRouter is IPancakeRouter {
    function exactInputSingle(ExactInputSingleParams calldata params) external override returns (uint256 amountOut) {
        // Mock implementation - return 99% of input amount
        return (params.amountIn * 99) / 100;
    }
} 