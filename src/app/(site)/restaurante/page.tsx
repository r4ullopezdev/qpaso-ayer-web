import { MenuView } from "@/components/pages/MenuView";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Restaurante · Q'Paso Ayer",
  alternates: { canonical: "/restaurante", languages: { es: "/restaurante", en: "/en/restaurante" } },
};

export default function RestaurantePage() {
  return <MenuView lang="es" />;
}
