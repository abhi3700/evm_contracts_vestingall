// SPDX-License-Identifier: MIT

pragma solidity ^0.8.2;


interface IToken {
  function balanceOf(address owner) external view returns (unit);
  // function allowance(address owner, address spender) external view returns (unit);
  // function approve(address spender, uint value) external returns (bool);
  // function transfer(address to, uint value) external returns (bool);
  // function transferFrom(address from, address to, uint value) external returns (bool);
  function transferByVestingC(address recipient, uint256 amount) public returns (bool);
}