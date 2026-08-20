import Link from "next/link";
import { langPath, type Lang } from "@/lib/i18n";

export function Logo({ size = 46, lang = "es" }: { size?: number; lang?: Lang }) {
  return (
    <Link href={langPath(lang, "/")} style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/logo.jpg"
        alt="Q'Paso Ayer"
        width={size * 2.2}
        height={size}
        style={{ height: size, width: "auto", borderRadius: 8, display: "block" }}
      />
    </Link>
  );
}
