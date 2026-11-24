import type { NextConfig } from "next";

// A fully static site: `next build` writes plain HTML, CSS and JS to out/, which Vercel serves as is.
// The data lives in public/data and the Dashboard tab's page in public/embed (both written by the study repo's
// `./eval/run_q1_block.sh site`).
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,      // dashboard/index.html, so /dashboard/ works on any static host
  reactStrictMode: true,
  images: { unoptimized: true },
};

export default nextConfig;
