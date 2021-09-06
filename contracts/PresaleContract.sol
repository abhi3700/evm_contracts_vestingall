//SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.4;

import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/math/SafeMath.sol';
import "hardhat/console.sol";


import './util/DateTime.sol';

contract PresaleContract is Ownable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    IERC20 public token;

    uint256 private TOTAL_AMOUNT = 100000000000 ether;
    uint256 public totalLockedAmount;
    uint256 public totalAvailableAmount;
    uint256 public totalPresaleAmount;

    struct Step {
        uint timestamp;
        uint16 percent;
        uint8 unlocked;
    }

    Step[] steps;

    event TokensUnlock(uint256 amount);
    event TokensPresale(uint256 amount);

    constructor(
        address _token
    ) {
        require(_token != address(0));

        token = IERC20(_token);

        totalLockedAmount = TOTAL_AMOUNT;
        totalAvailableAmount = 0;
        totalPresaleAmount = 0;

        steps.push(Step(new DateTime().toTimestamp(2020, 12, 18), 10, 0));
        steps.push(Step(new DateTime().toTimestamp(2022, 1, 18), 10, 0));
        steps.push(Step(new DateTime().toTimestamp(2022, 2, 18), 10, 0));
        steps.push(Step(new DateTime().toTimestamp(2022, 3, 18), 10, 0));
        steps.push(Step(new DateTime().toTimestamp(2022, 4, 18), 10, 0));
        steps.push(Step(new DateTime().toTimestamp(2022, 5, 18), 10, 0));
        steps.push(Step(new DateTime().toTimestamp(2022, 6, 18), 10, 0));
        steps.push(Step(new DateTime().toTimestamp(2022, 7, 18), 10, 0));
        steps.push(Step(new DateTime().toTimestamp(2022, 8, 18), 10, 0));
        steps.push(Step(new DateTime().toTimestamp(2022, 9, 18), 10, 0));
    }

    function unlock() public onlyOwner {
        uint256 sum = 0;
        for (uint i = 0; i < steps.length; i++) {
            if (steps[i].unlocked == 1) continue;
            if (steps[i].timestamp <= block.timestamp) {
                uint256 amount = TOTAL_AMOUNT.mul(steps[i].percent).div(100);
                sum = sum.add(amount);
                steps[i].unlocked = 1;
            }
        }

        require(totalLockedAmount > sum, "");
        totalLockedAmount = totalLockedAmount.sub(sum);
        totalAvailableAmount = totalAvailableAmount.add(sum);

        emit TokensUnlock(totalAvailableAmount);
    }

    function presale(address beneficiary, uint256 amount) public onlyOwner {
        require(totalAvailableAmount >= amount, "Available amount is less than amount");
        token.safeTransfer(beneficiary, amount);

        emit TokensPresale(amount);
        totalPresaleAmount = totalPresaleAmount.add(amount);
        totalAvailableAmount = totalAvailableAmount.sub(amount);
    }
}