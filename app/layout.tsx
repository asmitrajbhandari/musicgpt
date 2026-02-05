import './globals.css'
import './musicgpt.scss'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Image from 'next/image'
import Sidebar from './components/Sidebar'
import ProgressBar from './components/ProgressBar'
import TitleManager from './components/TitleManager'

const inter = Inter({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter'
})

export const metadata = {
  title: 'MusicGPT',
  description: 'MusicGPT',
  icons: {
    icon: '/assets/images/musicgpt-logo.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} font-sans antialiased`}>
        <div className="relative z-1 w-full overflow-x-hidden bg-section-gradient h-full">
          <TitleManager />
          <ProgressBar />
          <Sidebar />
          <div className="lg:ml-[200px] transition-all duration-300">
            <div className="lg:pt-0 pt-16">
              <div className="">
                {children}
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
