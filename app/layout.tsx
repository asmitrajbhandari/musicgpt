import './globals.css'
import './musicgpt.scss'
import { Inter } from 'next/font/google'
import Image from 'next/image'
import Sidebar from './components/Sidebar'

const inter = Inter({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter'
})

export const metadata = {
  title: 'MusicGPT',
  description: 'MusicGPT',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} font-sans antialiased`}>
        <div className="relative z-1 w-full overflow-x-hidden">
          <Sidebar />
          <div className="lg:ml-[200px] transition-all duration-300">
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center gap-3 p-4 bg-[#0A0C0D]">
              <div className="w-8 h-8">
                <Image src="/assets/images/musicgpt-logo.png" alt="logo" width={32} height={32} />
              </div>
              <span className="logo-text font-medium text-white">MusicGPT</span>
            </div>
            <div className="lg:pt-0 pt-16">
              {children}
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
