import type { Metadata, Viewport } from 'next'
import { Nunito } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-nunito',
})

export const metadata: Metadata = {
  title: 'The Nerdy Parent Picks',
  description: 'Curated videos for curious kids — hand-picked by a nerdy parent.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'TNP Picks',
  },
  icons: {
    icon: [
      { url: '/favicon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/icon-152.png', sizes: '152x152' },
      { url: '/icon-167.png', sizes: '167x167' },
      { url: '/icon-180.png', sizes: '180x180' },
    ],
  },
}

export const viewport: Viewport = {
  themeColor: '#7B52B9',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${nunito.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-white text-gray-900">
        <Header />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
          {children}
        </main>
        <footer className="border-t border-gray-100 py-4 text-center text-xs text-gray-400">
          The Nerdy Parent Picks — curated just for you 🎓
        </footer>
      </body>
    </html>
  )
}
