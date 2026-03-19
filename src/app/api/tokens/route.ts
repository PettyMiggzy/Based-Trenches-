import { NextResponse } from 'next/server'
import { createPublicClient, http, formatEther } from 'viem'
import { base } from 'viem/chains'

const FACTORY = '0xa8b68EBc490F215C44c37987c9EB36741aAF882c' as const
const client = createPublicClient({ chain: base, transport: http('https://mainnet.base.org') })

const FACTORY_ABI = [
  { name: 'getAllTokens', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'address[]' }] },
  { name: 'getTokenData', type: 'function', stateMutability: 'view', inputs: [{ name: 't', type: 'address' }], outputs: [{ name: 'curve', type: 'address' }, { name: 'armory', type: 'address' }, { name: 'fortify', type: 'address' }, { name: 'isValid', type: 'bool' }] },
] as const

const TOKEN_ABI = [
  { name: 'name',   type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'string' }] },
  { name: 'symbol', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'string' }] },
  // setMeta stores: img, desc, web, tw, tg — readable via public vars
  { name: 'img',    type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'string' }] },
  { name: 'desc',   type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'string' }] },
  { name: 'web',    type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'string' }] },
  { name: 'tw',     type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'string' }] },
  { name: 'tg',     type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'string' }] },
  { name: 'creator', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'address' }] },
] as const

const CURVE_ABI = [
  { name: 'totalRaised',  type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { name: 'TARGET',       type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { name: 'graduated',    type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'bool'    }] },
  { name: 'lpAddress',    type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'address' }] },
] as const

const ARMORY_ABI = [
  { name: 'balance', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
] as const

let cache: { data: unknown; ts: number } | null = null
const CACHE_TTL = 30000

export async function GET() {
  try {
    if (cache && Date.now() - cache.ts < CACHE_TTL) {
      return NextResponse.json(cache.data, { headers: { 'Cache-Control': 's-maxage=30, stale-while-revalidate=60' } })
    }

    const addresses = await client.readContract({ address: FACTORY, abi: FACTORY_ABI, functionName: 'getAllTokens' }) as `0x${string}`[]
    if (!addresses || addresses.length === 0) return NextResponse.json({ tokens: [], total: 0 })

    const slice = [...addresses].reverse().slice(0, 50)

    const tokens = await Promise.all(slice.map(async (addr) => {
      try {
        const [curve, armory] = await client.readContract({ address: FACTORY, abi: FACTORY_ABI, functionName: 'getTokenData', args: [addr] }) as [`0x${string}`, `0x${string}`, `0x${string}`, boolean]

        const [name, symbol] = await Promise.all([
          client.readContract({ address: addr, abi: TOKEN_ABI, functionName: 'name' }),
          client.readContract({ address: addr, abi: TOKEN_ABI, functionName: 'symbol' }),
        ]) as [string, string]

        // Try to get meta — may not exist on all tokens
        let imageUrl = '', description = '', creator = ''
        try {
          const [img, desc, cr] = await Promise.all([
            client.readContract({ address: addr, abi: TOKEN_ABI, functionName: 'img' }).catch(() => ''),
            client.readContract({ address: addr, abi: TOKEN_ABI, functionName: 'desc' }).catch(() => ''),
            client.readContract({ address: addr, abi: TOKEN_ABI, functionName: 'creator' }).catch(() => ''),
          ]) as [string, string, string]
          imageUrl = img || ''; description = desc || ''; creator = cr || ''
        } catch (_) {}

        let bondedEth = 0, bondTarget = 3, graduated = false, armoryBalance = 0, lpAddress = ''
        try {
          const [raised, target, grad] = await Promise.all([
            client.readContract({ address: curve, abi: CURVE_ABI, functionName: 'totalRaised' }),
            client.readContract({ address: curve, abi: CURVE_ABI, functionName: 'TARGET' }),
            client.readContract({ address: curve, abi: CURVE_ABI, functionName: 'graduated' }).catch(() => false),
          ])
          bondedEth = parseFloat(formatEther(raised as bigint))
          bondTarget = parseFloat(formatEther(target as bigint))
          graduated = grad as boolean
          if (graduated) {
            const lp = await client.readContract({ address: curve, abi: CURVE_ABI, functionName: 'lpAddress' }).catch(() => '')
            lpAddress = lp as string
          }
        } catch (_) {}

        try {
          const bal = await client.readContract({ address: armory, abi: ARMORY_ABI, functionName: 'balance' })
          armoryBalance = parseFloat(formatEther(bal as bigint))
        } catch (_) {}

        const bondPercent = bondTarget > 0 ? Math.min(100, (bondedEth / bondTarget) * 100) : 0
        const badge: 'hot' | 'new' | 'trending' = bondPercent > 80 ? 'hot' : bondPercent < 10 ? 'new' : 'trending'

        return { address: addr, name, symbol, imageUrl, description, creator, curve, armory, lpAddress, launchedAt: 0, graduated, bondedEth, bondTarget, bondPercent, armoryBalance, marketCap: Math.round(bondedEth * 1500 * 100), volume24h: 0, priceEth: 0, isRaiding: false, badge }
      } catch (_) { return null }
    }))

    const result = { tokens: tokens.filter(Boolean), total: addresses.length }
    cache = { data: result, ts: Date.now() }
    return NextResponse.json(result, { headers: { 'Cache-Control': 's-maxage=30, stale-while-revalidate=60' } })
  } catch (err: any) {
    return NextResponse.json({ error: err.message, tokens: [], total: 0 }, { status: 500 })
  }
}
