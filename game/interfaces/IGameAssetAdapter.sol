// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

/// @title Boundary implemented by a game-owned item ledger or adapter.
/// @notice The adapter must authorize the gateway before settlement is enabled.
interface IGameAssetAdapter {
    function ownerOfItem(bytes32 itemId) external view returns (address);

    function fulfillPurchase(
        address player,
        bytes32 itemSku,
        bytes32 requestId,
        bytes32 detailsHash
    ) external;

    function transferItem(address from, address to, bytes32 itemId) external;
}
