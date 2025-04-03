import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/corolla-hybrid-inventory-browser',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
