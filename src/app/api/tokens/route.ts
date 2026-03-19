import { NextResponse } from 'next/server'
import { createPublicClient, http, formatEther } from 'viem'
import { base } from 'viem/chains'

const FACTORY = '0xa8b68EBc490F215C44c37987c9EB36741aAF882c' as const
const client = createPublicClient({ chain: base, transport: http('https://mainnet.base.org') })

const FACTORY_ABI = [
  {
    name: 'getAllTokens',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address[]' }],
  },
  {
    name: 'getTokenData',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 't', type: 'address' }],
    outputs: [
      { name: 'curve',    type: 'address' },
      { name: 'armory',   type: 'address' },
      { name: 'fortify',  type: 'address' },
      { name: 'graduated', type: 'bool'   },
    ],
  },
] as const

const TOKEN_ABI = [
  { name: 'name',   type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'string' }] },
  { name: 'symbol', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'string' }] },
] as const

const CURVE_ABI = [
  { name: 'totalRaised', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { name: 'TARGET',      type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
] as const

// 30s in-memory cache
let cache: { data: unknown; ts: number } | null = null
const CACHE_TTL = 30000

export async function GET() {
  try {
    if (cache && Date.now() - cache.ts < CACHE_TTL) {
      return NextResponse.json(cache.data, {
        headers: { 'Cache-Control': 's-maxage=30, stale-while-revalidate=60' }
      })
    }

    // Get all token addresses from factory
    const addresses = await client.readContract({
      address: FACTORY,
      abi: FACTORY_ABI,
      functionName: 'getAllTokens',
    }) as `0x${string}`[]

    if (!addresses || addresses.length === 0) {
      return NextResponse.json({ tokens: [], total: 0 })
    }

    // Take last 50, newest first
    const slice = [...addresses].reverse().slice(0, 50)

    const tokens = await Promise.all(
      slice.map(async (addr) => {
        try {
          // Get curve/armory/fortify/graduated from factory
          const [curve, armory, fortify, graduated] = await client.readContract({
            address: FACTORY,
            abi: FACTORY_ABI,
            functionName: 'getTokenData',
            args: [addr],
          }) as [`0x${string}`, `0x${string}`, `0x${string}`, boolean]

          // Get token name/symbol
          const [name, symbol] = await Promise.all([
            client.readContract({ address: addr, abi: TOKEN_ABI, functionName: 'name' }),
            client.readContract({ address: addr, abi: TOKEN_ABI, functionName: 'symbol' }),
          ]) as [string, string]

          // Get bonding curve data
          let bondedEth = 0
          let bondTarget = 3

          try {
            const [raised, target] = await Promise.all([
              client.readContract({ address: curve, abi: CURVE_ABI, functionName: 'totalRaised' }),
              client.readContract({ address: curve, abi: CURVE_ABI, functionName: 'TARGET' }),
            ])
            bondedEth = parseFloat(formatEther(raised as bigint))
            bondTarget = parseFloat(formatEther(target as bigint))
          } catch (_) {}

          const bondPercent = bondTarget > 0 ? Math.min(100, (bondedEth / bondTarget) * 100) : 0
          const badge: 'hot' | 'new' | 'trending' =
            bondPercent > 80 ? 'hot' : bondPercent < 10 ? 'new' : 'trending'

          return {
            address: addr,
            name,
            symbol,
            imageUrl: '',
            description: '',
            creator: '',
            curve,
            armory,
            fortify,
            launchedAt: 0,
            graduated,
            bondedEth,
            bondTarget,
            bondPercent,
            armoryBalance: 0,
            marketCap: Math.round(bondedEth * 1500 * 100),
            volume24h: 0,
            priceEth: 0,
            isRaiding: false,
            badge,
          }
        } catch (_) {
          return null
        }
      })
    )

    const result = {
      tokens: tokens.filter(Boolean),
      total: addresses.length,
    }

    cache = { data: result, ts: Date.now() }

    return NextResponse.json(result, {
      headers: { 'Cache-Control': 's-maxage=30, stale-while-revalidate=60' }
    })
  } catch (err: any) {
    console.error('[/api/tokens]', err)
    return NextResponse.json({ error: err.message, tokens: [], total: 0 }, { status: 500 })
  }
}
