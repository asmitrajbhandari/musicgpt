'use client'
import Link from 'next/link'
import { useState } from 'react'
import { getFooterPrimaryItems, getFooterSecondaryItems } from '../utils/navigation'
import { GPT_CONSTANTS } from '../utils/gptConstants'
import LocaleSelector from './LocaleSelector'

export default function Footer() {
  const footerPrimaryItems = getFooterPrimaryItems()
  const footerSecondaryItems = getFooterSecondaryItems()
  const [currentLocale, setCurrentLocale] = useState('en')

  const handleLocaleChange = (locale: string) => {
    console.log('Locale changed to:', locale)
    setCurrentLocale(locale)
    // TODO: Implement locale change logic
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-col gap-1 px-3 py-2 rounded-[12px] bg-[linear-gradient(90deg,rgba(48,7,255,0.29)_0%,rgba(209,40,150,0.27)_60%,rgba(255,86,35,0.25)_100%)]">
        <div className="text-xs font-medium">{GPT_CONSTANTS.FOOTER.TITLE}</div>
        <div className="text-xs text-white/60">{GPT_CONSTANTS.FOOTER.DESCRIPTION}</div>
      </div>

      <div className="mt-3 flex flex-row items-center gap-2.5">
        {footerPrimaryItems.map((item) => (
          <Link key={item.label} href={item.href || '#'} className="text-xs text-white/60 hover:text-white/80 transition-colors">
            {item.label}
          </Link>
        ))}
      </div>
      <div className="mt-1 flex flex-row items-center gap-2.5">
        {footerSecondaryItems.filter(item => item.label !== 'EN').map((item) => (
          <Link key={item.label} href={item.href || '#'} className="text-xs text-white/60 hover:text-white/80 transition-colors">
            {item.label}
          </Link>
        ))}
        <LocaleSelector currentLocale={currentLocale} onLocaleChange={handleLocaleChange} />
      </div>
    </div>
  )
}
