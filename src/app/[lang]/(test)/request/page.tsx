import ClientPage from '@components/page-client'

import hitokotoApi from '@/service/hitokoto'

export default async function Page() {
  const data = await hitokotoApi.getHitokoto()

  return (
    <>
      <ClientPage hitokoto={data.hitokoto || ''} />
    </>
  )
}
