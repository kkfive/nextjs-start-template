import type i18n from '@/i18n-config'

export type Locale = (typeof i18n)['locales'][number]
export interface Dictionary {
  /** 服务端模块 */
  'server-component': {
    /** 欢迎词 */
    welcome: string
  }
  /** 计数器模块 */
  'counter': {
    /** 增加 */
    increment: string
    /** 减少 */
    decrement: string
  }
}
