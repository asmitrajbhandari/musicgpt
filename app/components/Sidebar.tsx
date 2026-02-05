"use client"
import { Search, Command } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { getNavigationItems, getLibraryItems } from '../utils/navigation'

export default function Sidebar() {
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const NavLink = ({ href, children, icon, iconActive }: { 
    href: string; 
    children: React.ReactNode; 
    icon: string; 
    iconActive: string 
  }) => {
    const isActive = pathname === href
    return (
      <Link 
        className={`group/navlink relative flex h-9 items-center gap-2 rounded-full px-4 text-sm font-medium text-white transition duration-200 active:scale-95 ${
          isActive ? 'bg-white/[0.08]' : 'hover:bg-white/[0.08]'
        }`} 
        href={href}
        onClick={() => setIsSidebarOpen(false)}
      >
        <Image 
          src={isActive ? iconActive : icon} 
          alt={typeof children === 'string' ? children : ''} 
          width={20} 
          height={20} 
        />
        {children}
      </Link>
    )
  }

  const navigationItems = getNavigationItems()
  const libraryItems = getLibraryItems()

  return (
    <>
      {/* Mobile Header with Sidebar */}
      <header className="lg:hidden">
        <div className="fixed top-0 left-0 right-0 z-[60] flex flex-row items-center gap-3 p-5">
          <button 
            className="box-border size-10 rounded-[12px] border-1 border-neutral-500 bg-white/[0.08] text-white backdrop-blur-attachmentActive hover:bg-white/[0.16] inline-flex items-center justify-center transition-[background-color] duration-200"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20" className="pointer-events-none absolute size-5 text-white">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.67" d="M10 6.67 6.67 10m0 0L10 13.33M6.67 10h6.66M6.5 17.5h7c1.4 0 2.1 0 2.64-.27a2.5 2.5 0 0 0 1.09-1.1c.27-.53.27-1.23.27-2.63v-7c0-1.4 0-2.1-.27-2.63a2.5 2.5 0 0 0-1.1-1.1c-.53-.27-1.23-.27-2.63-.27h-7c-1.4 0-2.1 0-2.63.27a2.5 2.5 0 0 0-1.1 1.1C2.5 4.4 2.5 5.1 2.5 6.5v7c0 1.4 0 2.1.27 2.64.24.47.62.85 1.1 1.09.53.27 1.23.27 2.63.27Z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20" className="pointer-events-none absolute size-5 text-white">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.667" d="M7.5 2.5v15m-1-15h7c1.4 0 2.1 0 2.635.272a2.5 2.5 0 0 1 1.092 1.093C17.5 4.4 17.5 5.1 17.5 6.5v7c0 1.4 0 2.1-.273 2.635a2.5 2.5 0 0 1-1.092 1.092c-.535.273-1.235.273-2.635.273h-7c-1.4 0-2.1 0-2.635-.273a2.5 2.5 0 0 1-1.093-1.092C2.5 15.6 2.5 14.9 2.5 13.5v-7c0-1.4 0-2.1.272-2.635a2.5 2.5 0 0 1 1.093-1.093C4.4 2.5 5.1 2.5 6.5 2.5Z"></path>
              </svg>
            )}
          </button>
          <div className="w-8 h-8">
            <Image src="/assets/images/musicgpt-logo.png" alt="logo" width={32} height={32} />
          </div>
          <span className="gpt-text-sm font-medium text-white">MusicGPT</span>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <aside className={`
        lg:hidden fixed flex-col justify-between w-[300px] bg-white/[0.03] h-screen shrink-0 z-40 transition-transform duration-300 backdrop-blur-[30px]
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col gap-8 px-5 pb-4 pt-24">
          <div className="relative">
            <div className="flex items-center border border-1 border-white/10 transition duration-200 hover:cursor-pointer rounded-[30px] rounded-lg px-4 py-2 hover:bg-white/[0.08] hover:border-transparent">
              <Search width={20} height={20} className="text-white" />
              <span className="text-white font-medium text-sm ml-2 flex-1">Search</span>
              <span className="flex flex-row items-center leading-none">
                  <span className=""><Command width={16} height={16} className="text-white/30 size-[14px]" /></span>
                  <span className="text-white/30 gpt-text-std font-medium ml-0.5">K</span>
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-1 items-start">
            {navigationItems.map((item) => (
              <NavLink 
                key={item.href} 
                href={item.href} 
                icon={item.icon}
                iconActive={item.iconActive}
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
        <div className="flex flex-col">
          <nav className="p-4 flex flex-col gap-8 overflow-y-auto overflow-x-visible transition-colors duration-200 h-[calc(100vh-300px)] border-t border-white/10">
            <div className="flex flex-col items-start gap-2">
              <div className="px-4 text-sm font-medium leading-9 text-white/80">Library</div>
              {libraryItems.map((item) => (
                <NavLink 
                  key={item.href} 
                  href={item.href} 
                  icon={item.icon}
                  iconActive={item.iconActive}
                >
                  {item.label}
                </NavLink>
              ))}
              <button className="flex h-9 cursor-pointer items-center gap-2 rounded-full px-4 text-sm font-medium text-white hover:bg-white/[0.08]">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14"></path>
                  <path d="M12 5v14"></path>
                </svg>
                <span>New Playlist</span>
              </button>
            </div>
          </nav>
          
          {/* Footer - Sticky at bottom of mobile sidebar */}
          <footer className="mt-auto p-4">
            <div className="bg-[linear-gradient(90deg,rgba(48,7,255,0.29)_0%,rgba(209,40,150,0.27)_60%,rgba(255,86,35,0.25)_100%)] h-1">
              Model v6 Pro is here!
              <div className="">
                Pushing boundaries to the world's best AI music model
              </div>
            </div>
          </footer>
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed flex-col justify-between w-[var(--sidebar-width)] bg-white/[0.03] h-screen shrink-0 z-40">
        <div className="p-4 flex flex-col gap-8">
          <div>
            <Link href="/" className="active:scale-95 transition duration-200">
              <span className="flex items-center gap-2.5">
                <span className="w-8 h-8">
                  <Image src="/assets/images/musicgpt-logo.png" alt="logo" width={32} height={32} />
                </span>
                <span className="gpt-text-sm font-medium text-white text-white">MusicGPT</span>
              </span>
            </Link>
          </div>
          <div className="relative">
            <div className="flex items-center border border-1 border-white/10 transition duration-200 hover:cursor-pointer rounded-[30px] rounded-lg px-4 py-2 hover:bg-white/[0.08] hover:border-transparent">
              <Search width={20} height={20} className="text-white" />
              <span className="text-white font-medium text-sm ml-2 flex-1">Search</span>
              <span className="flex flex-row items-center leading-none">
                  <span className=""><Command width={16} height={16} className="text-white/30 size-[14px]" /></span>
                  <span className="text-white/30 gpt-text-std font-medium ml-0.5">K</span>
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-1 items-start">
            {navigationItems.map((item) => (
              <NavLink 
                key={item.href} 
                href={item.href} 
                icon={item.icon}
                iconActive={item.iconActive}
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
        <div>
          <nav className="p-4 flex flex-col gap-8 overflow-y-auto overflow-x-visible transition-colors duration-200 h-[calc(100vh-250px)] border-t border-white/10">
            <div className="flex flex-col items-start gap-2">
              <div className="px-4 text-sm font-medium leading-9 text-white/80">Library</div>
              {libraryItems.map((item) => (
                <NavLink 
                  key={item.href} 
                  href={item.href} 
                  icon={item.icon}
                  iconActive={item.iconActive}
                >
                  {item.label}
                </NavLink>
              ))}
              <button className="flex h-9 cursor-pointer items-center gap-2 rounded-full px-4 text-sm font-medium text-white hover:bg-white/[0.08]">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14"></path>
                  <path d="M12 5v14"></path>
                </svg>
                <span>New Playlist</span>
              </button>
            </div>
          </nav>
          
          {/* Footer - Sticky at bottom of desktop sidebar */}
          <footer className="mt-auto">
            <div className="bg-[linear-gradient(90deg,rgba(48,7,255,0.29)_0%,rgba(209,40,150,0.27)_60%,rgba(255,86,35,0.25)_100%)] h-1">
              Model v6 Pro is here!
              <div className="">
                Pushing boundaries to the world's best AI music model
              </div>
            </div>
          </footer>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </>
  )
}

