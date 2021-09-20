//SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.4;

import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/security/Pausable.sol';
import '@openzeppelin/contracts/utils/math/SafeMath.sol';

import "./interfaces/IToken.sol";
import "./interfaces/IVesting.sol";

contract ManualBurningContract is IVesting, Ownable, Pausable {
    using SafeMath for uint256;

    address public beneficiary;
    IToken public vestingToken;

    uint256 public maxVestingAmount;

    // EVENTS   
    event UpdateMaxVestingAmount(address caller, uint256 amount, uint256 currentTimestamp);

    constructor(
        address _beneficiary,
        IToken _token
    ) {
        require(address(_token) != address(0), "Invalid address");
        require(_beneficiary != address(0), 'Invalid address');

        maxVestingAmount = 0;
        beneficiary = _beneficiary;
        vestingToken = _token;
    }
    
    /// @notice Update vesting contract maximum amount after send transaction
    /// @param _amountTransferred Transferred amount. This can be modified by the caller 
    ///        so as to increase the max vesting amount
    function updateMaxVestingAmount(uint256 _amountTransferred) override external whenNotPaused returns (bool) {
        require(msg.sender == address(vestingToken), "The caller is the token contract");

        maxVestingAmount = maxVestingAmount.add(_amountTransferred);

        emit UpdateMaxVestingAmount(msg.sender, _amountTransferred, block.timestamp);
        return true;
    }

    function pause() public onlyOwner whenNotPaused {
        _pause();
    }

    function unpause() public onlyOwner whenPaused {
        _unpause();
    }
}