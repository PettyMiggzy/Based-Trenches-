import { NextResponse } from 'next/server'
import { createPublicClient, http, formatEther } from 'viem'
import { base } from 'viem/chains'

const FACTORY = '0xa8b68EBc490F215C44c37987c9EB36741aAF882c' as const
const client = createPublicClient({ chain: base, transport: http('https://mainnet.base.org') })

const FACTORY_ABI = [
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
  { name: 'name',        type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'string'  }] },
  { name: 'symbol',      type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'string'  }] },
  { name: 'totalSupply', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
] as const

const CURVE_ABI = [
  { name: 'totalRaised', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { name: 'TARGET',      type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
] as const

const ARMORY_ABI = [
  { name: 'balance', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
] as const

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const address = params.id as `0x${string}`

  try {
    // Get factory data
    const [curve, armory, fortify, graduated] = await client.readContract({
      address: FACTORY,
      abi: FACTORY_ABI,
      functionName: 'getTokenData',
      args: [address],
    }) as [`0x${string}`, `0x${string}`, `0x${string}`, boolean]

    // Get token name/symbol
    const [name, symbol] = await Promise.all([
      client.readContract({ address, abi: TOKEN_ABI, functionName: 'name' }),
      client.readContract({ address, abi: TOKEN_ABI, functionName: 'symbol' }),
    ]) as [string, string]

    // Bonding curve
    let bondedEth = 0, bondTarget = 3, armoryBalance = 0

    try {
      const [raised, target] = await Promise.all([
        client.readContract({ address: curve, abi: CURVE_ABI, functionName: 'totalRaised' }),
        client.readContract({ address: curve, abi: CURVE_ABI, functionName: 'TARGET' }),
      ])
      bondedEth = parseFloat(formatEther(raised as bigint))
      bondTarget = parseFloat(formatEther(target as bigint))
    } catch (_) {}

    try {
      const bal = await client.readContract({ address: armory, abi: ARMORY_ABI, functionName: 'balance' })
      armoryBalance = parseFloat(formatEther(bal as bigint))
    } catch (_) {}

    const bondPercent = bondTarget > 0 ? Math.min(100, (bondedEth / bondTarget) * 100) : 0

    return NextResponse.json({
      address,
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
      priceEth: 0,
      armoryBalance,
      marketCap: Math.round(bondedEth * 1500 * 100),
      volume24h: 0,
      isRaiding: false,
    }, {
      headers: { 'Cache-Control': 's-maxage=15, stale-while-revalidate=30' }
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 404 })
  }
}
