import path from 'node:path'
import { addDynamicIconSelectors } from '@iconify/tailwind'

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    // './node_modules/@kkproject/brand-default/**/*.{js,ts,jsx,tsx,mdx}',
    path.join(path.dirname(require.resolve('@kkproject/components')), '**/*.{js,ts,jsx,tsx,mdx}'),
    path.join(path.dirname(require.resolve('@kkproject/brand-skii')), '**/*.{js,ts,jsx,tsx,mdx}'),
    path.join(path.dirname(require.resolve('@kkproject/brand-default')), '**/*.{js,ts,jsx,tsx,mdx}'),
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--kp-primary-color)',
      },
    },
  },
  extend: {},
  plugins: [
    addDynamicIconSelectors(),
  ],

}

export default config
