// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import {TestnetOnly} from "./TestnetOnly.sol";

/// @dev Test training only; faucet credits have no economic value.
contract TrainingCredit is TestnetOnly {
    string public name;
    string public symbol;
    uint8 public constant decimals = 18;
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    event Transfer(address indexed from, address indexed to, uint256 amount);
    event Approval(address indexed owner, address indexed spender, uint256 amount);

    constructor(string memory tokenSymbol) {
        name = string.concat("ThreeCore training ", tokenSymbol);
        symbol = string.concat("t", tokenSymbol);
    }
    function faucet(uint256 amount) external {
        require(amount > 0 && amount <= 10000 ether, "faucet limit");
        totalSupply += amount;
        balanceOf[msg.sender] += amount;
        emit Transfer(address(0), msg.sender, amount);
    }
    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }
    function transfer(address to, uint256 amount) external returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }
    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        uint256 allowed = allowance[from][msg.sender];
        require(allowed >= amount, "allowance");
        allowance[from][msg.sender] = allowed - amount;
        emit Approval(from, msg.sender, allowed - amount);
        _transfer(from, to, amount);
        return true;
    }
    function burn(uint256 amount) external {
        require(balanceOf[msg.sender] >= amount, "balance");
        balanceOf[msg.sender] -= amount;
        totalSupply -= amount;
        emit Transfer(msg.sender, address(0), amount);
    }
    function _transfer(address from, address to, uint256 amount) private {
        require(to != address(0) && balanceOf[from] >= amount, "transfer");
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        emit Transfer(from, to, amount);
    }
}
