import type { Config } from 'tailwindcss'
import iconifyJSONData from '@iconify/json/collections.json'
import { addIconSelectors } from '@iconify/tailwind'

const allIconSets = Object.keys(iconifyJSONData)

export default {
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
    },
  },
  plugins: [
    // refer https://github.com/iconify/icon-sets/tree/master/json
    addIconSelectors(allIconSets),
  ],
} satisfies Config
