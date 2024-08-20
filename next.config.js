/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: true,
    instrumentationHook: true,
  },
  generateBuildId: async () => {
    return process.env.VERSION || (Date.now() + Math.round(Math.random() * 2441139)).toString();
  }
};

module.exports = nextConfig;
