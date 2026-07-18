import type { Config } from 'tailwindcss'
import baseConfig from '@bharatmart/ui/tailwind.config'

const config: Config = {
  ...baseConfig,
  content: [
    './src/**/*.{ts,tsx}',
    // Include shared UI package so Tailwind does not purge its classes
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
}

export default config
