// SPDX-License-Identifier: MIT

pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import '@openzeppelin/contracts/access/Ownable.sol';

contract MisBlockBase is ERC20, Ownable {
    constructor() ERC20("UNICOIN", "UNICN") {
        _mint(msg.sender, 1000000000000 * 10 ** uint256(decimals()));
    }

    event MintFinished(address account, uint256 amount);
    event BurnFinished(address account, uint256 amount);

    function mint(address _account, uint256 _amount) public {
        _mint(_account, _amount);

        emit MintFinished(_account, _amount);
    }
    function burn(address _account, uint256 _amount) public {
        _burn(_account, _amount);

        emit BurnFinished(_account, _amount);
    }
    
}