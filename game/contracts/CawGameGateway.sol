// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import {ICawToken} from "../interfaces/ICawToken.sol";
import {IGameAssetAdapter} from "../interfaces/IGameAssetAdapter.sol";

/// @title CAW Game Gateway
/// @notice Development-only integration layer between CAW and a game asset ledger.
/// @dev This contract does not modify or inherit from the CAW token contract.
contract CawGameGateway {
    enum Status {
        None,
        Pending,
        Completed,
        Cancelled
    }

    enum TradeStatus {
        None,
        Open,
        Accepted,
        Cancelled
    }

    struct Reward {
        address player;
        uint256 amount;
        bytes32 reasonHash;
        Status status;
    }

    struct PurchaseRequest {
        address player;
        bytes32 itemSku;
        uint256 amount;
        bytes32 detailsHash;
        Status status;
    }

    struct TradeOffer {
        address seller;
        address designatedBuyer;
        bytes32 itemId;
        uint256 price;
        uint64 expiresAt;
        bytes32 detailsHash;
        TradeStatus status;
    }

    error Unauthorized();
    error ZeroAddress();
    error InvalidContract();
    error InvalidAmount();
    error InvalidIdentifier();
    error AlreadyRegistered();
    error IdentifierInUse();
    error PlayerNotRegistered();
    error OperationAlreadyExists();
    error InvalidStatus();
    error RewardLimitExceeded();
    error InsufficientRewardPool();
    error TokenTransferFailed();
    error UnsupportedTokenBehavior();
    error ContractPaused();
    error ReentrantCall();
    error InvalidExpiry();
    error WrongBuyer();
    error SellerCannotBuy();
    error ItemNotOwnedBySeller();
    error AmountExceedsExcess();

    event PlayerRegistered(address indexed wallet, bytes32 indexed playerId);
    event OperatorUpdated(address indexed operator, bool allowed);
    event PauseUpdated(bool paused);
    event OwnershipTransferStarted(address indexed currentOwner, address indexed pendingOwner);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event TreasuryTransferStarted(address indexed currentTreasury, address indexed pendingTreasury);
    event TreasuryTransferred(address indexed previousTreasury, address indexed newTreasury);
    event MaxRewardPerGrantUpdated(uint256 previousLimit, uint256 newLimit);
    event RewardPoolFunded(address indexed funder, uint256 amount);
    event ExcessCawWithdrawn(address indexed recipient, uint256 amount);
    event RewardRecorded(
        bytes32 indexed rewardId,
        address indexed player,
        uint256 amount,
        bytes32 reasonHash
    );
    event RewardClaimed(bytes32 indexed rewardId, address indexed player, uint256 amount);
    event RewardCancelled(bytes32 indexed rewardId, address indexed player, uint256 amount);
    event ItemPurchaseRequested(
        bytes32 indexed requestId,
        address indexed player,
        bytes32 indexed itemSku,
        uint256 amount,
        bytes32 detailsHash
    );
    event ItemPurchaseCompleted(
        bytes32 indexed requestId,
        address indexed player,
        bytes32 indexed itemSku,
        uint256 amount
    );
    event ItemPurchaseCancelled(bytes32 indexed requestId, address indexed player, uint256 amount);
    event TradeOfferCreated(
        bytes32 indexed tradeId,
        address indexed seller,
        address indexed designatedBuyer,
        bytes32 itemId,
        uint256 price,
        uint64 expiresAt,
        bytes32 detailsHash
    );
    event TradeOfferAccepted(
        bytes32 indexed tradeId,
        address indexed seller,
        address indexed buyer,
        bytes32 itemId,
        uint256 price
    );
    event TradeOfferCancelled(bytes32 indexed tradeId, address indexed seller);

    ICawToken public immutable cawToken;
    IGameAssetAdapter public immutable assetAdapter;

    address public owner;
    address public pendingOwner;
    address public treasury;
    address public pendingTreasury;
    bool public paused;
    uint256 public maxRewardPerGrant;
    uint256 public reservedRewards;
    uint256 public escrowedPurchases;

    mapping(address => bool) public operators;
    mapping(address => bytes32) public playerIdByWallet;
    mapping(bytes32 => address) public walletByPlayerId;
    mapping(bytes32 => Reward) public rewards;
    mapping(bytes32 => PurchaseRequest) public purchases;
    mapping(bytes32 => TradeOffer) public trades;

    uint256 private _reentrancyState = 1;

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    modifier onlyOperator() {
        if (!_isOperator(msg.sender)) revert Unauthorized();
        _;
    }

    modifier whenNotPaused() {
        if (paused) revert ContractPaused();
        _;
    }

    modifier nonReentrant() {
        if (_reentrancyState != 1) revert ReentrantCall();
        _reentrancyState = 2;
        _;
        _reentrancyState = 1;
    }

    constructor(
        address cawTokenAddress,
        address assetAdapterAddress,
        address initialOwner,
        address initialTreasury,
        uint256 initialMaxRewardPerGrant
    ) {
        if (initialOwner == address(0) || initialTreasury == address(0)) revert ZeroAddress();
        if (cawTokenAddress.code.length == 0 || assetAdapterAddress.code.length == 0) {
            revert InvalidContract();
        }
        if (initialMaxRewardPerGrant == 0) revert InvalidAmount();

        cawToken = ICawToken(cawTokenAddress);
        assetAdapter = IGameAssetAdapter(assetAdapterAddress);
        owner = initialOwner;
        treasury = initialTreasury;
        maxRewardPerGrant = initialMaxRewardPerGrant;
    }

    function registerPlayer(bytes32 playerId) external whenNotPaused {
        if (playerId == bytes32(0)) revert InvalidIdentifier();
        if (playerIdByWallet[msg.sender] != bytes32(0)) revert AlreadyRegistered();
        if (walletByPlayerId[playerId] != address(0)) revert IdentifierInUse();

        playerIdByWallet[msg.sender] = playerId;
        walletByPlayerId[playerId] = msg.sender;
        emit PlayerRegistered(msg.sender, playerId);
    }

    function isRegisteredPlayer(address wallet) public view returns (bool) {
        return playerIdByWallet[wallet] != bytes32(0);
    }

    function cawBalanceOf(address player) external view returns (uint256) {
        return cawToken.balanceOf(player);
    }

    function cawAllowanceForGateway(address player) external view returns (uint256) {
        return cawToken.allowance(player, address(this));
    }

    function availableRewardPool() public view returns (uint256) {
        uint256 balance = cawToken.balanceOf(address(this));
        uint256 obligations = reservedRewards + escrowedPurchases;
        return balance > obligations ? balance - obligations : 0;
    }

    function rewardClaimed(bytes32 rewardId) external view returns (bool) {
        return rewards[rewardId].status == Status.Completed;
    }

    function fundRewardPool(uint256 amount) external whenNotPaused nonReentrant {
        if (amount == 0) revert InvalidAmount();
        _pullCaw(msg.sender, address(this), amount);
        emit RewardPoolFunded(msg.sender, amount);
    }

    function recordReward(
        bytes32 rewardId,
        address player,
        uint256 amount,
        bytes32 reasonHash
    ) external onlyOperator whenNotPaused {
        if (rewardId == bytes32(0)) revert InvalidIdentifier();
        if (!isRegisteredPlayer(player)) revert PlayerNotRegistered();
        if (amount == 0) revert InvalidAmount();
        if (amount > maxRewardPerGrant) revert RewardLimitExceeded();
        if (rewards[rewardId].status != Status.None) revert OperationAlreadyExists();
        if (availableRewardPool() < amount) revert InsufficientRewardPool();

        rewards[rewardId] = Reward(player, amount, reasonHash, Status.Pending);
        reservedRewards += amount;
        emit RewardRecorded(rewardId, player, amount, reasonHash);
    }

    function claimReward(bytes32 rewardId) external whenNotPaused nonReentrant {
        Reward storage reward = rewards[rewardId];
        if (reward.status != Status.Pending) revert InvalidStatus();
        if (reward.player != msg.sender) revert Unauthorized();

        reward.status = Status.Completed;
        reservedRewards -= reward.amount;
        _pushCaw(msg.sender, reward.amount);
        emit RewardClaimed(rewardId, msg.sender, reward.amount);
    }

    function cancelReward(bytes32 rewardId) external onlyOperator {
        Reward storage reward = rewards[rewardId];
        if (reward.status != Status.Pending) revert InvalidStatus();

        reward.status = Status.Cancelled;
        reservedRewards -= reward.amount;
        emit RewardCancelled(rewardId, reward.player, reward.amount);
    }

    function requestItemPurchase(
        bytes32 requestId,
        bytes32 itemSku,
        uint256 amount,
        bytes32 detailsHash
    ) external whenNotPaused nonReentrant {
        _requireRegistered(msg.sender);
        if (requestId == bytes32(0) || itemSku == bytes32(0)) revert InvalidIdentifier();
        if (amount == 0) revert InvalidAmount();
        if (purchases[requestId].status != Status.None) revert OperationAlreadyExists();

        purchases[requestId] = PurchaseRequest(
            msg.sender,
            itemSku,
            amount,
            detailsHash,
            Status.Pending
        );
        escrowedPurchases += amount;
        _pullCaw(msg.sender, address(this), amount);
        emit ItemPurchaseRequested(requestId, msg.sender, itemSku, amount, detailsHash);
    }

    function completeItemPurchase(bytes32 requestId)
        external
        onlyOperator
        whenNotPaused
        nonReentrant
    {
        PurchaseRequest storage purchase = purchases[requestId];
        if (purchase.status != Status.Pending) revert InvalidStatus();

        purchase.status = Status.Completed;
        escrowedPurchases -= purchase.amount;
        assetAdapter.fulfillPurchase(
            purchase.player,
            purchase.itemSku,
            requestId,
            purchase.detailsHash
        );
        _pushCaw(treasury, purchase.amount);
        emit ItemPurchaseCompleted(
            requestId,
            purchase.player,
            purchase.itemSku,
            purchase.amount
        );
    }

    function cancelItemPurchase(bytes32 requestId) external nonReentrant {
        PurchaseRequest storage purchase = purchases[requestId];
        if (purchase.status != Status.Pending) revert InvalidStatus();
        if (msg.sender != purchase.player && !_isOperator(msg.sender)) revert Unauthorized();

        purchase.status = Status.Cancelled;
        escrowedPurchases -= purchase.amount;
        _pushCaw(purchase.player, purchase.amount);
        emit ItemPurchaseCancelled(requestId, purchase.player, purchase.amount);
    }

    function createTradeOffer(
        bytes32 tradeId,
        bytes32 itemId,
        address designatedBuyer,
        uint256 price,
        uint64 expiresAt,
        bytes32 detailsHash
    ) external whenNotPaused {
        _requireRegistered(msg.sender);
        if (tradeId == bytes32(0) || itemId == bytes32(0)) revert InvalidIdentifier();
        if (price == 0) revert InvalidAmount();
        if (expiresAt <= block.timestamp) revert InvalidExpiry();
        if (trades[tradeId].status != TradeStatus.None) revert OperationAlreadyExists();
        if (designatedBuyer != address(0) && !isRegisteredPlayer(designatedBuyer)) {
            revert PlayerNotRegistered();
        }
        if (assetAdapter.ownerOfItem(itemId) != msg.sender) revert ItemNotOwnedBySeller();

        trades[tradeId] = TradeOffer(
            msg.sender,
            designatedBuyer,
            itemId,
            price,
            expiresAt,
            detailsHash,
            TradeStatus.Open
        );
        emit TradeOfferCreated(
            tradeId,
            msg.sender,
            designatedBuyer,
            itemId,
            price,
            expiresAt,
            detailsHash
        );
    }

    function acceptTrade(bytes32 tradeId) external whenNotPaused nonReentrant {
        _requireRegistered(msg.sender);
        TradeOffer storage trade = trades[tradeId];
        if (trade.status != TradeStatus.Open) revert InvalidStatus();
        if (block.timestamp >= trade.expiresAt) revert InvalidExpiry();
        if (msg.sender == trade.seller) revert SellerCannotBuy();
        if (trade.designatedBuyer != address(0) && trade.designatedBuyer != msg.sender) {
            revert WrongBuyer();
        }
        if (assetAdapter.ownerOfItem(trade.itemId) != trade.seller) {
            revert ItemNotOwnedBySeller();
        }

        trade.status = TradeStatus.Accepted;
        _pullCaw(msg.sender, trade.seller, trade.price);
        assetAdapter.transferItem(trade.seller, msg.sender, trade.itemId);
        emit TradeOfferAccepted(
            tradeId,
            trade.seller,
            msg.sender,
            trade.itemId,
            trade.price
        );
    }

    function cancelTrade(bytes32 tradeId) external {
        TradeOffer storage trade = trades[tradeId];
        if (trade.status != TradeStatus.Open) revert InvalidStatus();
        if (msg.sender != trade.seller && !_isOperator(msg.sender)) revert Unauthorized();

        trade.status = TradeStatus.Cancelled;
        emit TradeOfferCancelled(tradeId, trade.seller);
    }

    function setOperator(address operator, bool allowed) external onlyOwner {
        if (operator == address(0)) revert ZeroAddress();
        operators[operator] = allowed;
        emit OperatorUpdated(operator, allowed);
    }

    function setPaused(bool newPaused) external onlyOwner {
        paused = newPaused;
        emit PauseUpdated(newPaused);
    }

    function setMaxRewardPerGrant(uint256 newLimit) external onlyOwner {
        if (newLimit == 0) revert InvalidAmount();
        uint256 previousLimit = maxRewardPerGrant;
        maxRewardPerGrant = newLimit;
        emit MaxRewardPerGrantUpdated(previousLimit, newLimit);
    }

    function proposeOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert ZeroAddress();
        pendingOwner = newOwner;
        emit OwnershipTransferStarted(owner, newOwner);
    }

    function acceptOwnership() external {
        if (msg.sender != pendingOwner) revert Unauthorized();
        address previousOwner = owner;
        owner = msg.sender;
        pendingOwner = address(0);
        emit OwnershipTransferred(previousOwner, msg.sender);
    }

    function proposeTreasury(address newTreasury) external onlyOwner {
        if (newTreasury == address(0)) revert ZeroAddress();
        pendingTreasury = newTreasury;
        emit TreasuryTransferStarted(treasury, newTreasury);
    }

    function acceptTreasury() external {
        if (msg.sender != pendingTreasury) revert Unauthorized();
        address previousTreasury = treasury;
        treasury = msg.sender;
        pendingTreasury = address(0);
        emit TreasuryTransferred(previousTreasury, msg.sender);
    }

    function withdrawExcessCaw(address recipient, uint256 amount)
        external
        onlyOwner
        nonReentrant
    {
        if (recipient == address(0)) revert ZeroAddress();
        if (amount == 0) revert InvalidAmount();
        if (amount > availableRewardPool()) revert AmountExceedsExcess();
        _pushCaw(recipient, amount);
        emit ExcessCawWithdrawn(recipient, amount);
    }

    function _isOperator(address account) internal view returns (bool) {
        return account == owner || operators[account];
    }

    function _requireRegistered(address player) internal view {
        if (!isRegisteredPlayer(player)) revert PlayerNotRegistered();
    }

    function _pullCaw(address from, address to, uint256 amount) internal {
        uint256 recipientBalanceBefore = cawToken.balanceOf(to);
        _callToken(
            abi.encodeWithSelector(ICawToken.transferFrom.selector, from, to, amount)
        );
        uint256 recipientBalanceAfter = cawToken.balanceOf(to);
        if (
            recipientBalanceAfter < recipientBalanceBefore ||
            recipientBalanceAfter - recipientBalanceBefore != amount
        ) revert UnsupportedTokenBehavior();
    }

    function _pushCaw(address to, uint256 amount) internal {
        uint256 gatewayBalanceBefore = cawToken.balanceOf(address(this));
        uint256 recipientBalanceBefore = cawToken.balanceOf(to);
        _callToken(abi.encodeWithSelector(ICawToken.transfer.selector, to, amount));
        uint256 gatewayBalanceAfter = cawToken.balanceOf(address(this));
        uint256 recipientBalanceAfter = cawToken.balanceOf(to);
        if (
            gatewayBalanceBefore < gatewayBalanceAfter ||
            gatewayBalanceBefore - gatewayBalanceAfter != amount ||
            recipientBalanceAfter < recipientBalanceBefore ||
            recipientBalanceAfter - recipientBalanceBefore != amount
        ) revert UnsupportedTokenBehavior();
    }

    function _callToken(bytes memory callData) internal {
        (bool success, bytes memory returnData) = address(cawToken).call(callData);
        if (!success) revert TokenTransferFailed();
        if (returnData.length != 0) {
            if (returnData.length < 32 || !abi.decode(returnData, (bool))) {
                revert TokenTransferFailed();
            }
        }
    }
}
