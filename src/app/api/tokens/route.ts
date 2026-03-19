import { NextResponse } from 'next/server'
import { createPublicClient, http, formatEther } from 'viem'
import { base } from 'viem/chains'

const FACTORY = '0xa8b68EBc490F215C44c37987c9EB36741aAF882c' as const
const client = createPublicClient({ chain: base, transport: http('https://mainnet.base.org') })

const FACTORY_ABI = [
  {
    name: 'getTokenCount',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'tokens',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'index', type: 'uint256' }],
    outputs: [{ type: 'address' }],
  },
  {
    name: 'tokenInfo',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'token', type: 'address' }],
    outputs: [{
      type: 'tuple',
      components: [
        { name: 'name',        type: 'string'  },
        { name: 'symbol',      type: 'string'  },
        { name: 'imageUri',    type: 'string'  },
        { name: 'description', type: 'string'  },
        { name: 'website',     type: 'string'  },
        { name: 'twitter',     type: 'string'  },
        { name: 'telegram',    type: 'string'  },
        { name: 'creator',     type: 'address' },
        { name: 'curve',       type: 'address' },
        { name: 'armory',      type: 'address' },
        { name: 'fortify',     type: 'address' },
        { name: 'launchedAt',  type: 'uint256' },
        { name: 'graduated',   type: 'bool'    },
      ],
    }],
  },
] as const

const CURVE_ABI = [
  { name: 'totalRaised', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { name: 'TARGET',      type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
] as const

const ARMORY_ABI = [
  { name: 'balance', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
] as const

// 30s cache
let cache: { data: unknown; ts: number } | null = null
const CACHE_TTL = 30000

export async function GET() {
  try {
    if (cache && Date.now() - cache.ts < CACHE_TTL) {
      return NextResponse.json(cache.data, {
        headers: { 'Cache-Control': 's-maxage=30, stale-while-revalidate=60' }
      })
    }

    const count = await client.readContract({
      address: FACTORY,
      abi: FACTORY_ABI,
      functionName: 'getTokenCount',
    }) as bigint

    const total = Number(count)
    if (total === 0) {
      return NextResponse.json({ tokens: [], total: 0 })
    }

    // Fetch last 50
    const start = Math.max(0, total - 50)
    const indices: bigint[] = []
    for (let i = start; i < total; i++) {
      indices.push(BigInt(i))
    }

    const addresses = await Promise.all(
      indices.map(i =>
        client.readContract({
          address: FACTORY,
          abi: FACTORY_ABI,
          functionName: 'tokens',
          args: [i],
        })
      )
    ) as `0x${string}`[]

    const tokens = await Promise.all(
      addresses.map(async (addr) => {
        try {
          const info = await client.readContract({
            address: FACTORY,
            abi: FACTORY_ABI,
            functionName: 'tokenInfo',
            args: [addr],
          }) as any

          let bondedEth = 0
          let bondTarget = 3
          let armoryBalance = 0

          try {
            const [raised, target] = await Promise.all([
              client.readContract({ address: info.curve, abi: CURVE_ABI, functionName: 'totalRaised' }),
              client.readContract({ address: info.curve, abi: CURVE_ABI, functionName: 'TARGET' }),
            ])
            bondedEth = parseFloat(formatEther(raised as bigint))
            bondTarget = parseFloat(formatEther(target as bigint))
          } catch (_) {}

          try {
            const bal = await client.readContract({ address: info.armory, abi: ARMORY_ABI, functionName: 'balance' })
            armoryBalance = parseFloat(formatEther(bal as bigint))
          } catch (_) {}

          const bondPercent = bondTarget > 0 ? Math.min(100, (bondedEth / bondTarget) * 100) : 0

          const badge: 'hot' | 'new' | 'trending' =
            bondPercent > 80 ? 'hot' :
            bondPercent < 10 ? 'new' :
            'trending'

          return {
            address: addr,
            name: info.name,
            symbol: info.symbol,
            imageUrl: info.imageUri || '',
            description: info.description || '',
            website: info.website || '',
            twitter: info.twitter || '',
            telegram: info.telegram || '',
            creator: info.creator,
            curve: info.curve,
            armory: info.armory,
            launchedAt: Number(info.launchedAt),
            graduated: info.graduated,
            bondedEth,
            bondTarget,
            bondPercent,
            armoryBalance,
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
      tokens: tokens.filter(Boolean).reverse(),
      total,
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
