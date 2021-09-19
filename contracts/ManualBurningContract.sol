//SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.4;

import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/security/Pausable.sol';
import '@openzeppelin/contracts/utils/math/SafeMath.sol';
import "hardhat/console.sol";

contract ManualBurningContract is Ownable, Pausable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    address public beneficiary;
    IERC20 public vestingToken;

    constructor(
        address _beneficiary,
        IERC20 _token
    ) {
        require(_beneficiary != address(0), 'invalid address');

        beneficiary = _beneficiary;
        vestingToken = _token;
    }
    

    function pause() public onlyOwner whenNotPaused {
        _pause();
    }

    function unpause() public onlyOwner whenPaused {
        _unpause();
    }
}