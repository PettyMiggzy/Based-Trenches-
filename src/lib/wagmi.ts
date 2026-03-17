import { createConfig, http } from 'wagmi'
import { base } from 'wagmi/chains'
import { connectorsForWallets } from '@rainbow-me/rainbowkit'
import {
  injectedWallet,
  coinbaseWallet,
  walletConnectWallet,
  rainbowWallet,
} from '@rainbow-me/rainbowkit/wallets'

const connectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended',
      wallets: [injectedWallet, coinbaseWallet, rainbowWallet, walletConnectWallet],
    },
  ],
  {
    appName: 'Based Trenches',
    projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID ?? 'cc1358b5e311a1f844c1d6482633c78d',
  }
)

export const config = createConfig({
  chains: [base],
  connectors,
  transports: {
    [base.id]: http(process.env.NEXT_PUBLIC_BASE_RPC ?? 'https://mainnet.base.org'),
  },
})

export const BASE_WSS = process.env.NEXT_PUBLIC_BASE_WSS ?? ''

export const CONTRACTS = {
  factory:  process.env.NEXT_PUBLIC_FACTORY_ADDRESS   ?? '0x0000000000000000000000000000000000000000',
  warChest: process.env.NEXT_PUBLIC_WAR_CHEST_ADDRESS ?? '0x0000000000000000000000000000000000000000',
  platform: process.env.NEXT_PUBLIC_PLATFORM_WALLET   ?? '0xC022B75D302AF292328cc0C056c7310552E74c8E',
} as const

export const CHAIN_ID = 8453