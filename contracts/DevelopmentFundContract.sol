//SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.4;

import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/security/Pausable.sol';
import '@openzeppelin/contracts/utils/math/SafeMath.sol';

import "./IVestingContract.sol";
import './TimelockContract.sol';
import "./MisBlockBase.sol";

contract DevelopmentFundContract is IVestingContract, Ownable, Pausable {
    using SafeMath for uint256;

    MisBlockBase public vestingToken;

    uint256 public maxVestingAmount;
    uint256 public totalVestedAmount;
    uint256 public totalClaimedAmount;

    TimelockContract[] timelocks;

    // EVENTS
    event UpdateMaximumVestingAmount(address caller, uint256 amount, uint256 currentTimestamp);
    event TokenClaim(uint256 amount);
    event TokenVesting(address indexed claimerAddress, uint256 amount, uint256 unlockTimestamp, uint256 currentTimestamp);
    event TokenClaimed(address indexed claimerAddress, uint256 amount, uint256 currentTimestamp);

    /// @notice Constructor
    /// @param _token ERC20 token
    constructor(
        MisBlockBase _token
    ) {
        vestingToken = _token;

        maxVestingAmount = 0;
        totalVestedAmount = 0;
        totalClaimedAmount = 0;
    }

    /// @notice Update vesting contract maximum amount after send transaction
    /// @param _amountTransferred Transferred amount. This can be modified by the owner 
    ///        so as to increase the max vesting amount
    function updateMaxVestingAmount(uint256 _amountTransferred) public override whenNotPaused {
        require(msg.sender == address(vestingToken), 'The caller is the token contract');
        maxVestingAmount = maxVestingAmount.add(_amountTransferred);
        emit UpdateMaximumVestingAmount(msg.sender, _amountTransferred, block.timestamp);
    }

    /// @notice Vest function only accessed by owner
    /// @param _unlockTimestamp Presale unlock time
    /// @param _addr claimer address
    /// @param _amount vesting amount
    function vest(address _addr, uint256 _amount, uint256 _unlockTimestamp) external onlyOwner whenNotPaused {
        require( _amount > 0, "amount must be positive");
        require(totalVestedAmount.add(_amount) <= maxVestingAmount, 'maxVestingAmount is already vested');
        require(_unlockTimestamp > block.timestamp, "unlock timestamp must be greater than the currrent");

        TimelockContract newVesting = new TimelockContract(_addr, _amount, _unlockTimestamp);
        timelocks.push(newVesting);

        totalVestedAmount = totalVestedAmount.add(_amount);
        emit TokenVesting(_addr, _amount, _unlockTimestamp, block.timestamp);
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
    function claimableAmount() external view whenNotPaused returns(uint256) {
        return _claimableAmount(msg.sender);
    }

    /// @notice Claim vesting
    /// @dev Anyone can claim claimableAmount which was vested
    /// @param token Vesting token contract
    function claim(IERC20 token) external whenNotPaused {
        require(token == vestingToken, "invalid token address");

        uint256 amount = _claimableAmount(msg.sender);
        require(amount > 0, "Claimable amount must be positive");
        require(amount <= totalVestedAmount, "Can not withdraw more than total vested amount");


        for (uint i = 0; i < timelocks.length; ++i) {
            if (timelocks[i].releaseable() && timelocks[i].beneficiary() == msg.sender) {
                vestingToken.transferByVestingC(timelocks[i].beneficiary(), timelocks[i].amount());
                timelocks[i].release();
            }
        }

        totalClaimedAmount = totalClaimedAmount.add(amount);
        emit TokenClaimed(msg.sender, amount, block.timestamp);
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