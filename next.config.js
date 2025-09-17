/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'firebasestorage.googleapis.com', 
      'jsbb-kurume.cdn.newt.so',
      'jsbb-kurume.assets.newt.so'
    ],
    unoptimized: true, // 本番環境でも画像最適化を無効化
    formats: ['image/webp', 'image/avif']
  },
  trailingSlash: true,
};

module.exports = nextConfig;