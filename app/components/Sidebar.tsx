"use client"
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
      {/* Mobile Sidebar */}
      <aside className={`
        lg:hidden fixed flex-col justify-between w-[300px] bg-white/[0.03] h-screen shrink-0 z-40 transition-transform duration-300 backdrop-blur-[30px]
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-4 flex flex-col gap-8 pt-20">
          <header className="mobile-header fixed top-0 left-0 right-0 bg-white/[0.03] backdrop-blur-[30px] p-4 z-10">
            <Link href="/" className="active:scale-95 transition duration-200">
              <span className="flex items-center gap-2.5">
                <span className="w-8 h-8">
                  <Image src="/assets/images/musicgpt-logo.png" alt="logo" width={32} height={32} />
                </span>
                <span className="logo-text font-medium text-white text-white">MusicGPT</span>
              </span>
            </Link>
          </header>
          <div className="">
            <div className="flex items-center border border-1 border-white/10 transition duration-200 hover:cursor-pointer rounded-[30px] rounded-lg px-4 py-2 hover:bg-white/[0.08] hover:border-transparent">
              <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.8333 15.8334L12.2083 12.2084M14.1667 7.50004C14.1667 11.182 11.1819 14.1667 7.49999 14.1667C3.81809 14.1667 0.833328 11.182 0.833328 7.50004C0.833328 3.81814 3.81809 0.833374 7.49999 0.833374C11.1819 0.833374 14.1667 3.81814 14.1667 7.50004Z" stroke="#E4E6E8" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span className="text-white font-medium text-sm ml-2 flex-1">Search</span>
              <span className="text-white/60 text-sm font-medium ml-2">K</span>
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
          <nav className="p-4 flex flex-col gap-8 overflow-y-auto overflow-x-visible transition-colors duration-200 h-[calc(100vh-200px)] border-t border-white/10">
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
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col justify-between w-[var(--sidebar-width)] bg-white/[0.03] h-screen shrink-0 z-40">
        <div className="p-4 flex flex-col gap-8">
          <header className="desktop-header">
            <Link href="/" className="active:scale-95 transition duration-200">
              <span className="flex items-center gap-2.5">
                <span className="w-8 h-8">
                  <Image src="/assets/images/musicgpt-logo.png" alt="logo" width={32} height={32} />
                </span>
                <span className="logo-text font-medium text-white text-white">MusicGPT</span>
              </span>
            </Link>
          </header>
          <div className="relative">
            <div className="flex items-center border border-1 border-white/10 transition duration-200 hover:cursor-pointer rounded-[30px] rounded-lg px-4 py-2 hover:bg-white/[0.08] hover:border-transparent">
              <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.8333 15.8334L12.2083 12.2084M14.1667 7.50004C14.1667 11.182 11.1819 14.1667 7.49999 14.1667C3.81809 14.1667 0.833328 11.182 0.833328 7.50004C0.833328 3.81814 3.81809 0.833374 7.49999 0.833374C11.1819 0.833374 14.1667 3.81814 14.1667 7.50004Z" stroke="#E4E6E8" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span className="text-white font-medium text-sm ml-2 flex-1">Search</span>
              <span className="text-white/60 text-sm font-medium ml-2">K</span>
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
          <nav className="p-4 flex flex-col gap-8 overflow-y-auto overflow-x-visible transition-colors duration-200 h-[calc(100vh-200px)] border-t border-white/10">
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
        </div>
      </aside>

      {/* Mobile Toggle Button */}
      <button 
        className="lg:hidden fixed top-4 left-4 z-[60] p-2 bg-white/[0.1] rounded-lg hover:bg-white/[0.2] transition-colors"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12h18M3 6h18M3 18h18"/>
        </svg>
      </button>

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
