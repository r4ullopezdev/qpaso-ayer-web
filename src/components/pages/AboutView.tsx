import Link from "next/link";
import { getSettings } from "@/lib/settings";
import { t, langPath, type Lang } from "@/lib/i18n";

const VALUES = {
  es: [
    { t: "Siempre pasa algo", d: "Programación viva de martes a domingo. Cada noche tiene su propio motivo: nunca un día normal." },
    { t: "Donde empieza la noche", d: "Llega, come algo, juega y calienta motores. Somos el mejor punto de arranque de Calle Uruguay." },
    { t: "Juego y experiencia", d: "Beer pong, cup pong, dardos, Jenga gigante y más. Lo que nos hace distintos de un bar cualquiera." },
    { t: "Local + turista", d: "Panameños y viajeros de todo el mundo compartiendo mesa y pista. Ese choque de energía es el show." },
    { t: "Seguro y responsable", d: "Control de edad, consumo responsable y buena convivencia con el barrio. La fiesta bien hecha." },
  ],
  en: [
    { t: "Something always happens", d: "A living line-up from Tuesday to Sunday. Every night has its own reason — never an ordinary night." },
    { t: "Where the night begins", d: "Arrive, grab a bite, play and warm up. We're the best starting point on Calle Uruguay." },
    { t: "Games & experience", d: "Beer pong, cup pong, darts, giant Jenga and more. What sets us apart from just another bar." },
    { t: "Locals + travelers", d: "Panamanians and travelers from all over sharing a table and the dance floor. That mix is the show." },
    { t: "Safe & responsible", d: "Age control, responsible drinking and good vibes with the neighborhood. Partying done right." },
  ],
};

export async function AboutView({ lang }: { lang: Lang }) {
  const settings = await getSettings();
  const story = lang === "en"
    ? "Q'Paso Ayer was born in the heart of Calle Uruguay, Panama City's golden mile of nightlife. Today we reinvent ourselves: from being \"just another bar\" to the meeting point where the night out begins — with shareable dinner, games, drinks, music and a different party every night. Locals and visitors mix here, and something is always happening."
    : "Q'Paso Ayer nació en el corazón de Calle Uruguay, la milla dorada de la noche en Ciudad de Panamá. Hoy nos reinventamos: dejamos de ser \"un bar más\" para convertirnos en el punto de encuentro donde arranca la salida — con cena para compartir, juegos, tragos, música y una fiesta distinta cada noche. Aquí se mezclan los que viven la ciudad y los que la visitan, y siempre está pasando algo.";

  return (
    <div className="container-x section">
      <span className="chip">{t(lang, "about.kicker")}</span>
      <h1 className="font-display" style={{ fontSize: "clamp(40px, 8vw, 68px)", marginTop: 12, lineHeight: 0.95 }}>{t(lang, "about.title")}</h1>
      <p style={{ color: "var(--muted)", fontSize: 17, maxWidth: 640, marginTop: 14, lineHeight: 1.6 }}>{t(lang, "hero.sub")}</p>

      <div className="card" style={{ padding: 28, marginTop: 30 }}>
        <h2 className="font-display" style={{ fontSize: 30, color: "var(--gold)" }}>{t(lang, "about.storyTitle")}</h2>
        <div className="hairline" style={{ margin: "14px 0" }} />
        <p style={{ color: "var(--muted)", fontSize: 15.5, lineHeight: 1.7 }}>{story}</p>
      </div>

      <h2 className="font-display" style={{ fontSize: 30, color: "var(--gold)", marginTop: 36 }}>{t(lang, "about.valuesTitle")}</h2>
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", marginTop: 16 }}>
        {VALUES[lang].map((v) => (
          <div key={v.t} className="card" style={{ padding: 20 }}>
            <div className="font-display" style={{ fontSize: 22, color: "var(--text)" }}>{v.t}</div>
            <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 8, lineHeight: 1.55 }}>{v.d}</p>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 28, marginTop: 36, display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
        <div>
          <h3 className="font-display" style={{ fontSize: 24, color: "var(--gold)" }}>{t(lang, "about.visit")}</h3>
          <p style={{ color: "var(--muted)", fontSize: 15, marginTop: 8 }}>{settings.address}</p>
          <p style={{ color: "var(--muted)", fontSize: 15, marginTop: 6 }}>
            {t(lang, "footer.dinner")}: {settings.hoursDinner}<br />{t(lang, "footer.party")}: {settings.hoursParty}
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, justifyContent: "center" }}>
          <Link href={langPath(lang, "/eventos")} className="btn btn-red">{t(lang, "hero.ctaEvents")}</Link>
          <Link href={langPath(lang, "/restaurante")} className="btn btn-ghost">{t(lang, "hero.ctaMenu")}</Link>
        </div>
      </div>
    </div>
  );
}
