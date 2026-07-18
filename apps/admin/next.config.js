const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@bharatmart/ui',
    '@bharatmart/utils',
    '@bharatmart/database',
    '@bharatmart/services',
    '@bharatmart/types',
    '@bharatmart/validation',
    '@bharatmart/auth',
  ],
  // Monorepo: include Prisma engines in the serverless bundle.
  outputFileTracingRoot: path.join(__dirname, '../..'),
  outputFileTracingIncludes: {
    '/**': ['./../../packages/database/generated/client/**/*'],
  },
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'i.picsum.photos',
      },
    ],
  },
}

module.exports = nextConfig
