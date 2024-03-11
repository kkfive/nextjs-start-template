'use client'
import Link from 'next/link'
import { path } from '@kkproject/business'
import { Button } from 'antd-mobile'
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
      <div>

        <Button>123</Button>
      </div>
      <div className="flex justify-center">
        <button className="h-[92px] w-[680px] rounded-lg bg-[#0B56A4]">登录</button>
      </div>
    </>
  )
}
