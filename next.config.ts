import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image Docker légère pour le déploiement sur VPS (Coolify).
  output: "standalone",
  experimental: {
    // Le proxy d'authentification (/admin, /api/admin) met le corps des
    // requêtes en mémoire, 10 Mo par défaut : relevé pour les photos (15 Mo max).
    proxyClientMaxBodySize: "16mb",
  },
  images: {
    // Seules ces images locales passent par l'optimiseur (redimensionnement
    // automatique pour téléphones, tablettes et ordinateurs).
    localPatterns: [
      { pathname: "/images/**", search: "" },
      { pathname: "/galerie/photo/**", search: "" },
    ],
  },
};

export default nextConfig;
