// ── Token types ──────────────────────────────────────────
export interface Token {
  address: string
  name: string
  symbol: string
  emoji: string
  creator: string
  description: string
  imageUrl?: string
  twitter?: string
  telegram?: string
  website?: string

  // Bonding state
  bondedEth: number       // ETH bonded (0–3)
  bondTarget: number      // Always 3
  bondPercent: number     // 0–100
  graduated: boolean

  // Market
  marketCap: number       // USD
  volume24h: number       // ETH
  priceEth: number

  // Badges
  isRaiding: boolean
  raidState?: 'started' | 'active' | 'successful' | 'failed'
  badge?: 'trending' | 'hot' | 'new' | 'raid'

  // Armory
  armoryBalance: number   // ETH

  // Timestamps
  launchedAt: number      // unix
  graduatedAt?: number
}

// ── War Chest ─────────────────────────────────────────────
export interface WarChest {
  balance: number         // ETH
  maxPayout: number       // Always 2
  active: boolean         // true when balance >= 1
  payoutSplit: {
    liquidityBoost: number  // 50%
    randomBuyers: number    // 30%
    lastBuyer: number       // 20%
  }
}

// ── Feed events ───────────────────────────────────────────
export type FeedEventType = 'buy' | 'sell' | 'breakout' | 'raid' | 'chest' | 'crown'

export interface FeedEvent {
  id: string
  type: FeedEventType
  tokenSymbol: string
  tokenAddress: string
  description: string
  ethAmount?: number
  tokenAmount?: number
  wallet?: string
  timestamp: number
}

// ── Platform stats ────────────────────────────────────────
export interface PlatformStats {
  totalLaunched: number
  totalVolume: number       // ETH
  totalGraduated: number
  warChestBalance: number   // ETH
  creatorRewardsPaid: number // USD
}

// ── Graduation flow (locked) ──────────────────────────────
export const GRAD_FLOW = {
  bondTarget:      3,      // ETH to trigger graduation
  lpEth:           2.5,    // ETH into Uniswap LP
  creatorPayout:   0.25,   // ETH to creator wallet
  platformPayout:  0.25,   // ETH to platform wallet
  lpTokens:        200_000_000, // tokens into LP
  curveTokens:     800_000_000, // tokens on bonding curve
  totalSupply:     1_000_000_000,
  launchFee:       0.002,  // ETH
  buyFee:          0.02,   // 2%
  sellFee:         0.02,   // 2%
  creatorBuyFee:   0.01,   // 1% of buy fee
  platformBuyFee:  0.01,   // 1% of buy fee
  platformSellFee: 0.01,   // 1% of sell fee — goes to platform buffer
  armoryFee:       0.01,   // 1% of sell fee — goes to Armory
  uniFeeTier:      0.01,   // 1% Uniswap fee tier
  // Post-grad Uni fee routing
  warChestShare:   0.005,  // 0.5%
  fortifyShare:    0.004,  // 0.4%
  platformUniShare:0.001,  // 0.1%
  // War Chest
  warChestActivates: 1,    // ETH
  warChestMax:     2,      // ETH max payout
} as const
