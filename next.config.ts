import type { NextConfig } from "next";

// Host-agnostic static export. Works as-is on Vercel / Cloudflare Pages (root).
// For GitHub Pages under a sub-path, set NEXT_PUBLIC_BASE_PATH="/<repo>" at build time.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
};

export default nextConfig;
