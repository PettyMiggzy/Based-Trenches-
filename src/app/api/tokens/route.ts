import { NextResponse } from 'next/server'
import { createPublicClient, http, formatEther } from 'viem'
import { base } from 'viem/chains'

const FACTORY = '0xa8b68EBc490F215C44c37987c9EB36741aAF882c' as const

const client = createPublicClient({
  chain: base,
  transport: http('https://rpc.ankr.com/base/2b13f0a5db938b91b907dfc7c181e9048dd80ecca276287f9cae8feb3bd211cc')
})

const FACTORY_ABI = [
  { name: 'getAllTokens', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'address[]' }] },
  { name: 'getTokenData', type: 'function', stateMutability: 'view', inputs: [{ name: 't', type: 'address' }], outputs: [{ name: 'curve', type: 'address' }, { name: 'armory', type: 'address' }, { name: 'fortify', type: 'address' }, { name: 'isValid', type: 'bool' }] },
] as const

const TOKEN_ABI = [
  { name: 'name',    type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'string' }] },
  { name: 'symbol',  type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'string' }] },
  { name: 'img',     type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'string' }] },
  { name: 'desc',    type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'string' }] },
  { name: 'web',     type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'string' }] },
  { name: 'tw',      type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'string' }] },
  { name: 'tg',      type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'string' }] },
  { name: 'creator', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'address' }] },
] as const

const CURVE_ABI = [
  { name: 'totalRaised', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { name: 'TARGET',      type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { name: 'graduated',   type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'bool'    }] },
  { name: 'lpAddress',   type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'address' }] },
] as const

const ARMORY_ABI = [
  { name: 'balance', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
] as const

export async function GET() {
  try {
    const addresses = await client.readContract({
      address: FACTORY,
      abi: FACTORY_ABI,
      functionName: 'getAllTokens'
    }) as `0x${string}`[]

    console.log('Total addresses from factory:', addresses?.length)

    if (!addresses || addresses.length === 0) {
      return NextResponse.json({ tokens: [], total: 0 })
    }

    const slice = [...addresses].reverse().slice(0, 50)

    const tokens = await Promise.all(slice.map(async (addr) => {
      try {
        const data = await client.readContract({
          address: FACTORY,
          abi: FACTORY_ABI,
          functionName: 'getTokenData',
          args: [addr]
        })

        console.log('getTokenData for', addr, ':', JSON.stringify(data))

        const [curve, armory] = data as [`0x${string}`, `0x${string}`, `0x${string}`, boolean]

        const [name, symbol] = await Promise.all([
          client.readContract({ address: addr, abi: TOKEN_ABI, functionName: 'name' }),
          client.readContract({ address: addr, abi: TOKEN_ABI, functionName: 'symbol' }),
        ]) as [string, string]

        console.log('Token:', name, symbol)

        let imageUrl = '', description = '', creator = ''
        try {
          const [img, desc, cr] = await Promise.all([
            client.readContract({ address: addr, abi: TOKEN_ABI, functionName: 'img' }).catch(() => ''),
            client.readContract({ address: addr, abi: TOKEN_ABI, functionName: 'desc' }).catch(() => ''),
            client.readContract({ address: addr, abi: TOKEN_ABI, functionName: 'creator' }).catch(() => ''),
          ]) as [string, string, string]
          imageUrl = img || ''
          description = desc || ''
          creator = cr || ''
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
        } catch (e: any) {
          console.log('curve read failed for', curve, ':', e.message)
        }

        try {
          const bal = await client.readContract({
            address: armory,
            abi: ARMORY_ABI,
            functionName: 'balance'
          })
          armoryBalance = parseFloat(formatEther(bal as bigint))
        } catch (_) {}

        const bondPercent = bondTarget > 0 ? Math.min(100, (bondedEth / bondTarget) * 100) : 0
        const badge: 'hot' | 'new' | 'trending' = bondPercent > 80 ? 'hot' : bondPercent < 10 ? 'new' : 'trending'

        return {
          address: addr, name, symbol, imageUrl, description, creator,
          curve, armory, lpAddress, launchedAt: 0, graduated,
          bondedEth, bondTarget, bondPercent, armoryBalance,
          marketCap: Math.round(bondedEth * 1500 * 100),
          volume24h: 0, priceEth: 0, isRaiding: false, badge
        }
      } catch (e: any) {
        console.log('token failed:', addr, e.message)
        return null
      }
    }))

    const result = { tokens: tokens.filter(Boolean), total: addresses.length }
    console.log('Returning tokens:', result.tokens.length, 'of', result.total)
    return NextResponse.json(result)

  } catch (err: any) {
    console.log('API top level error:', err.message)
    return NextResponse.json({ error: err.message, tokens: [], total: 0 }, { status: 500 })
  }
}