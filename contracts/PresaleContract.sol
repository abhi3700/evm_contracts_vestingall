//SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.4;

import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/security/Pausable.sol';
import '@openzeppelin/contracts/utils/math/SafeMath.sol';

/// @title Presale Vesting Contract
/// @dev Any address can vest tokens into this contract with amount, releaseTimestamp, revocable.
///      Anyone can claim tokens (if unlocked as per the schedule).
contract PresaleContract is Ownable, Pausable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    // State variables===================================================================================
    IERC20 public vestingToken;

    uint256 public maxVestingAmount;
    uint256 public totalVestedAmount;
    uint256 public totalClaimedAmount;

    struct Timelock {
        uint256 amount;
        uint256 releaseTimestamp;
    }

    mapping(address => Timelock[]) public timelocks;

    // ===============EVENTS============================================================================================
    event UpdatedMaxVestingAmount(address caller, uint256 amount, uint256 currentTimestamp);
    event TokenVested(address indexed claimerAddress, uint256 amount, uint256 unlockTimestamp, uint256 currentTimestamp);
    event TokenClaimed(address indexed claimerAddress, uint256 amount, uint256 currentTimestamp);
    event VestTransferFromFailed(uint256 amount);

    //================CONSTRUCTOR================================================================
    /// @notice Constructor
    /// @param _token ERC20 token
    /// @param _maxVestingAmount max vesting amount. This is also updatable using `updateMaxVestingAmount` 
    constructor(
        IERC20 _token,
        uint256 _maxVestingAmount
    ) {
        require(address(_token) != address(0), "Invalid address");
        require( _maxVestingAmount > 0, "max vesting amount must be positive");
        
        vestingToken = _token;

        maxVestingAmount = _maxVestingAmount;
        totalVestedAmount = 0;
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

    // ------------------------------------------------------------------------------------------
    /// @notice Vest function accessed by anyone
    /// @param _beneficiary beneficiary address
    /// @param _amount vesting amount
    /// @param _unlockTimestamp vesting unlock time
    function vest(address _beneficiary, uint256 _amount, uint256 _unlockTimestamp) external whenNotPaused {
        require(_beneficiary != address(0), "Invalid address");
        require(_amount > 0, "amount must be positive");
        require(maxVestingAmount != 0, "maxVestingAmount is not yet set by admin.");

        require(totalVestedAmount.add(_amount) <= maxVestingAmount, 'maxVestingAmount is already vested');
        require(_unlockTimestamp > block.timestamp, "unlock timestamp must be greater than the currrent");

        Timelock memory newVesting = Timelock(_amount, _unlockTimestamp);
        timelocks[_beneficiary].push(newVesting);

        totalVestedAmount = totalVestedAmount.add(_amount);

        // transfer to SC using delegate transfer
        // NOTE: the tokens has to be approved first by the caller to the SC using `approve()` method.
        bool success = vestingToken.transferFrom(msg.sender, address(this), _amount);
        if(success) {
            emit TokenVested(_beneficiary, _amount, _unlockTimestamp, block.timestamp);
        } else {
            emit VestTransferFromFailed(_amount);
            revert("vestingToken.transferFrom function failed");
        }
    }

    /// @notice Calculate claimable amount for a beneficiary
    /// @param _addr beneficiary address
    function claimableAmount(address _addr) public view whenNotPaused returns (uint256) {
        uint256 sum = 0;

        // iterate across all the vestings
        // & check if the releaseTimestamp is elapsed
        // then, add all the amounts as claimable amount
        for (uint256 i = 0; i < timelocks[_addr].length; i++) {
            if ( block.timestamp >= timelocks[_addr][i].releaseTimestamp ) {
                sum = sum.add(timelocks[_addr][i].amount);
            }
        }

        return sum;
    }

    /// @notice Delete claimed timelock
    /// @param _addr beneficiary address
    function deleteClaimedTimelock(address _addr) internal {
        for (uint256 i = 0; i < timelocks[_addr].length; ) {
            if ( block.timestamp >= timelocks[_addr][i].releaseTimestamp ) {
                if (i != timelocks[_addr].length - 1) {
                    timelocks[_addr][i] = timelocks[_addr][timelocks[_addr].length - 1];
                }
                timelocks[_addr].pop();
            } else {
                ++i;
            }
        }
    }

    // ------------------------------------------------------------------------------------------
    /// @notice Claim vesting
    /// @dev Beneficiary can claim claimableAmount which was vested
    /// @param _token Vesting token contract
    function claim(IERC20 _token) external whenNotPaused {
        require(vestingToken == _token, "invalid token address");

        uint256 amount = claimableAmount(msg.sender);
        require(amount > 0, "Claimable amount must be positive");
        require(amount <= totalVestedAmount, "Cannot withdraw more than the total vested amount");
        
        totalClaimedAmount = totalClaimedAmount.add(amount);
        deleteClaimedTimelock(msg.sender);

        // transfer from SC
        vestingToken.safeTransfer(msg.sender, amount);

        emit TokenClaimed(msg.sender, amount, block.timestamp);
    }

    // ------------------------------------------------------------------------------------------
    /// @notice Pause contract 
    function pause() public onlyOwner whenNotPaused {
        _pause();
    }

    /// @notice Unpause contract
    function unpause() public onlyOwner whenPaused {
        _unpause();
    }
}