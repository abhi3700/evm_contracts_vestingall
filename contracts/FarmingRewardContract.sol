//SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.4;

import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/security/Pausable.sol';
import '@openzeppelin/contracts/utils/math/SafeMath.sol';
import "hardhat/console.sol";
import "./IERC20Recipient.sol";

contract FarmingRewardContract is IERC20Recipient, Ownable, Pausable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    address public beneficiary;
    IERC20 public vestingToken;

    uint256 public TOTAL_AMOUNT;
    uint256 public totalWithdrawAmount;

    event TokenReceive(uint256 amount);
    event TokenWithdraw(uint256 amount);

    /// @notice Constructor
    /// @param _token ERC20 token
    /// @param _beneficiary Beneficiary address
    constructor(
        IERC20 _token,
        address _beneficiary
    ) {
        require(_beneficiary != address(0), 'Invalid address');

        TOTAL_AMOUNT = 0;
        beneficiary = _beneficiary;
        vestingToken = _token;

        totalWithdrawAmount = 0;
    }

    /// @notice Token receive fallback function
    /// @param _from Sender addres
    /// @param _value Transaction amount
    function tokenFallback(address _from, uint256 _value) public override {
        require(_from == owner(), 'Money must be transferred from token contract address');
        require(TOTAL_AMOUNT.add(_value) <= 100000000000 * 10 ** 18, 'After adding the tobe transferred amount with the current TOTAL_AMOUNT, it must be <= 100 Billions for farming rewards');
        TOTAL_AMOUNT = TOTAL_AMOUNT.add(_value);
        emit TokenReceive(_value);
    }

    /// @notice Calculate available amount
    function availableAmount() public view onlyOwner whenNotPaused returns(uint256) {
        return vestingToken.balanceOf(address(this));
    }

    /// @notice Withdraw
    function withdraw() public onlyOwner whenNotPaused {
        uint256 amount = availableAmount();
        require(amount > 0, "Available amount is zero");

        vestingToken.safeTransfer(beneficiary, amount);
        totalWithdrawAmount = totalWithdrawAmount.add(amount);
        emit TokenWithdraw(amount);
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