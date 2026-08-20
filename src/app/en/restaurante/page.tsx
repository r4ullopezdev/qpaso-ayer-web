import { MenuView } from "@/components/pages/MenuView";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Menu · Q'Paso Ayer Panama",
  description: "The full menu at Q'Paso Ayer, Calle Uruguay, Panama City: wings, burgers, ceviches, cocktails and more.",
  alternates: { canonical: "/en/restaurante", languages: { es: "/restaurante", en: "/en/restaurante" } },
};

export default function EnMenu() {
  return <MenuView lang="en" />;
}
