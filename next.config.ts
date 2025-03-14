import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    FIRECRAWL_API_KEY: process.env.FIRECRAWL_API_KEY,
  },
};

export default nextConfig;
