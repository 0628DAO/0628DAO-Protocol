import { defineConfig } from 'hardhat/config'

// Tests compile with the pinned local solc-js package, so no compiler download,
// production RPC URL, account or deployment target is configured here.
export default defineConfig({
  networks: {
    trainingLocal: {
      type: 'edr-simulated',
      chainType: 'l1',
      chainId: 84532,
    },
    trainingUnsupported: {
      type: 'edr-simulated',
      chainType: 'l1',
      chainId: 31338,
    },
    hardhatMainnet: {
      type: 'edr-simulated',
      chainType: 'l1',
      chainId: 31337,
    },
  },
})
