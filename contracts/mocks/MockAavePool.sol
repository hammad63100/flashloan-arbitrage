// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../interfaces/IAavePool.sol";
import "../interfaces/IFlashLoanReceiver.sol";

contract MockAavePool is IAavePool {
    function flashLoan(
        address receiverAddress,
        address[] calldata assets,
        uint256[] calldata amounts,
        uint256[] calldata /* interestRateModes */,
        address /* onBehalfOf */,
        bytes calldata params,
        uint16 /* referralCode */
    ) external override {
        // Mock implementation - call the flash loan receiver
        // Calculate mock premiums (0.09% fee)
        uint256[] memory premiums = new uint256[](amounts.length);
        for (uint i = 0; i < amounts.length; i++) {
            premiums[i] = (amounts[i] * 9) / 10000;
        }

        IFlashLoanReceiver(receiverAddress).executeOperation(
            assets,
            amounts,
            premiums,
            msg.sender,
            params
        );
    }
} 