// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import {TestnetOnly} from "./TestnetOnly.sol";
import {TrainingCredit} from "./TrainingCredit.sol";
import {TrainingGame} from "./TrainingGame.sol";
import {TrainingAgent} from "./TrainingAgent.sol";

/// @dev Test training only; faucet credits have no economic value.
contract TrainingFactory is TestnetOnly {
    mapping(address => mapping(bytes32 => address)) public agents;
    event AgentDeployed(address indexed owner, bytes32 indexed agentId, address credit, address game, address agent);
    function deployAgent(string calldata symbol) external returns (address agentAddress) {
        bytes32 identity = keccak256(bytes(symbol));
        require(identity == keccak256("DAT") || identity == keccak256("EMA") || identity == keccak256("CAWELON"), "unknown agent");
        require(agents[msg.sender][identity] == address(0), "already deployed");
        TrainingCredit token = new TrainingCredit(symbol);
        TrainingGame game = new TrainingGame(token);
        TrainingAgent agent = new TrainingAgent(identity, token, game, msg.sender, 10 ether, 5 ether);
        agents[msg.sender][identity] = address(agent);
        token.faucet(1000 ether);
        require(token.transfer(address(game), 500 ether), "seed game");
        require(token.approve(address(agent), 100 ether), "seed approval");
        agent.fund(100 ether);
        require(token.transfer(msg.sender, 400 ether), "seed owner");
        emit AgentDeployed(msg.sender, identity, address(token), address(game), address(agent));
        return address(agent);
    }
}
