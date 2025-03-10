import type { NextConfig } from "next";


const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack(config, { isServer }) {
    if (!isServer) {
      config.cache = {
        type: 'filesystem',
      };
    }
    return config;
  },

};

export default nextConfig;
