import Link from "next/link";

export function Logo({ size = 46 }: { size?: number }) {
  return (
    <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/logo.jpg"
        alt="Q'Paso Ayer"
        width={size * 2.2}
        height={size}
        style={{
          height: size,
          width: "auto",
          borderRadius: 8,
          display: "block",
        }}
      />
    </Link>
  );
}
