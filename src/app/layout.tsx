import type { Metadata } from 'next'
import '../styles/globals.css'
import { Providers } from './providers'
import { Nav } from '../components/Nav'

export const metadata: Metadata = {
  metadataBase: new URL('https://basedtrenches.fun'),
  title: 'Based Trenches — Memecoin Launchpad on Base',
  description: 'Launch memecoins on Base Chain. Tokens bond to 3 ETH, graduate to Uniswap V3 automatically. War Chest jackpot. Every holder has skin in the game.',
  keywords: ['memecoin', 'base chain', 'launchpad', 'defi', 'crypto', 'based trenches'],
  openGraph: {
    type: 'website',
    url: 'https://basedtrenches.fun',
    title: 'Based Trenches — Memecoin Launchpad on Base',
    description: 'Launch memecoins on Base Chain. Bonds to 3 ETH → graduates to Uniswap V3 automatically. War Chest jackpot up to 2 ETH. Dig in.',
    siteName: 'Based Trenches',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Based Trenches — Memecoin Launchpad on Base',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@BasedTrenches',
    title: 'Based Trenches — Memecoin Launchpad on Base',
    description: 'Launch memecoins on Base Chain. Bonds to 3 ETH → graduates to Uniswap V3. War Chest jackpot. Dig in.',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Black+Ops+One&family=Oswald:wght@400;500;600;700&family=Share+Tech+Mono&display=swap" rel="stylesheet" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <Providers>
          <Nav />
          <main>
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
}
