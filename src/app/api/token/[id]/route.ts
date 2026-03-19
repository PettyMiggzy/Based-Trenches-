import { NextResponse } from 'next/server'
import { createPublicClient, http, formatEther } from 'viem'
import { base } from 'viem/chains'

const FACTORY = '0xa8b68EBc490F215C44c37987c9EB36741aAF882c' as const
const client = createPublicClient({ chain: base, transport: http('https://mainnet.base.org') })

const FACTORY_ABI = [
  { name: 'getTokenData', type: 'function', stateMutability: 'view', inputs: [{ name: 't', type: 'address' }], outputs: [{ name: 'curve', type: 'address' }, { name: 'armory', type: 'address' }, { name: 'fortify', type: 'address' }, { name: 'isValid', type: 'bool' }] },
] as const

const TOKEN_ABI = [
  { name: 'name',    type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'string'  }] },
  { name: 'symbol',  type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'string'  }] },
  { name: 'img',     type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'string'  }] },
  { name: 'desc',    type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'string'  }] },
  { name: 'web',     type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'string'  }] },
  { name: 'tw',      type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'string'  }] },
  { name: 'tg',      type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'string'  }] },
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

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const address = params.id as `0x${string}`
  try {
    const [curve, armory, fortify] = await client.readContract({ address: FACTORY, abi: FACTORY_ABI, functionName: 'getTokenData', args: [address] }) as [`0x${string}`, `0x${string}`, `0x${string}`, boolean]

    const [name, symbol] = await Promise.all([
      client.readContract({ address, abi: TOKEN_ABI, functionName: 'name' }),
      client.readContract({ address, abi: TOKEN_ABI, functionName: 'symbol' }),
    ]) as [string, string]

    let imageUrl = '', description = '', website = '', twitter = '', telegram = '', creator = ''
    try {
      const [img, desc, web, tw, tg, cr] = await Promise.all([
        client.readContract({ address, abi: TOKEN_ABI, functionName: 'img'     }).catch(() => ''),
        client.readContract({ address, abi: TOKEN_ABI, functionName: 'desc'    }).catch(() => ''),
        client.readContract({ address, abi: TOKEN_ABI, functionName: 'web'     }).catch(() => ''),
        client.readContract({ address, abi: TOKEN_ABI, functionName: 'tw'      }).catch(() => ''),
        client.readContract({ address, abi: TOKEN_ABI, functionName: 'tg'      }).catch(() => ''),
        client.readContract({ address, abi: TOKEN_ABI, functionName: 'creator' }).catch(() => ''),
      ]) as string[]
      imageUrl = img; description = desc; website = web; twitter = tw; telegram = tg; creator = cr
    } catch (_) {}

    let bondedEth = 0, bondTarget = 3, graduated = false, lpAddress = '', armoryBalance = 0
    try {
      const [raised, target, grad] = await Promise.all([
        client.readContract({ address: curve, abi: CURVE_ABI, functionName: 'totalRaised' }),
        client.readContract({ address: curve, abi: CURVE_ABI, functionName: 'TARGET'      }),
        client.readContract({ address: curve, abi: CURVE_ABI, functionName: 'graduated'   }).catch(() => false),
      ])
      bondedEth = parseFloat(formatEther(raised as bigint))
      bondTarget = parseFloat(formatEther(target as bigint))
      graduated  = grad as boolean
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

    return NextResponse.json({ address, name, symbol, imageUrl, description, website, twitter, telegram, creator, curve, armory, fortify, lpAddress, launchedAt: 0, graduated, bondedEth, bondTarget, bondPercent, priceEth: 0, armoryBalance, marketCap: Math.round(bondedEth * 1500 * 100), volume24h: 0, isRaiding: false }, { headers: { 'Cache-Control': 's-maxage=15, stale-while-revalidate=30' } })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 404 })
  }
}
