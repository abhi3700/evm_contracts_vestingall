//SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.4;

import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/math/SafeMath.sol';
import "hardhat/console.sol";

contract TimelockContract is Ownable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    IERC20 public token;
    address public beneficiary;
    uint256 public amount;
    uint256 public releaseTime;
    bool public released;

    constructor(
        IERC20 _token,
        address _beneficiary,
        uint256 _amount,
        uint256 _releaseTime
    ) {
        token = _token;
        beneficiary = _beneficiary;
        amount = _amount;
        releaseTime = _releaseTime;
        released = false;
    }

    function releaseable() public view onlyOwner returns(bool) {
        if (block.timestamp < releaseTime) return false;
        if (released) return false;
        return true;
    }

    function releaseableAmount() public view onlyOwner returns(uint256) {
        if (releaseable()) return amount;
        return 0;
    }

    function release() public payable onlyOwner {
        require(releaseable(), 'Can not release token');
        require(token.totalSupply() >= amount, 'Total supply is less than amount');
        token.safeTransfer(beneficiary, amount);
        released = true;
    }
}