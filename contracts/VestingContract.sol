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

    bytes32 public root;

    address public beneficiary;
    IERC20 public token;

    uint256 private TOTAL_AMOUNT = 100000000000 ether;
    uint256 public totalVestedAmount;
    uint256 public totalClaimableAmount;
    uint256 public totalWithdrawAmount;

    struct Step {
        uint timestamp;
        uint16 percent;
        uint8 claimed;
    }

    Step[] steps;

    event TokensWithdraw(uint256 amount);
    event TokensClaim(uint256 amount);

    constructor(
        address _beneficiary,
        address _token
    ) {
        require(_beneficiary != address(0));
        require(_token != address(0));

        beneficiary = _beneficiary;
        token = IERC20(_token);

        totalVestedAmount = TOTAL_AMOUNT;
        totalClaimableAmount = 0;
        totalWithdrawAmount = 0;

        steps.push(Step(new DateTime().toTimestamp(2021, 2, 18), 10, 0));
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

    function claim() public onlyOwner {
        uint256 sum = 0;
        for (uint i = 0; i < steps.length; i++) {
            if (steps[i].claimed == 1) continue;
            if (steps[i].timestamp <= block.timestamp) {
                uint256 amount = TOTAL_AMOUNT.mul(steps[i].percent).div(100);
                sum = sum.add(amount);
                steps[i].claimed = 1;
            }
        }

        require(totalVestedAmount > sum, "");
        totalClaimableAmount = totalClaimableAmount.add(sum);
        totalVestedAmount = totalVestedAmount.sub(sum);

        emit TokensClaim(totalClaimableAmount);
    }

    function withdraw() public onlyOwner {
        require(totalClaimableAmount > 0, "Claimable amount is zero");
        token.safeTransfer(beneficiary, totalClaimableAmount);

        emit TokensWithdraw(totalClaimableAmount);
        totalWithdrawAmount = totalWithdrawAmount.add(totalClaimableAmount);
        totalClaimableAmount = 0;
    }

    function verifyEntitled(address recipient, uint value, bytes32[] memory proof) public view returns (bool) {
        bytes32 leaf = keccak256(abi.encodePacked(recipient, value));
        return verifyProof(leaf, proof);
    }

    function verifyProof(bytes32 leaf, bytes32[] memory proof) internal view returns (bool) {
        bytes32 currentHash = leaf;

        for (uint i = 0; i < proof.length; i += 1) {
            currentHash = parentHash(currentHash, proof[i]);
        }

        return currentHash == root;
    }

    function parentHash(bytes32 a, bytes32 b) internal pure returns (bytes32) {
        if (a < b) {
            return keccak256(abi.encode(a, b));
        } else {
            return keccak256(abi.encode(b, a));
        }
    }
}