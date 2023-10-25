export const i18n = {
  defaultLocale: 'zh',
  locales: ['zh', 'en'],
  /**
   * 是否跳转默认语言
   * @type {boolean}
   * @default false
   * @example
   * true 如果访问 /xxx 会跳转到 /[defaultLocal]/xxx
   * false 如果访问 /xxx 不会发生跳转，但内容是 /[defaultLocal]/xxx 的内容
   */
  redirectDefaultLocale: false,
}

// export type Locale = (typeof i18n)['locales'][number]

export default i18n
