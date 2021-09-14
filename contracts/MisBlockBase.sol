// SPDX-License-Identifier: MIT

pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import '@openzeppelin/contracts/access/Ownable.sol';
import "./IERC20Recipient.sol";

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

    function transfer(address _to, uint256 _value) public virtual override returns (bool success){
        _transfer(_msgSender(), _to, _value);
        if (isContract(_to)) {
            IERC20Recipient receiver = IERC20Recipient(_to);
            receiver.tokenFallback(_msgSender(), _value);
        }
        emit Transfer(_msgSender(), _to, _value);
        return true;
    }
}