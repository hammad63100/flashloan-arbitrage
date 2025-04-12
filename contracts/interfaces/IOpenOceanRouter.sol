// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IOpenOceanRouter {
    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint[] memory amounts);

    function getPath(address fromToken, address toToken) external view returns (address[] memory);
}
