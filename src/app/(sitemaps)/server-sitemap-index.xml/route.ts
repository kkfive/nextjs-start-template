import { getServerSideSitemapIndex } from 'next-sitemap'

import { getEnv } from '@/utils'

export async function GET(_request: Request) {
  const { NEXT_PUBLIC_SITE_URL } = getEnv()

  // Method to source urls from cms
  // const urls = await fetch('https//example.com/api')
  const sitemapIndex = [].map((path) => {
    // 判断path是否是完整的url
    if (/^https?:\/\//.test(path))
      return path
    return `${NEXT_PUBLIC_SITE_URL}/sitemap/${path}`
  })

  return getServerSideSitemapIndex(sitemapIndex)
}
