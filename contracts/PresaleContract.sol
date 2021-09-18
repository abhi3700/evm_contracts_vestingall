//SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.4;

import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/security/Pausable.sol';
import '@openzeppelin/contracts/utils/math/SafeMath.sol';
import "hardhat/console.sol";

import "./IVestingContract.sol";
import './TimelockContract.sol';
import "./MisBlockBase.sol";

contract PresaleContract is IVestingContract, Ownable, Pausable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    MisBlockBase public vestingToken;

    uint256 public maximumAmount;
    uint256 public totalVestedAmount;
    uint256 public totalClaimedAmount;

    mapping(address => bool) revokes;

    TimelockContract[] timelocks;

    event UpdateMaximumAmount(uint256 amount);
    event TokenVest(uint256 amount);
    event TokenClaim(uint256 amount);
    event Revoke(address account);

    /// @notice Constructor
    /// @param _token ERC20 token
    constructor(
        MisBlockBase _token
    ) {
        vestingToken = _token;

        maximumAmount = 0;
        totalVestedAmount = 0;
        totalClaimedAmount = 0;
    }

    /// @notice Update vesting contract maximum amount after send transaction
    /// @param _maximumAmount Maximun amount
    function updateMaximumAmount(uint256 _maximumAmount) public override {
        maximumAmount = _maximumAmount;
        emit UpdateMaximumAmount(maximumAmount);
    }

    /// @notice Vesting function
    /// @param releaseTime Vesting unlock time
    /// @param account Vesting owner address
    /// @param amount Vesting amount
    function vest(uint256 releaseTime, address account, uint256 amount) public onlyOwner whenNotPaused {
        require(totalVestedAmount.add(amount) <= maximumAmount, 'Can not vest more than maximum amount');

        TimelockContract newVesting = new TimelockContract(account, amount, releaseTime);
        timelocks.push(newVesting);

        totalVestedAmount = totalVestedAmount.add(amount);
        emit TokenVest(amount);
    }

    /// @notice Calculate claimable amount
    /// @param account Vesting owner address
    function _claimableAmount(address account) internal view returns(uint256) {
        uint256 sum = 0;
        for (uint i = 0; i < timelocks.length; i++) {
            if (timelocks[i].releaseable() && timelocks[i].beneficiary() == account) {
                sum = sum.add(timelocks[i].releaseableAmount());
            }
        }
        return sum;
    }

    /// @notice Calculate claimable amount
    function claimableAmount() public view whenNotPaused returns(uint256) {
        return _claimableAmount(msg.sender);
    }

    /// @notice Claim vesting
    /// @param token Token
    function claim(MisBlockBase token) public whenNotPaused {
        require(token == vestingToken, 'Invalid token address');
        uint256 amount = _claimableAmount(msg.sender);
        require(amount > 0, "Claimable amount is zero");
        require(amount <= vestingToken.balanceOf(address(this)), "Can not claim more than total amount");

        for (uint i = 0; i < timelocks.length; i++) {
            if (timelocks[i].releaseable() && timelocks[i].beneficiary() == msg.sender) {
                vestingToken.transferByVesting(msg.sender, amount);
                timelocks[i].release();
            }
        }

        totalClaimedAmount = totalClaimedAmount.add(amount);
        emit TokenClaim(amount);
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