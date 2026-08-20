import { SiteChrome } from "@/components/SiteChrome";

export default function EnLayout({ children }: { children: React.ReactNode }) {
  return <SiteChrome lang="en">{children}</SiteChrome>;
}
