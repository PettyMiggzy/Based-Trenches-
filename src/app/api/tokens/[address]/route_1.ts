import { NextResponse } from 'next/server'
import { createPublicClient, http, formatEther } from 'viem'
import { base } from 'viem/chains'

const FACTORY = '0xa8b68EBc490F215C44c37987c9EB36741aAF882c' as const
const client = createPublicClient({ chain: base, transport: http('https://mainnet.base.org') })

const FACTORY_ABI = [
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
  { name: 'getCurrentPrice', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
] as const

const ARMORY_ABI = [
  { name: 'balance', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
] as const

export async function GET(
  _req: Request,
  { params }: { params: { address: string } }
) {
  const address = params.address as `0x${string}`

  try {
    const info = await client.readContract({
      address: FACTORY,
      abi: FACTORY_ABI,
      functionName: 'tokenInfo',
      args: [address],
    }) as any

    let bondedEth = 0, bondTarget = 3, priceEth = 0, armoryBalance = 0

    try {
      const [raised, target, price] = await Promise.all([
        client.readContract({ address: info.curve, abi: CURVE_ABI, functionName: 'totalRaised' }),
        client.readContract({ address: info.curve, abi: CURVE_ABI, functionName: 'TARGET' }),
        client.readContract({ address: info.curve, abi: CURVE_ABI, functionName: 'getCurrentPrice' }).catch(() => 0n),
      ])
      bondedEth = parseFloat(formatEther(raised as bigint))
      bondTarget = parseFloat(formatEther(target as bigint))
      priceEth = parseFloat(formatEther(price as bigint))
    } catch {}

    try {
      const bal = await client.readContract({ address: info.armory, abi: ARMORY_ABI, functionName: 'balance' })
      armoryBalance = parseFloat(formatEther(bal as bigint))
    } catch {}

    const bondPercent = bondTarget > 0 ? Math.min(100, (bondedEth / bondTarget) * 100) : 0

    return NextResponse.json({
      address,
      name: info.name,
      symbol: info.symbol,
      imageUri: info.imageUri || '',
      description: info.description || '',
      website: info.website || '',
      twitter: info.twitter || '',
      telegram: info.telegram || '',
      creator: info.creator,
      curve: info.curve,
      armory: info.armory,
      fortify: info.fortify,
      launchedAt: Number(info.launchedAt),
      graduated: info.graduated,
      bondedEth,
      bondTarget,
      bondPercent,
      priceEth,
      armoryBalance,
      marketCap: bondedEth * 1500 * 100,
      volume24h: 0,
      isRaiding: false,
    }, {
      headers: { 'Cache-Control': 's-maxage=15, stale-while-revalidate=30' }
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 404 })
  }
}
