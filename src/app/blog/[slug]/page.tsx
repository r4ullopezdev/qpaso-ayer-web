import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllArticles, getArticle } from "@/lib/blog";

export function generateStaticParams() {
  return getAllArticles().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const a = getArticle(slug);
  if (!a) return {};
  return {
    title: `${a.title} | Q'Paso Ayer`,
    description: a.description,
    keywords: a.keyword,
    alternates: { canonical: `/blog/${a.slug}` },
    openGraph: {
      title: a.title,
      description: a.description,
      type: "article",
      locale: a.lang === "es" ? "es_PA" : "en_US",
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const a = getArticle(slug);
  if (!a) notFound();

  const related = a.related.map(getArticle).filter(Boolean);
  const ctaText = a.lang === "es" ? "Ver eventos y apuntarme gratis" : "See events and join free";
  const relTitle = a.lang === "es" ? "Sigue leyendo" : "Keep reading";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.h1,
    description: a.description,
    inLanguage: a.lang,
    about: a.keyword,
    author: { "@type": "Organization", name: "Q'Paso Ayer" },
    publisher: { "@type": "Organization", name: "Q'Paso Ayer" },
  };
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: a.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <article className="container-x section" style={{ maxWidth: 760 }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      <div className="chip">{a.lang === "es" ? "Guía" : "Guide"} · {a.cluster}</div>
      <h1 className="font-display" style={{ fontSize: "clamp(34px, 6vw, 52px)", lineHeight: 1, marginTop: 12 }}>
        {a.h1}
      </h1>
      <p style={{ color: "var(--text)", fontSize: 17, lineHeight: 1.6, marginTop: 16 }}>{a.intro}</p>

      {a.sections.map((s, i) => (
        <section key={i} style={{ marginTop: 26 }}>
          <h2 className="font-display" style={{ fontSize: 26, color: "var(--gold)" }}>{s.h2}</h2>
          <p style={{ color: "var(--muted)", fontSize: 15.5, lineHeight: 1.7, marginTop: 8 }}>{s.body}</p>
        </section>
      ))}

      {/* CTA */}
      <div className="card" style={{ padding: 22, marginTop: 30, textAlign: "center" }}>
        <div className="font-display" style={{ fontSize: 24, color: "var(--gold)" }}>
          {a.lang === "es" ? "Donde empieza la noche" : "Where the night begins"}
        </div>
        <p style={{ color: "var(--muted)", fontSize: 14, margin: "8px 0 14px" }}>
          {a.lang === "es"
            ? "Calle Uruguay, Ciudad de Panamá. Apúntate gratis a la lista del próximo evento."
            : "Calle Uruguay, Panama City. Join the free guest list for the next event."}
        </p>
        <Link href="/eventos" className="btn btn-red">{ctaText}</Link>
      </div>

      {/* FAQ visible */}
      <section style={{ marginTop: 30 }}>
        <h2 className="font-display" style={{ fontSize: 24, color: "var(--gold)" }}>FAQ</h2>
        <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 12 }}>
          {a.faqs.map((f, i) => (
            <div key={i}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{f.q}</div>
              <div style={{ color: "var(--muted)", fontSize: 14, marginTop: 3 }}>{f.a}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Enlaces internos (SEO) */}
      {related.length > 0 && (
        <section style={{ marginTop: 34 }}>
          <h2 className="font-display" style={{ fontSize: 22 }}>{relTitle}</h2>
          <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", marginTop: 12 }}>
            {related.map((r) => (
              <Link key={r!.slug} href={`/blog/${r!.slug}`} className="card" style={{ padding: 14, textDecoration: "none", fontSize: 14, fontWeight: 600 }}>
                {r!.title}
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
