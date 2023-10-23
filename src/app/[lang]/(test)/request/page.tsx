import ClientPage from '@components/page-client'

import hitokotoApi from '@/service/hitokoto'

export default async function Page() {
  const data = await hitokotoApi.getHitokoto({
    cache: 'no-cache',
  })

  return (
    <>
      <ClientPage hitokoto={data.hitokoto || ''} />
    </>
  )
}
