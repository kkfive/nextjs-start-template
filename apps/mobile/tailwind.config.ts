import type { Config } from 'tailwindcss'
import { addDynamicIconSelectors } from '@iconify/tailwind'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      space: {
        99: '24.75rem',

      },
      width: {
        99: '24.75rem',
      },
    },
  },
  plugins: [
    addDynamicIconSelectors(),
  ],

}
export default config
