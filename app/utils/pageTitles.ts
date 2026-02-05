/**
 * Generates page titles based on the current pathname.
 * 
 * Maps route paths to user-friendly browser tab titles that include
 * the MusicGPT branding for consistent user experience and SEO.
 * 
 * @since 1.0.0
 */
export const getPageTitle = (pathname: string): string => {
  // Remove leading slash and split by segments
  const segments = pathname.split('/').filter(Boolean)
  
  if (segments.length === 0) return 'MusicGPT'
  
  // Handle different routes
  switch (segments[0]) {
    case 'create':
      return 'Create - MusicGPT'
    case 'explore':
      return 'Explore - MusicGPT'
    case 'liked':
      return 'Liked Songs - MusicGPT'
    default:
      // Handle dynamic username routes
      if (segments[0].startsWith('@')) {
        return `${segments[0]} - MusicGPT`
      }
      return 'MusicGPT'
  }
}
