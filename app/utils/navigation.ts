export interface NavigationItem {
  href: string
  label: string
  icon: string
  iconActive: string
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

export function getNavigationItems(): NavigationItem[] {
  return navigationItems
}

export function getLibraryItems(): NavigationItem[] {
  return libraryItems
}
