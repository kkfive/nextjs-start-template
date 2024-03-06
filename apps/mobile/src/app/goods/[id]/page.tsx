import Link from 'next/link'
import { path } from '@kkproject/business'
import CommonIdAction from '@/components/CommonIdAction'

export default function Page() {
  return (
    <>
      <div>
        <Link href={path.GOODS_PATH('16799')}>
          <button className="btn mr-4">
            SKII
          </button>
        </Link>
        <Link href={path.GOODS_PATH('19953')}>
          <button className="btn mr-4">
            default
          </button>
        </Link>
        <Link href={path.GOODS_PATH('1')}>
          <button className="btn mr-4">
            404
          </button>
        </Link>
      </div>

      <div className="mt-4">
        <CommonIdAction />
      </div>
    </>
  )
}
