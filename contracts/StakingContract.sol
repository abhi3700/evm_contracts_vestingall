//SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.4;

import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/security/Pausable.sol';
import '@openzeppelin/contracts/utils/math/SafeMath.sol';

/// @title Staking Contract
contract StakingContract is Ownable, Pausable {
   using SafeMath for uint256;
    using SafeERC20 for IERC20;
    
    modifier onlyBeneficiary() {
        require(msg.sender == beneficiary, 'Caller should be beneficiary');
        _;
    }

    // State variables===================================================================================
    using SafeMath for uint256;

    address public beneficiary;
    IERC20 public vestingToken;

    uint256 public maxVestingAmount;
    uint256 public releaseTime;
    uint256 public totalClaimedAmount;

    // ===============EVENTS============================================================================================
    event UpdatedMaxVestingAmount(address caller, uint256 amount, uint256 currentTimestamp);
    event TokenClaimed(address indexed claimerAddress, uint256 amount, uint256 currentTimestamp);
    
    /// @notice Constructor
    /// @param _token token contract Interface
    /// @param _beneficiary Beneficiary address
    /// @param _releaseTime Unlock time
    /// @param _maxVestingAmount max vesting amount. This is also updatable using `updateMaxVestingAmount` 
    constructor(
        IERC20 _token,
        address _beneficiary,
        uint256 _releaseTime,
        uint256 _maxVestingAmount
    ) {
        require(address(_token) != address(0), "Invalid address");
        require(_beneficiary != address(0), 'Invalid address');
        require( _maxVestingAmount > 0, "max vesting amount must be positive");

        beneficiary = _beneficiary;
        vestingToken = _token;
        releaseTime = _releaseTime;

        maxVestingAmount = _maxVestingAmount;
        totalClaimedAmount = 0;
    }

    //=================FUNCTIONS=================================================================
    /// @notice Update vesting contract maximum amount
    /// @param _maxAmount amount. This can be modified by the owner only 
    ///        so as to increase the max vesting amount
    function updateMaxVestingAmount(uint256 _maxAmount) external onlyOwner whenNotPaused {
        maxVestingAmount = maxVestingAmount.add(_maxAmount);

        emit UpdatedMaxVestingAmount(msg.sender, _maxAmount, block.timestamp);
    }

    /// @notice Calculate claimable amount
    function claimableAmount() public view whenNotPaused returns(uint256) {
        if (releaseTime > block.timestamp) return 0;
        return maxVestingAmount;
    }

    /// @notice Claim vesting
    /// @dev Anyone can claim claimableAmount which was vested
    /// @param _token Vesting token contract
    function claim(IERC20 _token) public onlyBeneficiary whenNotPaused {
       require(vestingToken == _token, "invalid token address");

        uint256 amount = claimableAmount();
        require(amount > 0, "Claimable amount must be positive");

        totalClaimedAmount = totalClaimedAmount.add(amount);
        
        // transfer from SC
        vestingToken.safeTransfer(msg.sender, amount);        
        
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