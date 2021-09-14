//SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.4;

import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/security/Pausable.sol';
import '@openzeppelin/contracts/utils/math/SafeMath.sol';
import "hardhat/console.sol";

import "./IERC20Recipient.sol";

contract StakingContract is IERC20Recipient, Ownable, Pausable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    address public beneficiary;
    IERC20 public vestingToken;

    uint256 public TOTAL_AMOUNT;
    uint256 public releaseTime;
    uint256 public totalWithdrawAmount;

    event TokenReceive(uint256 amount);
    event TokenWithdraw(uint256 amount);
    event ReleaseTimeChange(uint256 _releaseTime);

    constructor(
        IERC20 _token,
        address _beneficiary,
        uint256 _releaseTime
    ) {
        require(_beneficiary != address(0), 'Invalid address');

        beneficiary = _beneficiary;
        vestingToken = _token;
        releaseTime = _releaseTime;

        totalWithdrawAmount = 0;
    }

    function tokenFallback(address _from, uint256 _value) public override {
        require(_from == owner(), 'Money must be transferred from token contract address');
        require(TOTAL_AMOUNT.add(_value) <= 100000000000 * 10 ** 18, 'After adding the tobe transferred amount with the current TOTAL_AMOUNT, it must be <= 100 Billions for in-app stacking');
        TOTAL_AMOUNT = TOTAL_AMOUNT.add(_value);
        emit TokenReceive(_value);
    }

    function setReleaseTime(uint256 _releaseTime) public onlyOwner whenNotPaused {
        releaseTime = _releaseTime;
        emit ReleaseTimeChange(releaseTime);
    }

    function availableAmount() public view onlyOwner whenNotPaused returns(uint256) {
        if (releaseTime > block.timestamp) return 0;
        return vestingToken.balanceOf(address(this));
    }

    function withdraw() public onlyOwner whenNotPaused {
        uint256 amount = availableAmount();
        require(amount > 0, "Available amount is zero");

        vestingToken.safeTransfer(beneficiary, amount);
        totalWithdrawAmount = totalWithdrawAmount.add(amount);
        emit TokenWithdraw(amount);
    }

    function pause() public onlyOwner whenNotPaused {
        _pause();
    }

    function unpause() public onlyOwner whenPaused {
        _unpause();
    }
}