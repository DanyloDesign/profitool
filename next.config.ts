import type { NextConfig } from "next";

// GITHUB_PAGES=true собирает статический сайт под https://danylodesign.github.io/profitool/.
// Без флага (dev, обычный сервер) конфиг прежний.
const pages = process.env.GITHUB_PAGES === "true";
const basePath = pages ? "/profitool" : "";

const nextConfig: NextConfig = pages
  ? {
      output: "export",
      basePath,
      trailingSlash: true,
      images: { unoptimized: true },
      env: { NEXT_PUBLIC_BASE_PATH: basePath },
    }
  : {
      async redirects() {
        return [{ source: "/", destination: "/ua", permanent: false }];
      },
    };

export default nextConfig;
