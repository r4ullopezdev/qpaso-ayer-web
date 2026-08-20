import { HomeView } from "@/components/pages/HomeView";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Q'Paso Ayer · Nightlife on Calle Uruguay, Panama City",
  description: "Where the night begins in Panama. Events, parties, dinner and games on Calle Uruguay. Join the free guest list.",
  alternates: { canonical: "/en", languages: { es: "/", en: "/en" } },
};

export default function EnHome() {
  return <HomeView lang="en" />;
}
