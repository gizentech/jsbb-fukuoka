/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export' を削除
  images: {
    // unoptimized: true を削除
    domains: [
      'firebasestorage.googleapis.com', 
      'jsbb-kurume.cdn.newt.so',
      'jsbb-kurume.assets.newt.so'  // この行を追加
    ]
  },
  trailingSlash: true,
};

module.exports = nextConfig;