import { HomeView } from "@/components/pages/HomeView";

export const dynamic = "force-dynamic";
export const metadata = {
  alternates: { canonical: "/", languages: { es: "/", en: "/en" } },
};

export default function Home() {
  return <HomeView lang="es" />;
}
