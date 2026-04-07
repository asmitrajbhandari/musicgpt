export interface NavigationItem {
  href: string
  label: string
  icon: string
  iconActive: string
}

export interface FooterItem {
  label: string
  href?: string
}

export const navigationItems: NavigationItem[] = [
  { 
    href: '/', 
    label: 'Home', 
    icon: '/assets/svg/icon-home.svg',
    iconActive: '/assets/svg/icon-home-filled.svg'
  },
  { 
    href: '/create', 
    label: 'Create', 
    icon: '/assets/svg/icon-star.svg',
    iconActive: '/assets/svg/icon-star-filled.svg'
  },
  { 
    href: '/explore', 
    label: 'Explore', 
    icon: '/assets/svg/icon-compass.svg',
    iconActive: '/assets/svg/icon-compass-filled.svg'
  }
]

export const libraryItems: NavigationItem[] = [
  { 
    href: '/asmithrajbhandari', 
    label: 'Profile', 
    icon: '/assets/svg/icon-profile.svg',
    iconActive: '/assets/svg/icon-profile-filled.svg'
  },
  { 
    href: '/liked', 
    label: 'Liked', 
    icon: '/assets/svg/icon-liked.svg',
    iconActive: '/assets/svg/icon-liked-filled.svg'
  }
]

export const footerPrimaryItems: FooterItem[] = [
  { label: 'Pricing', href: '/pricing' },
  { label: 'Affiliate', href: '/affiliate' },
  { label: 'API', href: '/api' },
  { label: 'About', href: '/about' }
]

export const footerSecondaryItems: FooterItem[] = [
  { label: 'Terms', href: '/terms' },
  { label: 'Privacy', href: '/privacy' },
  { label: 'EN' }
]

export function getNavigationItems(): NavigationItem[] {
  return navigationItems
}

export function getLibraryItems(): NavigationItem[] {
  return libraryItems
}

export function getFooterPrimaryItems(): FooterItem[] {
  return footerPrimaryItems
}

export function getFooterSecondaryItems(): FooterItem[] {
  return footerSecondaryItems
}
