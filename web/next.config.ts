import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Multiple lockfiles exist above this dir; pin the workspace root to silence
  // Next's inference warning and ensure correct module resolution.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
