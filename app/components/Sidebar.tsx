"use client"
import { Search, Command, PanelLeft, SquareArrowLeft, Plus } from 'lucide-react'
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

  // Reusable Sidebar Content Component
  const SidebarContent = ({ isMobile = false }) => (
    <>
      <div className={`${isMobile ? 'flex flex-col gap-8 px-5 pb-4 pt-24' : 'p-4 flex flex-col gap-8'}`}>
        {!isMobile && (
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
        )}
        <div className={`${isMobile ? '' : 'relative'}`}>
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
              <Plus width={20} height={20} />
              <span>New Playlist</span>
            </button>
          </div>
        </nav>
        
        {/* Footer - Sticky at bottom of sidebar */}
        <footer className="mt-auto p-4">
          <div className="bg-[linear-gradient(90deg,rgba(48,7,255,0.29)_0%,rgba(209,40,150,0.27)_60%,rgba(255,86,35,0.25)_100%)] h-1">
            Model v6 Pro is here!
            <div className="">
              Pushing boundaries to the world's best AI music model
            </div>
          </div>
        </footer>
      </div>
    </>
  )

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
              <SquareArrowLeft width={20} height={20} className="text-white" />
            ) : (
              <PanelLeft width={20} height={20} className="text-white" />
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
        <SidebarContent isMobile={true} />
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed flex-col justify-between w-[var(--sidebar-width)] bg-white/[0.03] h-screen shrink-0 z-40">
        <SidebarContent isMobile={false} />
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

