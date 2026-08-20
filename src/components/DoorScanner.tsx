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

interface EventLite { id: string; title: string }
interface PromoterLite { id: string; name: string; code: string }

export function DoorScanner({ username, events, promoters }: { username: string; events: EventLite[]; promoters: PromoterLite[] }) {
  const router = useRouter();
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [manual, setManual] = useState("");
  // Registro manual
  const [mEvent, setMEvent] = useState(events[0]?.id ?? "");
  const [mPromoter, setMPromoter] = useState("");
  const [mMsg, setMMsg] = useState("");
  const [mBusy, setMBusy] = useState(false);

  async function addManual(entryType: "FREE" | "PAID") {
    if (!mEvent || mBusy) return;
    setMBusy(true);
    setMMsg("");
    try {
      const r = await fetch("/api/door/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: mEvent, promoterId: mPromoter || undefined, entryType }),
      });
      const d = await r.json();
      if (!r.ok) { setMMsg(d.error ?? "Error"); }
      else {
        const who = promoters.find((p) => p.id === mPromoter)?.name;
        setMMsg(`+1 ${entryType === "FREE" ? "gratis" : "pago"}${who ? " · " + who : ""} ✓ (gratis: ${d.freeCount} / pago: ${d.paidCount})`);
        if (navigator.vibrate) navigator.vibrate(80);
      }
    } catch {
      setMMsg("Error de conexión");
    } finally {
      setMBusy(false);
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

      {/* Registro manual (sin datos de la persona) */}
      <div className="card" style={{ marginTop: 12, padding: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8 }}>Registro manual</div>
        <div style={{ color: "var(--muted)", fontSize: 12, marginBottom: 10 }}>
          Para quien llega sin QR y dice de parte de quién viene. Suma al promotor.
        </div>
        <div style={{ display: "grid", gap: 8 }}>
          <select value={mEvent} onChange={(e) => setMEvent(e.target.value)}>
            {events.length === 0 && <option value="">(sin eventos)</option>}
            {events.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
          </select>
          <select value={mPromoter} onChange={(e) => setMPromoter(e.target.value)}>
            <option value="">Sin promotor</option>
            {promoters.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.code})</option>)}
          </select>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" onClick={() => addManual("FREE")} disabled={mBusy || !mEvent} className="btn btn-gold" style={{ flex: 1 }}>
              Entró GRATIS
            </button>
            <button type="button" onClick={() => addManual("PAID")} disabled={mBusy || !mEvent} className="btn btn-red" style={{ flex: 1 }}>
              Entró PAGO
            </button>
          </div>
          {mMsg && <div style={{ fontSize: 13, color: "var(--gold)", fontWeight: 600 }}>{mMsg}</div>}
        </div>
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
