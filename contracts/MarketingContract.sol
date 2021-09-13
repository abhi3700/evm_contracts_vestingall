//SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.4;

import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/security/Pausable.sol';
import '@openzeppelin/contracts/utils/math/SafeMath.sol';
import "hardhat/console.sol";


import './TimelockContract.sol';

contract MarketingContract is Ownable, Pausable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    IERC20 public vestingToken;

    uint256 public totalVestedAmount;
    uint256 public totalWithdrawAmount;

    mapping(address => bool) revokes;

    TimelockContract[] timelocks;

    event TokenReceive(uint256 amount);
    event TokenVest(uint256 amount);
    event TokenWithdraw(uint256 amount);
    event Revoke(address account);

    constructor(
        IERC20 _token
    ) {
        vestingToken = _token;

        totalVestedAmount = 0;
        totalWithdrawAmount = 0;
    }

    function vesting(uint256 releaseTime, address account, uint256 amount) public onlyOwner whenNotPaused {
        require(totalVestedAmount.add(amount) <= vestingToken.balanceOf(address(this)), 'Can not vest more than total amount');

        TimelockContract newVesting = new TimelockContract(account, amount, releaseTime);
        timelocks.push(newVesting);

        totalVestedAmount = totalVestedAmount.add(amount);
        emit TokenVest(totalVestedAmount);
    }

    function revoke(address account) public onlyOwner whenNotPaused {
        require(revokes[account] == false, 'Account was revoked already');
        for (uint i = 0; i < timelocks.length; i++) {
            if (timelocks[i].beneficiary() == account) {
                timelocks[i].revoke();
            }
        }
        revokes[account] = true;
        emit Revoke(account);
    }

    function availableAmount() public view onlyOwner whenNotPaused returns(uint256) {
        uint256 sum = 0;
        for (uint i = 0; i < timelocks.length; i++) {
            sum = sum.add(timelocks[i].releaseableAmount());
        }
        return sum;
    }

    function withdraw() public onlyOwner whenNotPaused {
        uint256 amount = availableAmount();
        require(amount > 0, "Available amount is zero");
        require(amount <= vestingToken.balanceOf(address(this)), "Can not withdraw more than total amount");

        for (uint i = 0; i < timelocks.length; i++) {
            if (timelocks[i].releaseable()) {
                vestingToken.safeTransfer(timelocks[i].beneficiary(), timelocks[i].amount());
                timelocks[i].release();
            }
        }

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