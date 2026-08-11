import { loadHomePage } from '@/features/home'

export default async function Page() {
  await loadHomePage()
  return null
}
