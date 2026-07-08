import { HomePageClient } from '@/components/home/home-page-client'
import { getTechStackFromReadme } from '@/lib/tech-stack'

export default async function HomePage() {
  const techStack = await getTechStackFromReadme()

  return <HomePageClient techStack={techStack} />
}

export const runtime = 'nodejs'
