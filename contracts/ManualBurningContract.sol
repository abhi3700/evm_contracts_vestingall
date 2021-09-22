//SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.4;

import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/security/Pausable.sol';
import '@openzeppelin/contracts/utils/math/SafeMath.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';

/// @title Manual Burning Contract
contract ManualBurningContract is Ownable, Pausable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    // State variables===================================================================================
    using SafeMath for uint256;

    IERC20 public vestingToken;
    uint256 public maxVestingAmount;

    // ===============EVENTS============================================================================================
    event UpdatedMaxVestingAmount(address caller, uint256 amount, uint256 currentTimestamp);

    /// @notice Constructor
    /// @param _token token contract Interface
    constructor(
        IERC20 _token,
        uint256 _maxVestingAmount
    ) {
        require(address(_token) != address(0), "Invalid address");
        require( _maxVestingAmount > 0, "max vesting amount must be positive");
        
        maxVestingAmount = _maxVestingAmount;
    }

    //=================FUNCTIONS=================================================================
    /// @notice Update vesting contract maximum amount
    /// @param _maxAmount amount. This can be modified by the owner only 
    ///        so as to increase the max vesting amount
    function updateMaxVestingAmount(uint256 _maxAmount) external onlyOwner whenNotPaused {
        maxVestingAmount = maxVestingAmount.add(_maxAmount);

        emit UpdatedMaxVestingAmount(msg.sender, _maxAmount, block.timestamp);
    }

    /// @notice Pause contract  
    function pause() public onlyOwner whenNotPaused {
        _pause();
    }

    /// @notice Unpause contract
    function unpause() public onlyOwner whenPaused {
        _unpause();
    }
}