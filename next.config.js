/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { domains: [] },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false, net: false, tls: false, crypto: false,
        stream: false, url: false, zlib: false, http: false,
        https: false, assert: false, os: false, path: false,
      }
    }
    config.externals.push('pino-pretty', 'lokijs', 'encoding', '@react-native-async-storage/async-storage')
    return config
  },
}
module.exports = nextConfig