import { AboutView } from "@/components/pages/AboutView";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Sobre nosotros · Q'Paso Ayer",
  description: "Q'Paso Ayer es el punto donde empieza la noche en Calle Uruguay, Panamá.",
  alternates: { canonical: "/nosotros", languages: { es: "/nosotros", en: "/en/nosotros" } },
};

export default function NosotrosPage() {
  return <AboutView lang="es" />;
}
