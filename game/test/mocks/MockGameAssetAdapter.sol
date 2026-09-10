// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import {IGameAssetAdapter} from "../../interfaces/IGameAssetAdapter.sol";

contract MockGameAssetAdapter is IGameAssetAdapter {
    address public immutable admin;
    address public gateway;

    mapping(bytes32 => address) private _itemOwners;
    mapping(bytes32 => address) public purchasedTo;
    mapping(bytes32 => bytes32) public purchasedSku;
    mapping(bytes32 => bytes32) public deliveredItemId;

    constructor() {
        admin = msg.sender;
    }

    modifier onlyGateway() {
        require(msg.sender == gateway, "gateway only");
        _;
    }

    function setGateway(address newGateway) external {
        require(msg.sender == admin, "admin only");
        require(newGateway != address(0), "zero gateway");
        gateway = newGateway;
    }

    function mintItem(address to, bytes32 itemId) external {
        require(msg.sender == admin, "admin only");
        require(to != address(0) && itemId != bytes32(0), "invalid item");
        require(_itemOwners[itemId] == address(0), "item exists");
        _itemOwners[itemId] = to;
    }

    function ownerOfItem(bytes32 itemId) external view returns (address) {
        return _itemOwners[itemId];
    }

    function fulfillPurchase(
        address player,
        bytes32 itemSku,
        bytes32 requestId,
        bytes32
    ) external onlyGateway {
        require(purchasedTo[requestId] == address(0), "already fulfilled");
        bytes32 itemId = keccak256(abi.encode(requestId, itemSku));
        require(_itemOwners[itemId] == address(0), "item exists");
        purchasedTo[requestId] = player;
        purchasedSku[requestId] = itemSku;
        deliveredItemId[requestId] = itemId;
        _itemOwners[itemId] = player;
    }

    function transferItem(address from, address to, bytes32 itemId) external onlyGateway {
        require(to != address(0), "zero recipient");
        require(_itemOwners[itemId] == from, "wrong owner");
        _itemOwners[itemId] = to;
    }
}
