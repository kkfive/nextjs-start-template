import transformerAttributifyJsx from '@unocss/transformer-attributify-jsx'
import transformerCompileClass from '@unocss/transformer-compile-class'
import transformerDirectives from '@unocss/transformer-directives'
import transformerVariantGroup from '@unocss/transformer-variant-group'
import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetUno,
  presetWebFonts,
} from 'unocss'
import { presetExtra } from 'unocss-preset-extra'
import { presetScrollbar } from 'unocss-preset-scrollbar'
import { presetScrollbarHide } from 'unocss-preset-scrollbar-hide'

export default defineConfig({
  content: {
    pipeline: {
      include: [/src\/.*\.(s?css|tsx?)$/],
      exclude: [],
    },
  },
  presets: [
    presetUno({
      dark: 'media',
    }),
    presetAttributify(),
    presetWebFonts({
      provider: 'google',
      fonts: {
        sans: 'Roboto',
      },
    }),
    presetIcons({
      cdn: 'https://esm.sh/',
      extraProperties: {
        'display': 'inline-block',
        'vertical-align': 'middle',
      },
    }),
    /** @url https://github.com/MoomFE/unocss-preset-extra */
    presetExtra(),
    /** @url https://github.com/unpreset/unocss-preset-scrollbar */
    presetScrollbar({
      // config
    }),
    /** @url https://github.com/reslear/unocss-preset-scrollbar-hide */
    presetScrollbarHide(),
  ],
  transformers: [
    transformerCompileClass(),
    transformerDirectives({
      enforce: 'pre',
    }),
    transformerVariantGroup(),
    transformerAttributifyJsx(),
  ],
  shortcuts: [
    ['card', 'rounded-3xl px-8 py-4 border border-[var(--card-border-color)] bg-[var(--card-bg-color)] shadow-[var(--shadow-border)]'],
    ['btn', 'px-4 py-1 rounded inline-block bg-teal-600 text-white cursor-pointer hover:bg-teal-700 disabled:cursor-default disabled:bg-gray-600 disabled:opacity-50'],
    ['icon-btn', 'inline-block cursor-pointer select-none opacity-75 transition duration-200 ease-in-out hover:opacity-100 hover:text-teal-600'],
  ],
  rules: [
    ['author', { 'font-family': 'myfont' }],
    [/^line-clamp-(\d+)$/, ([, d]) => {
      if (d === '1') {
        return {
          'white-space': 'nowrap',
          'text-overflow': 'ellipsis',
          'overflow': 'hidden',
        }
      }
      else {
        return {
          '-webkit-line-clamp': d,
          'overflow': 'hidden',
          'text-overflow': 'ellipsis',
          'display': '-webkit-box!important',
          '-webkit-box-orient': 'vertical',
        }
      }
    }],
  ],
  theme: {
    colors: {
      'blue': '#425AEF',
      'red': '#f04a63',
      'pink': '#FF7C7C',
      'green': '#57bd6a',
      'yellow': '#c28b00',
      'yellow-op': '#d99c001a',
      'orange': '#e38100',
      'white': '#fff',
    },
  },
})
