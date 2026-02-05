'use client'
import { Search, Command, Plus, PanelLeft, SquareArrowLeft, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import Profile from './Profile'
import { getNavigationItems, getLibraryItems } from '../utils/navigation'
import { GPT_CONSTANTS } from '../utils/gptConstants'
import Footer from './Footer'

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
        href={href} 
        className={`flex items-center gap-3 rounded-full px-3 py-2 text-sm font-medium transition-all duration-200 ${
          isActive 
            ? 'text-white bg-white/10' 
            : 'text-white/60 hover:text-white hover:bg-white/[0.05]'
        }`}
      >
        <Image 
          src={isActive ? iconActive : icon} 
          alt={typeof children === 'string' ? children : ''} 
          width={GPT_CONSTANTS.SVG.MD.width} 
          height={GPT_CONSTANTS.SVG.MD.height} 
        />
        {children}
      </Link>
    )
  }

  // Reusable Sidebar Content Component
  const SidebarContent = ({ isMobile = false }) => {
    const renderTopSection = () => (
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
          <div className="flex items-center border border-1 border-white/10 transition duration-200 hover:cursor-pointer rounded-[30px] px-4 py-2 hover:bg-white/[0.08] hover:border-transparent">
            <Search width={GPT_CONSTANTS.SVG.MD.width} height={GPT_CONSTANTS.SVG.MD.height} className="text-white" />
            <span className="text-white font-medium text-sm ml-2 flex-1">Search</span>
            <span className="flex flex-row items-center leading-none">
                <span className=""><Command width={GPT_CONSTANTS.SVG.SM.width} height={GPT_CONSTANTS.SVG.SM.height} className="text-white/30 size-[14px]" /></span>
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
    )

    const renderBottomSection = () => (
      <div className="flex flex-col h-screen overflow-hidden">
        <ScrollArea className="p-4 flex flex-col flex-1 gap-8">
          <div className="flex flex-col gap-2">
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
              <Plus width={GPT_CONSTANTS.SVG.MD.width} height={GPT_CONSTANTS.SVG.MD.height} />
              <span>New Playlist</span>
            </button>
          </div>
        </ScrollArea>
        
        {/* Footer - Sticky at bottom of sidebar */}
        <footer className="flex-shrink-0 p-4">
          <Footer />
        </footer>
      </div>
    )

    return (
      <div className={`flex flex-col ${isMobile ? 'justify-between h-screen' : 'h-screen'}`}>
        {renderTopSection()}
        {renderBottomSection()}
      </div>
    )
  }

  const navigationItems = getNavigationItems()
  const libraryItems = getLibraryItems()

  return (
    <>
      {/* Floating Profile Button */}
      <div className="fixed top-5 right-5 z-[70]">
        <Profile />
      </div>

      {/* Mobile Header with Sidebar */}
      <header className="lg:hidden">
        <div className="fixed top-0 left-0 right-0 z-[60] flex flex-row items-center gap-3 p-5">
          <button 
            className="box-border size-10 rounded-[12px] border-1 border-neutral-500 bg-white/[0.08] text-white backdrop-blur-attachmentActive hover:bg-white/[0.16] inline-flex items-center justify-center transition-[background-color] duration-200"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? (
              <SquareArrowLeft width={GPT_CONSTANTS.SVG.MD.width} height={GPT_CONSTANTS.SVG.MD.height} className="text-white" />
            ) : (
              <PanelLeft width={GPT_CONSTANTS.SVG.MD.width} height={GPT_CONSTANTS.SVG.MD.height} className="text-white" />
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
        lg:hidden fixed flex-col w-[300px] bg-white/[0.05] h-screen shrink-0 z-40 transition-transform duration-300 backdrop-blur-[40px]
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

