import Link from "next/link";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Sobre nosotros · Q'Paso Ayer",
  description:
    "Q'Paso Ayer es el punto donde empieza la noche en Calle Uruguay, Panamá: cena, juegos, tragos y la mejor fiesta. Conoce nuestra historia y concepto.",
};

const VALUES = [
  { t: "Siempre pasa algo", d: "Programación viva de martes a domingo. Cada noche tiene su propio motivo: nunca un día normal." },
  { t: "Donde empieza la noche", d: "Llega, come algo, juega y calienta motores. Somos el mejor punto de arranque de Calle Uruguay." },
  { t: "Juego y experiencia", d: "Beer pong, cup pong, dardos, Jenga gigante y más. Lo que nos hace distintos de un bar cualquiera." },
  { t: "Local + turista", d: "Panameños y viajeros de todo el mundo compartiendo mesa y pista. Ese choque de energía es el show." },
  { t: "Seguro y responsable", d: "Control de edad, consumo responsable y buena convivencia con el barrio. La fiesta bien hecha." },
];

export default async function NosotrosPage() {
  const settings = await getSettings();
  return (
    <div className="container-x section">
      <span className="chip">Sobre nosotros</span>
      <h1 className="font-display" style={{ fontSize: "clamp(40px, 8vw, 68px)", marginTop: 12, lineHeight: 0.95 }}>
        Donde empieza la noche en Panamá
      </h1>
      <p style={{ color: "var(--muted)", fontSize: 17, maxWidth: 640, marginTop: 14, lineHeight: 1.6 }}>
        {settings.aboutText}
      </p>

      <div className="card" style={{ padding: 28, marginTop: 30 }}>
        <h2 className="font-display" style={{ fontSize: 30, color: "var(--gold)" }}>Nuestra historia</h2>
        <div className="hairline" style={{ margin: "14px 0" }} />
        <p style={{ color: "var(--muted)", fontSize: 15.5, lineHeight: 1.7 }}>
          Q&apos;Paso Ayer nació en el corazón de Calle Uruguay, la milla dorada de la noche en Ciudad de
          Panamá. Hoy nos reinventamos: dejamos de ser &quot;un bar más&quot; para convertirnos en el punto de
          encuentro donde arranca la salida — con cena para compartir, juegos, tragos, música y una fiesta
          distinta cada noche. Aquí se mezclan los que viven la ciudad y los que la visitan, y siempre está
          pasando algo.
        </p>
      </div>

      <h2 className="font-display" style={{ fontSize: 30, color: "var(--gold)", marginTop: 36 }}>Lo que nos mueve</h2>
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", marginTop: 16 }}>
        {VALUES.map((v) => (
          <div key={v.t} className="card" style={{ padding: 20 }}>
            <div className="font-display" style={{ fontSize: 22, color: "var(--text)" }}>{v.t}</div>
            <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 8, lineHeight: 1.55 }}>{v.d}</p>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 28, marginTop: 36, display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
        <div>
          <h3 className="font-display" style={{ fontSize: 24, color: "var(--gold)" }}>Visítanos</h3>
          <p style={{ color: "var(--muted)", fontSize: 15, marginTop: 8 }}>{settings.address}</p>
          <p style={{ color: "var(--muted)", fontSize: 15, marginTop: 6 }}>
            Cena: {settings.hoursDinner}<br />Fiesta: {settings.hoursParty}
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, justifyContent: "center" }}>
          <Link href="/eventos" className="btn btn-red">Ver eventos y apuntarme</Link>
          <Link href="/restaurante" className="btn btn-ghost">Ver la carta</Link>
        </div>
      </div>
    </div>
  );
}
