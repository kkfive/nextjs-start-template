import 'server-only'

import type { Locale } from '@/i18n-config'
import { i18n } from '@/i18n-config'

// eslint-disable-next-line ts/ban-ts-comment
// @ts-expect-error
const dictionaries: {
  [locale in Locale]: () => Promise<Dictionary>
} = {}
i18n.locales.forEach((locale) => {
  dictionaries[locale] = async () => {
    const { default: dictionary } = await import(`@/dictionaries/${locale}.ts`)
    return dictionary
  }
})

export default async function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]?.() ?? await dictionaries.zh()
}
