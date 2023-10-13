import { getIconCollections, iconsPlugin } from '@egoist/tailwindcss-icons'
import { nextui } from '@nextui-org/react'
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'linear-blue': 'linear-gradient(45deg, #0ecffe 50%, #07a6f1)',
      },
    },
  },
  plugins: [
    nextui(),
    iconsPlugin({
      // Select the icon collections you want to use
      collections: getIconCollections(['mdi', 'lucide']),
    }),
  ],
  darkMode: 'class',
}
export default config
