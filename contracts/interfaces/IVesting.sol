// SPDX-License-Identifier: MIT

pragma solidity ^0.8.2;

abstract contract IVesting {
    /// @notice Update vesting contract maximum amount after send transaction
    /// @param _amountTransferred Transferred amount. This can be modified by the owner 
    ///        so as to increase the max vesting amount
    function updateMaxVestingAmount(uint256 _amountTransferred) virtual external returns(bool);
}