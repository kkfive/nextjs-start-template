import { hitokotoApi } from '@/service/hitokoto'

import ClientPage from './page.client'

export default async function RequestPage() {
  const data = await hitokotoApi.getHitokoto({
    cache: 'no-cache',
  })

  return (
    <>
      <ClientPage hitokoto={data.hitokoto} />
    </>
  )
}
