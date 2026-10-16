// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;


/// @dev Test training only; faucet credits have no economic value.
abstract contract TestnetOnly {
    constructor() {
        require(block.chainid == 84532 || block.chainid == 31337, "testnet only");
    }
}
