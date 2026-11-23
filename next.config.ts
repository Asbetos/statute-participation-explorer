import type { NextConfig } from "next";

// A fully static site: `next build` writes plain HTML, CSS and JS to out/, which Vercel serves as is.
// The data lives in public/data (written by the study's eval/reasoning_viewer.py --export).
const nextConfig: NextConfig = {
  output: "export",
  reactStrictMode: true,
  images: { unoptimized: true },
};

export default nextConfig;
