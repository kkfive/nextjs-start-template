import { hitokotoApi } from '@/service/hitokoto'

import ClientPage from './page.client'

export default async function SWRPage() {
  const data = await hitokotoApi.getHitokoto()

  return (
    <>
      <ClientPage hitokoto={data.hitokoto} />
    </>
  )
}
