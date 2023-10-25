'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { i18n } from '@/i18n-config'

function LocaleSwitcher() {
  const pathName = usePathname()
  const redirectedPathName = (locale: string) => {
    if (!pathName)
      return '/'

    const segments = pathName.split('/')
    const [currentLocale] = segments

    if (i18n.locales.includes(segments[1] as Lang.Locale))
      segments[1] = locale
    else if (locale !== i18n.defaultLocale && currentLocale !== locale)
      segments[0] = locale

    return segments.join('/')
  }

  return (
    <div>
      <p>Locale switcher:</p>
      <ul>
        {i18n.locales.map((locale) => {
          return (
            <li key={locale}>
              <Link href={redirectedPathName(locale)}>{locale}</Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
export default LocaleSwitcher
