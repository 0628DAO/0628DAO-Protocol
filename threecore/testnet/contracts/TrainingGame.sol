// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import {TestnetOnly} from "./TestnetOnly.sol";
import {TrainingCredit} from "./TrainingCredit.sol";

/// @dev Test training only; faucet credits have no economic value.
contract TrainingGame is TestnetOnly {
    TrainingCredit public immutable credit;
    mapping(address => uint256) public rounds;
    event Played(address indexed player, uint256 indexed round, uint256 stake, uint256 payout, bool correct);

    constructor(TrainingCredit token) {
        require(address(token) != address(0), "zero token");
        credit = token;
    }
    function challenge(address player) public view returns (uint256 round, uint256 a, uint256 b) {
        round = rounds[player];
        a = uint256(keccak256(abi.encode(player, round, uint256(1)))) % 100;
        b = uint256(keccak256(abi.encode(player, round, uint256(2)))) % 100;
    }
    function play(uint256 expectedRound, uint256 answer, uint256 stake) external returns (uint256 payout) {
        require(stake > 0 && stake <= 100 ether, "stake limit");
        (uint256 round, uint256 a, uint256 b) = challenge(msg.sender);
        require(expectedRound == round, "stale round");
        bool correct = answer == a + b;
        // Reject before taking an entry if the reward pool cannot honor a win.
        require(!correct || credit.balanceOf(address(this)) >= stake, "reward pool empty");
        rounds[msg.sender] = round + 1;
        require(credit.transferFrom(msg.sender, address(this), stake), "entry transfer");
        if (correct) {
            payout = stake * 2;
            require(credit.transfer(msg.sender, payout), "reward transfer");
        }
        emit Played(msg.sender, round, stake, payout, correct);
    }
}
