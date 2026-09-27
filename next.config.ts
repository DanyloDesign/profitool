import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [{ source: "/", destination: "/ua", permanent: false }];
  },
};

export default nextConfig;
