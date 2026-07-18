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
