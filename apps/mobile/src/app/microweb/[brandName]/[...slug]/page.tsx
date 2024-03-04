import dynamic from 'next/dynamic'
import { notFound } from 'next/navigation'

export default function Page({ params }: { params: { brandName: string, slug: string[] } }) {
  const brandName = params.brandName
  const path = params.slug.join('/').replace('.html', '')

  let DynamicComponent: any = <div></div>
  DynamicComponent = dynamic(() => import(`@kkproject/brand-${brandName}/src/app/${path}/pageMobile.tsx`).catch(() => {
    notFound()
  }))

  return <DynamicComponent />
}
