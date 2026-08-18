import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AiOrb } from "@/components/AiOrb";
import { getSettings } from "@/lib/settings";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();
  return (
    <>
      <Header settings={settings} />
      <main>{children}</main>
      <Footer settings={settings} />
      <AiOrb />
    </>
  );
}
