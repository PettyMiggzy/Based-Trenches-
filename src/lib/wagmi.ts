import { createConfig, http } from 'wagmi'
import { base } from 'wagmi/chains'
import { connectorsForWallets } from '@rainbow-me/rainbowkit'
import {
  metaMaskWallet,
  coinbaseWallet,
  walletConnectWallet,
  rabbyWallet,
} from '@rainbow-me/rainbowkit/wallets'

const connectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended',
      wallets: [metaMaskWallet, coinbaseWallet, rabbyWallet, walletConnectWallet],
    },
  ],
  {
    appName: 'Based Trenches',
    projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID ?? 'YOUR_WALLETCONNECT_PROJECT_ID',
  }
)

export const config = createConfig({
  chains: [base],
  connectors,
  transports: {
    [base.id]: http(process.env.NEXT_PUBLIC_BASE_RPC ?? 'https://mainnet.base.org'),
  },
})

// Contract addresses — update when deployed
export const CONTRACTS = {
  factory:    '0x0000000000000000000000000000000000000000',
  warChest:   '0x0000000000000000000000000000000000000000',
  platform:   '0x8e6Dc9387eD021DfCf59EC4a97006491d29E1262',
} as const

export const CHAIN_ID = 8453 // Base
