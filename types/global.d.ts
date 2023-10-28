import type { EnvModule } from './modules/env'
import type LangModule from './modules/lang'

declare global {

  // 语言模块
  namespace Lang {
    // 语言区域
    export type Locale = LangModule.Locale
    // 多语言字典类型
    export type Dictionary = LangModule.Dictionary
  }
  type Env = EnvModule.Env
}
