import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  outputFileTracingRoot: process.cwd(),
  // Le build est exécuté dans un environnement à mémoire limitée :
  // un seul worker de génération statique et une compilation webpack
  // économe évitent les dépassements mémoire.
  // La vérification TypeScript est lancée séparément par `npm run build`
  // (`tsc --noEmit`) avant Next.js : le worker de vérification intégré manque
  // de mémoire dans cet environnement.
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    cpus: 1,
    webpackBuildWorker: false,
    webpackMemoryOptimizations: true,
  },
  webpack: (config, { dev }) => {
    // En développement, le cache webpack est décompressé en mémoire au
    // démarrage. Le désactiver évite les erreurs d'allocation sur les
    // machines à mémoire limitée.
    if (dev) {
      config.cache = false;
    }
    return config;
  },
  turbopack: {
    root: process.cwd(),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
