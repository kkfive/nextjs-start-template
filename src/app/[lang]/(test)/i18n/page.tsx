import Counter from '@/components/counter'
import LocaleSwitcher from '@/components/locale-switcher'
import getDictionary from '@/get-dictionary'

export default async function Page({
  params: { lang },
}: {
  params: { lang: Lang.Locale }
}) {
  const dictionary = await getDictionary(lang)
  return (
    <div>
      <LocaleSwitcher />
      <p>
        Current locale:
        {lang}
      </p>
      <p>
        This text is rendered on the server:
        {dictionary['server-component'].welcome}
      </p>
      <Counter dictionary={dictionary.counter} />
    </div>
  )
}
