import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image Docker légère pour le déploiement sur VPS (Coolify).
  output: "standalone",
};

export default nextConfig;
