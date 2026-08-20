import { AboutView } from "@/components/pages/AboutView";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "About · Q'Paso Ayer Panama",
  description: "Q'Paso Ayer is where the night begins on Calle Uruguay, Panama City.",
  alternates: { canonical: "/en/nosotros", languages: { es: "/nosotros", en: "/en/nosotros" } },
};

export default function EnAbout() {
  return <AboutView lang="en" />;
}
