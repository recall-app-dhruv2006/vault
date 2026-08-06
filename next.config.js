/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: { bodySizeLimit: "25mb" },
    serverComponentsExternalPackages: ["sharp"],
    outputFileTracingIncludes: {
      "/**": ["./node_modules/sharp/**/*", "./node_modules/@img/**/*"],
    },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

module.exports = nextConfig;
