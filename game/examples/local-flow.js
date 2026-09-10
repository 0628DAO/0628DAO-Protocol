import { ethers } from 'ethers'

/**
 * Example using caller-supplied local signers and deployed mock contracts.
 * No private key, RPC URL, production address or real CAW is embedded here.
 */
async function runLocalFlow({ gateway, cawToken, player, operator }) {
  const playerAddress = await player.getAddress()
  const playerId = ethers.id('example-player-001')
  const rewardId = ethers.id('example-reward-001')
  const purchaseId = ethers.id('example-purchase-001')
  const itemSku = ethers.id('starter-sword')

  await (await gateway.connect(player).registerPlayer(playerId)).wait()

  const currentBalance = await gateway.cawBalanceOf(playerAddress)
  console.log('Local mock CAW balance:', currentBalance.toString())

  await (await gateway.connect(operator).recordReward(
    rewardId,
    playerAddress,
    25n,
    ethers.id('first-win')
  )).wait()
  await (await gateway.connect(player).claimReward(rewardId)).wait()

  await (await cawToken.connect(player).approve(await gateway.getAddress(), 10n)).wait()
  await (await gateway.connect(player).requestItemPurchase(
    purchaseId,
    itemSku,
    10n,
    ethers.id('local-example')
  )).wait()
  await (await gateway.connect(operator).completeItemPurchase(purchaseId)).wait()
}

export { runLocalFlow }
