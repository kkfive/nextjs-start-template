import type { Config } from 'tailwindcss'
import iconifyJSONData from '@iconify/json/collections.json'
import { addIconSelectors } from '@iconify/tailwind'

const allIconSets = Object.keys(iconifyJSONData)

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './domain/**/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
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
