import { ClientPage } from './page.client'
import { hitokotoApi } from '@/api/hitokoto'

export default async function SWRPage() {
  const data = await hitokotoApi.getHitokoto()

  return (
    <>
      <ClientPage hitokoto={data.hitokoto} />
    </>
  )
}
