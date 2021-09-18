//SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.4;

import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/security/Pausable.sol';
import '@openzeppelin/contracts/utils/math/SafeMath.sol';
import "hardhat/console.sol";

import "./IVestingContract.sol";
import "./MisBlockBase.sol";

contract InfluencerContract is IVestingContract, Ownable, Pausable {
    
    modifier onlyBeneficiary() {
        require(msg.sender == beneficiary, 'Caller should be beneficiary');
        _;
    }

    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    address public beneficiary;
    MisBlockBase public vestingToken;

    uint256 public maximumAmount;
    uint256 public releaseTime;
    uint256 public totalClaimedAmount;

    event UpdateMaximumAmount(uint256 amount);
    event TokenClaim(uint256 amount);
    event ReleaseTimeChange(uint256 _releaseTime);

    /// @notice Constructor
    /// @param _token ERC20 token
    /// @param _beneficiary Beneficiary address
    /// @param _releaseTime Unlock time
    constructor(
        MisBlockBase _token,
        address _beneficiary,
        uint256 _releaseTime
    ) {
        require(_beneficiary != address(0), 'Invalid address');

        beneficiary = _beneficiary;
        vestingToken = _token;
        releaseTime = _releaseTime;

        maximumAmount = 0;
        totalClaimedAmount = 0;
    }

    /// @notice Update vesting contract maximum amount after send transaction
    /// @param _maximumAmount Maximun amount
    function updateMaximumAmount(uint256 _maximumAmount) public override {
        maximumAmount = _maximumAmount;
        emit UpdateMaximumAmount(maximumAmount);
    }

    /// @notice Change unlock time
    /// @param _releaseTime Unlock time
    function setReleaseTime(uint256 _releaseTime) public onlyOwner whenNotPaused {
        releaseTime = _releaseTime;
        emit ReleaseTimeChange(releaseTime);
    }

    /// @notice Calculate claimable amount
    function claimableAmount() public view onlyBeneficiary whenNotPaused returns(uint256) {
        if (releaseTime > block.timestamp) return 0;
        return vestingToken.balanceOf(address(this));
    }

    /// @notice Claim
    function claim() public onlyBeneficiary whenNotPaused {
        uint256 amount = claimableAmount();
        require(amount > 0, "Claimable amount is zero");

        vestingToken.transferByVesting(msg.sender, amount);
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