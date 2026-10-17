// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import {TestnetOnly} from "./TestnetOnly.sol";
import {TrainingCredit} from "./TrainingCredit.sol";
import {TrainingGame} from "./TrainingGame.sol";

/// @dev Test training only; faucet credits have no economic value.
contract TrainingAgent is TestnetOnly {
    TrainingCredit public immutable credit;
    TrainingGame public immutable game;
    address public immutable owner;
    address public operator;
    bytes32 public immutable agentId;
    uint256 public immutable maxStake;
    uint256 public immutable reserve;
    int256 public realizedPnl;
    uint256 public burnedFromProfit;
    bool public paused;
    bool private entered;
    mapping(bytes32 => bool) public usedCommands;
    event Funded(address indexed from, uint256 amount);
    event Executed(bytes32 indexed commandId, uint256 indexed round, uint256 stake, uint256 payout, int256 pnl);
    event ProfitBurned(bytes32 indexed commandId, uint256 amount);
    event OperatorChanged(address indexed operator);
    event PauseChanged(bool paused);

    modifier onlyOwner() { require(msg.sender == owner, "owner only"); _; }
    modifier guarded() { require(!entered, "reentrant"); entered = true; _; entered = false; }
    constructor(bytes32 identity, TrainingCredit token, TrainingGame trainingGame, address initialOwner, uint256 stakeLimit, uint256 reserveFloor) {
        require(identity == keccak256("DAT") || identity == keccak256("EMA") || identity == keccak256("CAWELON"), "unknown agent");
        require(initialOwner != address(0) && stakeLimit > 0 && stakeLimit <= 100 ether, "invalid policy");
        require(address(token) != address(0) && address(trainingGame) != address(0), "zero contract");
        require(address(trainingGame.credit()) == address(token), "game/token mismatch");
        agentId = identity;
        credit = token;
        game = trainingGame;
        owner = initialOwner;
        operator = initialOwner;
        maxStake = stakeLimit;
        reserve = reserveFloor;
    }
    function setOperator(address next) external onlyOwner {
        require(next != address(0), "zero operator");
        operator = next;
        emit OperatorChanged(next);
    }
    function setPaused(bool value) external onlyOwner { paused = value; emit PauseChanged(value); }
    function fund(uint256 amount) external guarded {
        require(amount > 0, "zero amount");
        require(credit.transferFrom(msg.sender, address(this), amount), "fund transfer");
        emit Funded(msg.sender, amount);
    }
    function execute(bytes32 commandId, uint256 round, uint256 answer, uint256 stake) external guarded {
        require(msg.sender == operator, "operator only");
        require(!paused && !usedCommands[commandId] && commandId != bytes32(0), "inactive or duplicate");
        uint256 beforeBalance = credit.balanceOf(address(this));
        require(stake > 0 && stake <= maxStake, "stake limit");
        require(beforeBalance >= reserve && stake <= beforeBalance - reserve, "reserve floor");
        usedCommands[commandId] = true;
        require(credit.approve(address(game), stake), "approve");
        uint256 payout = game.play(round, answer, stake);
        require(credit.approve(address(game), 0), "revoke");
        uint256 afterBalance = credit.balanceOf(address(this));
        require(beforeBalance <= uint256(type(int256).max) && afterBalance <= uint256(type(int256).max), "balance overflow");
        int256 delta = int256(afterBalance) - int256(beforeBalance);
        realizedPnl += delta;
        emit Executed(commandId, round, stake, payout, delta);
    }
    function burnProfit(bytes32 commandId, uint256 amount) external onlyOwner guarded {
        require(!paused && !usedCommands[commandId] && commandId != bytes32(0), "inactive or duplicate");
        require(amount > 0 && realizedPnl > 0 && burnedFromProfit + amount <= uint256(realizedPnl), "no eligible profit");
        uint256 cash = credit.balanceOf(address(this));
        require(cash >= reserve && amount <= cash - reserve, "reserve floor");
        usedCommands[commandId] = true;
        burnedFromProfit += amount;
        credit.burn(amount);
        emit ProfitBurned(commandId, amount);
    }
}
