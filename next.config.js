/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export', を削除
  images: {
    unoptimized: true,
    domains: ['firebasestorage.googleapis.com']
  },
  trailingSlash: true,
};

module.exports = nextConfig;