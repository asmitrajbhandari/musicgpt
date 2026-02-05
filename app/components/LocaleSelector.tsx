'use client'
import { Check, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const locales = [
  { code: 'en', name: 'English', flag: 'fi fi-us' },
  { code: 'es', name: 'Español', flag: 'fi fi-es' },
  { code: 'fr', name: 'Français', flag: 'fi fi-fr' },
  { code: 'de', name: 'Deutsch', flag: 'fi fi-de' },
  { code: 'it', name: 'Italiano', flag: 'fi fi-it' },
]

interface LocaleSelectorProps {
  currentLocale?: string
  onLocaleChange?: (locale: string) => void
}

export default function LocaleSelector({ 
  currentLocale = 'en', 
  onLocaleChange 
}: LocaleSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const currentLocaleData = locales.find(locale => locale.code === currentLocale) || locales[0]

  return (
    <DropdownMenu onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-white/60 transition-colors outline-none focus:outline-none focus:ring-0 focus:border-0">
          <span className={`${currentLocaleData.flag}`}></span>
          <span className="text-xs">{currentLocaleData.code.toUpperCase()}</span>
          {isOpen ? (
            <ChevronUp width={12} height={12} className="text-white/40" />
          ) : (
            <ChevronDown width={12} height={12} className="text-white/40" />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="bg-white/[0.08] backdrop-blur-xl border border-white/20 shadow-2xl"
      >
        {locales.map((locale) => (
          <DropdownMenuItem
            key={locale.code}
            onClick={() => onLocaleChange?.(locale.code)}
            className="flex items-center gap-3 px-3 py-2 text-sm text-white cursor-pointer transition-colors duration-200 border-b border-white/5 last:border-b-0 outline-none focus:outline-none focus:ring-0 focus:border-0"
          >
            <span className={`${locale.flag}`}></span>
            <span className="flex-1">{locale.name}</span>
            <span className="text-xs text-white/40">{locale.code.toUpperCase()}</span>
            {locale.code === currentLocale && (
              <Check width={14} height={14} className="text-white/90" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
