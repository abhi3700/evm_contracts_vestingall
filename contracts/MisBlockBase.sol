// SPDX-License-Identifier: MIT

pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import '@openzeppelin/contracts/access/Ownable.sol';
import "./IVestingContract.sol";

contract MisBlockBase is ERC20, Ownable {
    constructor() ERC20("UNICOIN", "UNICN") {
        _mint(msg.sender, 1000000000000 * 10 ** uint256(decimals()));
    }

    function isContract(address account) internal view returns (bool) {
        uint32 size;
        assembly {
            size := extcodesize(account)
        }
        return (size > 0);
    }

    function allowcateVesting(address _to, uint256 _amount) public returns (bool success) {
        _transfer(_msgSender(), _to, _amount);
        if (isContract(_to)) {
            IVestingContract receiver = IVestingContract(_to);
            receiver.updateMaxVestingAmount(_amount);
        }
        emit Transfer(_msgSender(), _to, _amount);
        return true;
    }

    function transferByVestingC(address _to, uint256 _amount) public returns (bool success) {
        _transfer(_msgSender(), _to, _amount);
        emit Transfer(_msgSender(), _to, _amount);
        return true;
    }
}