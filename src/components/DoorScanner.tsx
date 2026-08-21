"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface ScanResult {
  status: "ok" | "already" | "invalid";
  message: string;
  name?: string;
  event?: string;
  entryType?: string;
  list?: string;
  guests?: number;
  promoter?: string | null;
  at?: string | null;
  by?: string | null;
}

const ENTRY_LABEL: Record<string, string> = {
  FREE: "Lista gratis",
  PAID: "Pago en puerta",
  TABLE_GIRLS: "Mesa chicas",
};

type EntryType = "FREE" | "PAID";
interface EventLite { id: string; title: string; girlsListOpen?: boolean; guysListOpen?: boolean; paidEntryOpen?: boolean }
interface PromoterLite { id: string; name: string; code: string }
const ENTRY_TITLE: Record<EntryType, string> = { FREE: "Lista gratis", PAID: "Pago en puerta" };
type Tally = Record<string, { FREE: number; PAID: number }>; // key = promoterId ("" = sin promotor)

export function DoorScanner({ username, events, promoters }: { username: string; events: EventLite[]; promoters: PromoterLite[] }) {
  const router = useRouter();
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [manual, setManual] = useState("");

  // ---- Conteo por promotor (puerta) ----
  const [mEvent, setMEvent] = useState(events[0]?.id ?? "");
  const [tally, setTally] = useState<Tally>({});
  const [pending, setPending] = useState<Record<string, number>>({}); // key `${promoterKey}:${type}`
  const [locked, setLocked] = useState<Record<string, boolean>>({});
  const [loadingTally, setLoadingTally] = useState(false);

  const selectedEvent = events.find((e) => e.id === mEvent);
  const availableTypes: EntryType[] = (() => {
    const t: EntryType[] = [];
    if (!selectedEvent || selectedEvent.girlsListOpen !== false || selectedEvent.guysListOpen !== false) t.push("FREE");
    if (!selectedEvent || selectedEvent.paidEntryOpen !== false) t.push("PAID");
    return t.length ? t : ["FREE"];
  })();
  // fila "sin promotor" + promotores
  const rows: PromoterLite[] = [{ id: "", name: "Sin promotor", code: "—" }, ...promoters];
  const acc = (key: string, type: EntryType) => tally[key]?.[type] ?? 0;
  const pend = (key: string, type: EntryType) => pending[`${key}:${type}`] ?? 0;

  async function loadTally(eventId: string) {
    if (!eventId) { setTally({}); return; }
    setLoadingTally(true);
    try {
      const r = await fetch(`/api/door/tally?eventId=${encodeURIComponent(eventId)}`);
      const d = await r.json();
      setTally(d.tallies ?? {});
    } catch { /* noop */ }
    finally { setLoadingTally(false); }
  }
  useEffect(() => { loadTally(mEvent); setPending({}); }, [mEvent]);

  function bump(key: string, type: EntryType, dir: 1 | -1) {
    setPending((p) => {
      const k = `${key}:${type}`;
      const next = (p[k] ?? 0) + dir;
      // no dejar que el pendiente reste más de lo acumulado
      const min = -acc(key, type);
      return { ...p, [k]: Math.max(min, next) };
    });
  }

  async function accept(key: string, type: EntryType) {
    const k = `${key}:${type}`;
    const delta = pending[k] ?? 0;
    if (delta === 0 || locked[k]) return;
    setLocked((l) => ({ ...l, [k]: true }));
    try {
      const r = await fetch("/api/door/tally", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: mEvent, entryType: type, promoterId: key || null, delta }),
      });
      const d = await r.json();
      if (r.ok) {
        setTally((t) => ({ ...t, [key]: { FREE: acc(key, "FREE"), PAID: acc(key, "PAID"), [type]: d.count } }));
        setPending((p) => ({ ...p, [k]: 0 }));
        if (navigator.vibrate) navigator.vibrate(delta > 0 ? 90 : 200);
      }
    } catch { /* noop */ }
    finally {
      // el botón queda bloqueado un momento para evitar dobles clicks
      setTimeout(() => setLocked((l) => ({ ...l, [k]: false })), 1200);
    }
  }

  const [log, setLog] = useState<{ name: string; status: string; time: string }[]>([]);
  const [camError, setCamError] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const scannerRef = useRef<any>(null);
  const busyRef = useRef(false);
  const lastRef = useRef<{ code: string; t: number }>({ code: "", t: 0 });

  async function processCode(code: string) {
    if (busyRef.current) return;
    // dedupe: mismo código en menos de 3s
    const now = Date.now();
    if (code === lastRef.current.code && now - lastRef.current.t < 3000) return;
    lastRef.current = { code, t: now };
    busyRef.current = true;
    try {
      const r = await fetch("/api/door/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data: ScanResult = await r.json();
      setResult(data);
      if (data.name) {
        setLog((l) => [{ name: data.name!, status: data.status, time: new Date().toLocaleTimeString("es-PA") }, ...l].slice(0, 12));
      }
      if (navigator.vibrate) navigator.vibrate(data.status === "ok" ? 120 : 300);
    } catch {
      setResult({ status: "invalid", message: "Error de conexión" });
    } finally {
      setTimeout(() => (busyRef.current = false), 800);
    }
  }

  async function startCamera() {
    setCamError("");
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const el = document.getElementById("qr-reader");
      if (!el) return;
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decoded: string) => processCode(decoded),
        () => {}
      );
      setScanning(true);
    } catch (e) {
      setCamError("No se pudo abrir la cámara. Usa el modo manual o revisa permisos.");
      console.error(e);
    }
  }

  async function stopCamera() {
    try {
      if (scannerRef.current) {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
        scannerRef.current = null;
      }
    } catch {
      /* noop */
    }
    setScanning(false);
  }

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  const bg =
    result?.status === "ok" ? "#0f7a3d" : result?.status === "already" ? "#8a1f1f" : result?.status === "invalid" ? "#3a3340" : "transparent";

  return (
    <div className="container-x" style={{ maxWidth: 520, paddingBlock: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div className="font-display" style={{ fontSize: 26, color: "var(--gold)" }}>PUERTA · QPA</div>
        <button onClick={logout} className="btn btn-ghost" style={{ padding: "6px 12px", fontSize: 12 }}>Salir</button>
      </div>
      <div style={{ color: "var(--muted)", fontSize: 12 }}>Portero: {username}</div>

      {/* Resultado grande */}
      {result && (
        <div className="card" style={{ marginTop: 16, padding: 20, background: bg, borderColor: "transparent", textAlign: "center" }}>
          <div className="font-display" style={{ fontSize: 30, color: "#fff" }}>
            {result.status === "ok" ? "✓ VÁLIDA" : result.status === "already" ? "✕ YA USADA" : "✕ NO VÁLIDA"}
          </div>
          <div style={{ color: "#fff", fontSize: 14, marginTop: 4 }}>{result.message}</div>
          {result.name && (
            <div style={{ marginTop: 12, background: "rgba(0,0,0,0.25)", borderRadius: 10, padding: 12, textAlign: "left", color: "#fff" }}>
              <div style={{ fontSize: 20, fontWeight: 800 }}>{result.name}</div>
              <div style={{ fontSize: 13, opacity: 0.9 }}>
                {ENTRY_LABEL[result.entryType || ""] ?? result.entryType} · {result.list}
                {result.entryType === "TABLE_GIRLS" ? ` · grupo de ${result.guests}` : ""}
              </div>
              {result.promoter && <div style={{ fontSize: 12, opacity: 0.85 }}>Invita: {result.promoter}</div>}
              {result.status === "already" && result.at && (
                <div style={{ fontSize: 12, opacity: 0.85, marginTop: 4 }}>
                  Entró: {new Date(result.at).toLocaleString("es-PA")} {result.by ? `(${result.by})` : ""}
                </div>
              )}
            </div>
          )}
          <button onClick={() => setResult(null)} className="btn btn-gold" style={{ marginTop: 14 }}>
            Escanear siguiente
          </button>
        </div>
      )}

      {/* Cámara */}
      <div className="card" style={{ marginTop: 16, padding: 16 }}>
        <div id="qr-reader" style={{ width: "100%", minHeight: scanning ? 260 : 0, borderRadius: 10, overflow: "hidden" }} />
        {!scanning ? (
          <button onClick={startCamera} className="btn btn-red" style={{ width: "100%", marginTop: 8 }}>Iniciar cámara</button>
        ) : (
          <button onClick={stopCamera} className="btn btn-ghost" style={{ width: "100%", marginTop: 8 }}>Detener cámara</button>
        )}
        {camError && <div style={{ color: "var(--red-2)", fontSize: 12, marginTop: 8 }}>{camError}</div>}
      </div>

      {/* Manual */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (manual.trim()) processCode(manual.trim());
          setManual("");
        }}
        className="card"
        style={{ marginTop: 12, padding: 16, display: "flex", gap: 8 }}
      >
        <input value={manual} onChange={(e) => setManual(e.target.value)} placeholder="Pega el código o link del QR" />
        <button type="submit" className="btn btn-gold" style={{ padding: "10px 14px" }}>Validar</button>
      </form>

      {/* Conteo por promotor */}
      <div className="card" style={{ marginTop: 12, padding: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Conteo por promotor</div>
        <div style={{ color: "var(--muted)", fontSize: 12, marginBottom: 10 }}>
          Elige el evento y suma cuántas personas trajo cada promotor en cada entrada. Ajusta con + / − y pulsa Aceptar para que cuente.
        </div>
        <select value={mEvent} onChange={(e) => setMEvent(e.target.value)} style={{ width: "100%" }}>
          {events.length === 0 && <option value="">(sin eventos)</option>}
          {events.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
        </select>

        {mEvent && availableTypes.map((type) => (
          <div key={type} style={{ marginTop: 14 }}>
            <div className="font-display" style={{ fontSize: 18, color: type === "FREE" ? "var(--gold)" : "var(--red-2)" }}>
              {ENTRY_TITLE[type]}
            </div>
            <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
              {rows.map((p) => {
                const k = `${p.id}:${type}`;
                const pd = pend(p.id, type);
                const isLocked = !!locked[k];
                return (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "8px 10px" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {p.name} {p.id && <span style={{ color: "var(--muted)", fontWeight: 400, fontSize: 12 }}>({p.code})</span>}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--muted)" }}>ya contados: {acc(p.id, type)}</div>
                    </div>
                    <button type="button" aria-label="restar" onClick={() => bump(p.id, type, -1)}
                      className="btn btn-ghost" style={{ padding: "4px 12px", fontSize: 18, lineHeight: 1 }}>−</button>
                    <div style={{ minWidth: 26, textAlign: "center", fontWeight: 800, fontSize: 16, color: pd < 0 ? "var(--red-2)" : pd > 0 ? "var(--gold)" : "var(--text)" }}>
                      {pd > 0 ? `+${pd}` : pd}
                    </div>
                    <button type="button" aria-label="sumar" onClick={() => bump(p.id, type, 1)}
                      className="btn btn-ghost" style={{ padding: "4px 12px", fontSize: 18, lineHeight: 1 }}>+</button>
                    <button type="button" onClick={() => accept(p.id, type)} disabled={pd === 0 || isLocked}
                      className={pd < 0 ? "btn btn-ghost" : "btn btn-gold"} style={{ padding: "6px 12px", fontSize: 13, minWidth: 78 }}>
                      {isLocked ? "…" : "Aceptar"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        {loadingTally && <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 8 }}>Cargando conteo…</div>}
      </div>

      {/* Log de la sesión */}
      {log.length > 0 && (
        <div className="card" style={{ marginTop: 12, padding: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: "var(--muted)", marginBottom: 8 }}>Últimos escaneos</div>
          {log.map((l, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "3px 0" }}>
              <span>{l.name}</span>
              <span style={{ color: l.status === "ok" ? "#7CFFB2" : l.status === "already" ? "var(--red-2)" : "var(--muted)" }}>
                {l.status === "ok" ? "entró" : l.status === "already" ? "repetida" : "inválida"} · {l.time}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
