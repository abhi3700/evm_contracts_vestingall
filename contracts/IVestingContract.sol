// SPDX-License-Identifier: MIT

pragma solidity ^0.8.2;

abstract contract IVestingContract {
    /// @notice Update vesting contract maximum amount after send transaction
    /// @param _maximumAmount Maximun amount
    function updateMaximumAmount(uint256 _maximumAmount) virtual public;
}