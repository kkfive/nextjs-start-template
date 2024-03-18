'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function NotFount() {
  const router = useRouter()
  return (
    <div>
      <h2>Not Found(goods/[id]/notFound)</h2>
      <div>
        <Link passHref href="">
          <button className="btn" onClick={router.back}>返回</button>
        </Link>
      </div>
    </div>
  )
}
