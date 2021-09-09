//SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.4;

import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/math/SafeMath.sol';
import "hardhat/console.sol";


import './TimelockContract.sol';

contract VestingContract is Ownable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    address public beneficiary;
    IERC20 public vestingToken;

    uint256 public TOTAL_AMOUNT;
    uint256 public totalVestedAmount;
    uint256 public totalWithdrawAmount;

    TimelockContract[] timelocks;

    event TokenVest(uint256 amount);
    event TokenWithdraw(uint256 amount);

    constructor(
        address _beneficiary,
        IERC20 _token,
        uint256 _total_amount
    ) {
        require(_beneficiary != address(0));
        require(_token.totalSupply() >= _total_amount);

        beneficiary = _beneficiary;
        vestingToken = _token;
        TOTAL_AMOUNT = _total_amount;

        totalVestedAmount = 0;
        totalWithdrawAmount = 0;
    }

    function vesting(uint256 releaseTime, uint256 percent) public onlyOwner {
        uint256 vestingAmount = TOTAL_AMOUNT.mul(percent).div(100);
        require(totalVestedAmount.add(vestingAmount) <= TOTAL_AMOUNT, 'Can not vest more than total amount');

        TimelockContract newVesting = new TimelockContract(vestingToken, beneficiary, vestingAmount, releaseTime);
        timelocks.push(newVesting);
        
        totalVestedAmount = totalVestedAmount.add(vestingAmount);
        vestingToken.safeTransfer(address(newVesting), vestingAmount);

        emit TokenVest(totalVestedAmount);
    }

    function claimableAmount() public view onlyOwner returns(uint256) {
        uint256 sum = 0;
        for (uint i = 0; i < timelocks.length; i++) {
            sum = sum.add(timelocks[i].releaseableAmount());
        }
        return sum;
    }

    function withdraw() public onlyOwner {
        uint256 amount = claimableAmount();
        require(amount > 0, "Claimable amount is zero");

        for (uint i = 0; i < timelocks.length; i++) {
            if (timelocks[i].releaseable()) {
                timelocks[i].release();
            }
        }

        totalWithdrawAmount = totalWithdrawAmount.add(amount);
        emit TokenWithdraw(amount);
    }
}