import type { Config } from 'tailwindcss'
import { addIconSelectors } from '@iconify/tailwind'

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
    addIconSelectors(['mdi', 'eos-icons']),
  ],
} satisfies Config
