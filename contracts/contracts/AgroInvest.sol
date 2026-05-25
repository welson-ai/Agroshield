// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AgroInvest
 * @notice Ultra-lightweight DAU interaction contract
 * @dev ping() costs ~18,000 gas (event log only, zero storage writes)
 */
contract AgroInvest {
    /// @notice Emitted on every user interaction
    event Interaction(address indexed user, uint256 timestamp);

    /// @notice Minimal gas ping - emits event, no storage writes
    function ping() external {
        emit Interaction(msg.sender, block.timestamp);
    }
}
