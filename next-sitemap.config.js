import i18n from './src/i18n-config.js'

// eslint-disable-next-line node/prefer-global/process
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL

const alternateRefsList = i18n.locales.map((locale) => {
  return {
    href: `${siteUrl}/${locale}`,
    hreflang: locale,
  }
})

/**
 * @type {import('next-sitemap').IConfig}
 * @see https://github.com/iamvishnusankar/next-sitemap#readme
 */
export default {
  siteUrl,
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [{ userAgent: '*', allow: '/' }],
    additionalSitemaps: [
      `${siteUrl}/server-sitemap-index.xml`, // <==== Add here
      `${siteUrl}/server-sitemap.xml`, // <==== Add here
    ],
  },
  alternateRefs: alternateRefsList,
  transform: async (config, path) => {
    if (!path.includes('/ /'))
      return null
    path = path.replace('/ /', '/')
    return {
      loc: path,
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
      alternateRefs: config.alternateRefs ?? [],
    }
  },
}
