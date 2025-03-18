/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
    domains: ['firebasestorage.googleapis.com']
  },
  trailingSlash: true,
};

module.exports = nextConfig;