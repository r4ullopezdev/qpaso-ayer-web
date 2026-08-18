import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Salida "standalone" para desplegar fácil en Azure App Service (Linux/Node).
  output: "standalone",
  // Usamos <img> con SVG/archivos locales; no necesitamos el optimizador de imágenes.
  images: { unoptimized: true },
};

export default nextConfig;
