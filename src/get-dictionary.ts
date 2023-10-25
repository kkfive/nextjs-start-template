import 'server-only'

import { i18n } from '@/i18n-config'

const dictionaries: {
  [locale in Lang.Locale]: () => Promise<Lang.Dictionary>
} = {}
i18n.locales.forEach((locale) => {
  dictionaries[locale] = async () => {
    const { default: dictionary } = await import(`@/dictionaries/${locale}.ts`)
    return dictionary
  }
})

export default async function getDictionary(locale: Lang.Locale): Promise<Lang.Dictionary> {
  return dictionaries[locale]?.() ?? await dictionaries.zh()
}
