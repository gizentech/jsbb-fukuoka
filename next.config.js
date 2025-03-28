/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'firebasestorage.googleapis.com', 
      'jsbb-kurume.cdn.newt.so',
      'jsbb-kurume.assets.newt.so'
    ],
    unoptimized: process.env.NODE_ENV === 'development'
  },
  trailingSlash: true,
};

module.exports = nextConfig;