//SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.4;

import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/security/Pausable.sol';
import '@openzeppelin/contracts/utils/math/SafeMath.sol';
import "hardhat/console.sol";
import "./interfaces/IToken.sol";

contract ManualBurningContract is Ownable, Pausable {
    using SafeMath for uint256;

    address public beneficiary;
    IToken public vestingToken;

    constructor(
        address _beneficiary,
        IToken _token
    ) {
        require(address(_token) != address(0), "Invalid address");
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