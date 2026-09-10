// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

/// @title Minimal CAW token interface used by the 0628DAO game integration.
/// @notice The gateway depends only on standard ERC-20 read and transfer calls.
interface ICawToken {
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}
