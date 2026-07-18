import type { Config } from 'tailwindcss'
import baseConfig from '@bharatmart/ui/tailwind.config'

const config: Config = {
  ...baseConfig,
  content: [
    './src/**/*.{ts,tsx}',
    // Include shared UI package so Tailwind does not purge its classes
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  theme: {
    ...baseConfig.theme,
    extend: {
      ...baseConfig.theme?.extend,
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        heading: ['var(--font-montserrat)', 'Montserrat', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
}

export default config
