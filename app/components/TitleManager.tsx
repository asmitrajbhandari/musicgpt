'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { getPageTitle } from '../utils/pageTitles'

/**
 * TitleManager Component
 * 
 * Dynamically updates the browser tab title based on the current route.
 * Provides contextual page titles that enhance user experience and SEO.
 * Automatically detects route changes and updates the document title accordingly.
 * @since 1.0.0
 */

export default function TitleManager() {
  const pathname = usePathname()

  useEffect(() => {
    const title = getPageTitle(pathname)
    document.title = title
  }, [pathname])

  return null
}
