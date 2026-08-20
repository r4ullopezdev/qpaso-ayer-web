import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Usamos <img> con SVG/archivos locales; no necesitamos el optimizador de imágenes.
  images: { unoptimized: true },
  // No tumbar el build de producción por config de ESLint.
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
