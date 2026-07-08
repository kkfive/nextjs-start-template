'use client'
import type { Hitokoto } from '@domain/example/hitokoto'
import { Controller } from '@domain/example/hitokoto'
import { getData } from '@domain/example/hitokoto/const/api'
import { useQuery } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { http } from '@/service/index.base'

export function HitokotoCard({ initialData }: { initialData?: Hitokoto }) {
  const { data, refetch, isFetching } = useQuery<Hitokoto>({
    initialData,
    queryKey: [getData.url],
    queryFn: () =>
      Controller.getData(http, { searchParams: { c: 'a' } }),
    enabled: false,
  })

  return (
    <div className="space-y-6">
      {/* Main Quote Card */}
      <motion.div
        layout
        className="relative overflow-hidden rounded-2xl border border-border/50 bg-card p-8 shadow-sm"
      >
        {/* Decorative quote marks */}
        <div className="absolute top-4 left-6 font-serif text-6xl leading-none text-primary/10 select-none">
          &ldquo;
        </div>

        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={data?.hitokoto || 'empty'}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Quote text */}
              <p className="text-xl leading-relaxed font-medium text-foreground sm:text-2xl">
                {data?.hitokoto || '点击刷新获取一言'}
              </p>

              {/* Source info */}
              {data && (
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                  {data.from_who && (
                    <span className="flex items-center gap-1.5">
                      <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      {data.from_who}
                    </span>
                  )}
                  {data.from && (
                    <span className="flex items-center gap-1.5">
                      <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                      </svg>
                      《
                      {data.from}
                      》
                    </span>
                  )}
                  <span className="rounded-full bg-primary/8 px-2 py-0.5 text-xs font-medium text-primary">
                    {data.type === 'a' ? '动画' : data.type === 'b' ? '漫画' : data.type === 'c' ? '游戏' : data.type === 'd' ? '小说' : '其他'}
                  </span>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom gradient line */}
        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-primary/40 via-accent/30 to-primary/40" />
      </motion.div>

      {/* Refresh Button */}
      <div className="flex justify-center">
        <motion.button
          onClick={() => refetch()}
          disabled={isFetching}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.97 }}
          className="group relative flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md transition-shadow hover:shadow-lg disabled:cursor-wait disabled:opacity-70"
        >
          <svg
            className={`size-4 transition-transform ${isFetching ? 'animate-spin' : 'group-hover:rotate-180'}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
          {isFetching ? '获取中...' : '换一条'}
        </motion.button>
      </div>

      {/* API Info */}
      <div className="rounded-xl bg-muted/30 px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            数据来源: hitokoto.cn
          </span>
          <span className="rounded-full bg-primary/8 px-2 py-0.5 font-mono text-[10px] text-primary">
            GET /api/example/hitokoto
          </span>
        </div>
      </div>
    </div>
  )
}
