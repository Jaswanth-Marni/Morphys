import type { NextConfig } from "next";

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  /* config options here */

  // Optimize chunks for better code splitting
  experimental: {
    optimizePackageImports: ['framer-motion', 'lucide-react'],
  },
};

export default withBundleAnalyzer(nextConfig);
