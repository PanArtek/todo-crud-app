/** @type {import('next').NextConfig} */
const nextConfig = {
  // Eksperymentalne opcje dla App Router
  experimental: {
    // Włącz Server Actions
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  // Obrazki z zewnętrznych źródeł (loga drużyn)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  // Windows: fix dla hot reload i cache
  webpack: (config) => {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    };
    return config;
  },
};

module.exports = nextConfig;
