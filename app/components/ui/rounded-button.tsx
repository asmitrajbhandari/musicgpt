import Image from 'next/image'

interface RoundedButtonProps {
  icon: string
  alt: string
  text: string
  iconOpacity?: number
  className?: string
  isActive?: boolean
  activeIcon?: string
  onClick?: () => void
}

export default function RoundedButton({ 
  icon, 
  alt, 
  text, 
  iconOpacity = 60,
  className = '',
  isActive = false,
  activeIcon,
  onClick 
}: RoundedButtonProps) {
  const iconClass = isActive ? 'opacity-100' : `opacity-${iconOpacity}`
  const buttonClass = isActive 
    ? 'flex flex-row items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white hover:bg-white/15 transition-all duration-200 active:scale-95'
    : 'flex flex-row items-center gap-2 px-4 py-2 rounded-full bg-transparent border border-[#3a3e42] hover:bg-[rgb(58,62,66)] transition-all duration-200 active:scale-95'
  const textClass = isActive ? 'text-white text-sm font-semibold' : `text-white text-sm ${className}`
  const iconSrc = isActive && activeIcon ? activeIcon : icon
  
  return (
    <button 
      className={buttonClass}
      onClick={onClick}
    >
      <Image
        src={iconSrc}
        alt={alt}
        width={20}
        height={20}
        className={iconClass}
      />
      <span className={textClass}>{text}</span>
    </button>
  )
}
