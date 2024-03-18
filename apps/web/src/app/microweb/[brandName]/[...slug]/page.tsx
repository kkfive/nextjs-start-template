import dynamic from 'next/dynamic'
import { notFound } from 'next/navigation'

export default function Page({ params }: { params: { brandName: string, slug: string[] } }) {
  const brandName = params.brandName
  const path = params.slug.join('/').replace('.html', '')

  const DynamicComponent = dynamic(() => import(`@kkproject/brand-${brandName}/web/app/${path}/page.tsx`).catch(() => {
    notFound()
  }))

  return <DynamicComponent />
}
