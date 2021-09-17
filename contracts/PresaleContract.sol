//SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.4;

import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/security/Pausable.sol';
import '@openzeppelin/contracts/utils/math/SafeMath.sol';
import "hardhat/console.sol";

import "./IERC20Recipient.sol";
import './TimelockContract.sol';

contract PresaleContract is IERC20Recipient, Ownable, Pausable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    IERC20 public vestingToken;

    uint256 public TOTAL_AMOUNT;
    uint256 public totalLockedAmount;
    uint256 public totalWithdrawAmount;

    mapping(address => bool) revokes;

    TimelockContract[] timelocks;

    event TokenReceive(uint256 amount);
    event TokenWithdraw(uint256 amount);
    event TokenPresale(uint256 amount);
    event Revoke(address account);

    /// @notice Constructor
    /// @param _token ERC20 token
    constructor(
        IERC20 _token
    ) {
        vestingToken = _token;

        totalLockedAmount = 0;
        totalWithdrawAmount = 0;
    }

    /// @notice Token receive fallback function
    /// @param _from Sender addres
    /// @param _value Transaction amount
    function tokenFallback(address _from, uint256 _value) public override {
        require(_from == owner(), 'Money must be transferred from token contract address');
        require(TOTAL_AMOUNT.add(_value) <= 100000000000 * 10 ** 18, 'After adding the tobe transferred amount with the current TOTAL_AMOUNT, it must be <= 100 Billions for presale');
        TOTAL_AMOUNT = TOTAL_AMOUNT.add(_value);
        emit TokenReceive(_value);
    }    

    /// @notice Presale function
    /// @param releaseTime Presale unlock time
    /// @param account Presale owner address
    /// @param amount Presale amount
    function presale(uint256 releaseTime, address account, uint256 amount) public onlyOwner whenNotPaused {
        require(totalLockedAmount.add(amount) <= vestingToken.balanceOf(address(this)), 'TOTAL_AMOUNT is already vested');

        TimelockContract newVesting = new TimelockContract(account, amount, releaseTime);
        timelocks.push(newVesting);

        totalLockedAmount = totalLockedAmount.add(amount);
        emit TokenPresale(totalLockedAmount);
    }

    // function revoke(address account) public onlyOwner whenNotPaused {
    //     require(revokes[account] == false, 'Account was revoked already');
    //     for (uint i = 0; i < timelocks.length; i++) {
    //         if (timelocks[i].beneficiary() == account) {
    //             timelocks[i].revoke();
    //         }
    //     }
    //     revokes[account] = true;
    //     emit Revoke(account);
    // }

    /// @notice Calculate available amount
    /// @param account Vesting owner address
    function availableAmount(address account) public view onlyOwner whenNotPaused returns(uint256) {
        uint256 sum = 0;
        for (uint i = 0; i < timelocks.length; i++) {
            if (timelocks[i].releaseable() && timelocks[i].beneficiary() == account) {
                sum = sum.add(timelocks[i].releaseableAmount());
            }
        }
        return sum;
    }

    /// @notice Withdraw vesting
    /// @param account Vesting owner address
    function withdraw(address account) public onlyOwner whenNotPaused {
        uint256 amount = availableAmount(account);
        require(amount > 0, "Available amount is zero");
        require(amount <= vestingToken.balanceOf(address(this)), "Can not withdraw more than total amount");

        for (uint i = 0; i < timelocks.length; i++) {
            if (timelocks[i].releaseable() && timelocks[i].beneficiary() == account) {
                vestingToken.safeTransfer(timelocks[i].beneficiary(), timelocks[i].amount());
                timelocks[i].release();
            }
        }

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