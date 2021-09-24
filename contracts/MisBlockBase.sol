// SPDX-License-Identifier: MIT

pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import '@openzeppelin/contracts/access/Ownable.sol';

contract MisBlockBase is ERC20, Ownable {
    constructor() ERC20("UNICOIN", "UNICN") {
        _mint(msg.sender, 1000000000000 * 10 ** uint256(decimals()));
    }
}