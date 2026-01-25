import { getTechStackFromReadme } from '@/lib/tech-stack'
import { HomePageClient } from './home-page-client'

export default async function HomePage() {
  const techStack = await getTechStackFromReadme()

  return <HomePageClient techStack={techStack} />
}

export const runtime = 'nodejs'
