import type { Metadata } from 'next'
import '../styles/globals.css'
import { Providers } from './providers'
import { Nav } from '../components/Nav'

export const metadata: Metadata = {
  title: 'Based Trenches — On Base. Dig In.',
  description: 'Memecoin launchpad on Base Chain. Tokens bond to 3 ETH, graduate to Uniswap V3, and feed the War Chest global jackpot.',
  icons: { icon: '/BT.png' },
  openGraph: {
    title: 'Based Trenches',
    description: 'On Base. Dig In.',
    images: ['/banner.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* Fixed background layers */}
        <div className="fixed inset-0 pointer-events-none z-0"
          style={{ background: 'radial-gradient(ellipse 80% 60% at 20% 10%, rgba(184,112,64,0.06) 0%, transparent 60%), radial-gradient(ellipse 100% 100% at 50% 0%, #0a0806 0%, #060504 100%)' }} />
        <div className="fixed inset-0 pointer-events-none z-0 bg-grid" />
        <div className="fixed inset-0 pointer-events-none z-0 scanlines" />
        <div className="fixed inset-0 pointer-events-none z-0 vignette" />

        <Providers>
          <Nav />
          <main className="relative z-10 pt-14">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
}
