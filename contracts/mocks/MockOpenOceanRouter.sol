// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../interfaces/IOpenOceanRouter.sol";

contract MockOpenOceanRouter is IOpenOceanRouter {
    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 /* amountOutMin */,
        address[] calldata /* path */,
        address /* to */,
        uint256 /* deadline */
    ) external pure override returns (uint[] memory amounts) {
        // Mock implementation - return 99% of input amount
        uint[] memory mockAmounts = new uint[](2);
        mockAmounts[0] = amountIn;
        mockAmounts[1] = (amountIn * 99) / 100;
        return mockAmounts;
    }

    function getPath(address fromToken, address toToken) external pure override returns (address[] memory) {
        address[] memory path = new address[](2);
        path[0] = fromToken;
        path[1] = toToken;
        return path;
    }
} 