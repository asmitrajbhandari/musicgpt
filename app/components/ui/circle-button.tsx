import Image from 'next/image'

interface CircleButtonProps {
  icon: string
  alt: string
  iconOpacity?: number
  onClick?: () => void
}

export default function CircleButton({ icon, alt, iconOpacity = 60, onClick }: CircleButtonProps) {
  const iconClass = `opacity-${iconOpacity}`
  
  return (
    <button 
      className="w-10 h-10 rounded-full bg-transparent border border-[#3a3e42] flex items-center justify-center hover:bg-[rgb(58,62,66)] transition-all duration-200 active:scale-90"
      onClick={onClick}
    >
      <Image
        src={icon}
        alt={alt}
        width={20}
        height={20}
        className={iconClass}
      />
    </button>
  )
}
