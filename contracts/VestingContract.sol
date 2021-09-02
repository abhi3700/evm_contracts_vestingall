//SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.4;

import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/math/SafeMath.sol';
import "hardhat/console.sol";


import './util/DateTime.sol';

contract VestingContract is Ownable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    address public beneficiary;
    IERC20 public token;

    uint256 private totalAmount;

    struct Step {
        uint timestamp;
        uint16 percent;
        uint8 released;
    }

    Step[] steps;

    event TokensReleased(uint256 amount);

    constructor(
        address _beneficiary,
        address _token
    ) {
        require(_beneficiary != address(0));
        require(_token != address(0));

        beneficiary = _beneficiary;
        token = IERC20(_token);

        steps.push(Step(new DateTime().toTimestamp(2022, 2, 18), 10, 0));
        steps.push(Step(new DateTime().toTimestamp(2022, 3, 18), 10, 0));
        steps.push(Step(new DateTime().toTimestamp(2022, 4, 18), 10, 0));
        steps.push(Step(new DateTime().toTimestamp(2022, 5, 18), 10, 0));
        steps.push(Step(new DateTime().toTimestamp(2022, 6, 18), 10, 0));
        steps.push(Step(new DateTime().toTimestamp(2022, 7, 18), 10, 0));
        steps.push(Step(new DateTime().toTimestamp(2022, 8, 18), 10, 0));
        steps.push(Step(new DateTime().toTimestamp(2022, 9, 18), 10, 0));
        steps.push(Step(new DateTime().toTimestamp(2022, 10, 18), 10, 0));
        steps.push(Step(new DateTime().toTimestamp(2022, 11, 18), 10, 0));
    }

    function calcTotalAmount() public payable {
        totalAmount = token.balanceOf(address(this));
    }

    function release() public {
        uint256 amount = _releasableAmount();
        require(amount > 0, "Available amount is zero");
        token.safeTransfer(beneficiary, amount);
        emit TokensReleased(amount);
    }

    function _releasableAmount() public payable returns (uint256) {
        uint256 sum = 0;
        for (uint i = 0; i < steps.length; i++) {
            if (steps[i].released == 1) continue;
            if (steps[i].timestamp <= block.timestamp) {
                uint256 amount = totalAmount.mul(steps[i].percent).div(100);
                sum = sum.add(amount);
                steps[i].released = 1;
            }
        }
        return sum;
    }
}