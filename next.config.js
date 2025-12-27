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
};

module.exports = nextConfig;
