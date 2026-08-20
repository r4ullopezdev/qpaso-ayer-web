import { SiteChrome } from "@/components/SiteChrome";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <SiteChrome lang="es">{children}</SiteChrome>;
}
