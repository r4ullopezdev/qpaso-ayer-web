import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AiOrb } from "@/components/AiOrb";
import { getSettings } from "@/lib/settings";
import type { Lang } from "@/lib/i18n";

export async function SiteChrome({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  const settings = await getSettings();
  return (
    <>
      <Header settings={settings} lang={lang} />
      <main>{children}</main>
      <Footer settings={settings} lang={lang} />
      <AiOrb lang={lang} />
    </>
  );
}
