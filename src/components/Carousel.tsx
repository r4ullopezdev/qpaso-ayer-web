"use client";

import { useEffect, useRef, useState } from "react";

export function Carousel({ children, ariaLabel }: { children: React.ReactNode; ariaLabel?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);
  const drag = useRef<{ down: boolean; startX: number; startScroll: number; moved: boolean }>({ down: false, startX: 0, startScroll: 0, moved: false });

  function update() {
    const el = ref.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }

  useEffect(() => {
    update();
    const el = ref.current;
    if (!el) return;
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  function scrollByDir(dir: 1 | -1) {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  }

  // Drag con ratón (desktop). En móvil el scroll táctil es nativo.
  function onPointerDown(e: React.PointerEvent) {
    if (e.pointerType === "touch") return;
    const el = ref.current;
    if (!el) return;
    drag.current = { down: true, startX: e.clientX, startScroll: el.scrollLeft, moved: false };
    el.setPointerCapture(e.pointerId);
    el.style.cursor = "grabbing";
  }
  function onPointerMove(e: React.PointerEvent) {
    const el = ref.current;
    if (!el || !drag.current.down) return;
    const dx = e.clientX - drag.current.startX;
    if (Math.abs(dx) > 4) drag.current.moved = true;
    el.scrollLeft = drag.current.startScroll - dx;
  }
  function endDrag(e: React.PointerEvent) {
    const el = ref.current;
    if (!el) return;
    drag.current.down = false;
    el.style.cursor = "grab";
    try { el.releasePointerCapture(e.pointerId); } catch { /* noop */ }
  }
  // Evita que un drag dispare el click de un enlace hijo
  function onClickCapture(e: React.MouseEvent) {
    if (drag.current.moved) { e.preventDefault(); e.stopPropagation(); drag.current.moved = false; }
  }

  const Arrow = ({ dir }: { dir: 1 | -1 }) => {
    const enabled = dir === -1 ? canLeft : canRight;
    return (
      <button
        type="button"
        aria-label={dir === -1 ? "Anterior" : "Siguiente"}
        onClick={() => scrollByDir(dir)}
        style={{
          position: "absolute", top: "50%", transform: "translateY(-50%)",
          [dir === -1 ? "left" : "right"]: -6, zIndex: 5,
          width: 40, height: 40, borderRadius: 999, cursor: enabled ? "pointer" : "default",
          border: "1px solid var(--border)", background: "rgba(20,17,26,0.92)", color: enabled ? "var(--gold)" : "var(--muted)",
          fontSize: 20, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center",
          opacity: enabled ? 1 : 0.3, boxShadow: "0 4px 14px rgba(0,0,0,0.4)", transition: "opacity .15s",
        } as React.CSSProperties}
      >
        {dir === -1 ? "‹" : "›"}
      </button>
    );
  };

  return (
    <div style={{ position: "relative" }} aria-label={ariaLabel} className="qpa-carousel">
      <Arrow dir={-1} />
      <div
        ref={ref}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onClickCapture={onClickCapture}
        style={{
          display: "flex", gap: 14, overflowX: "auto", scrollSnapType: "x mandatory",
          padding: "4px 2px 10px", cursor: "grab", scrollbarWidth: "none",
        }}
      >
        {children}
      </div>
      {/* Fades laterales que indican que hay más */}
      {canLeft && <div style={{ position: "absolute", top: 0, left: 0, width: 36, bottom: 12, background: "linear-gradient(90deg, var(--bg), transparent)", pointerEvents: "none" }} />}
      {canRight && <div style={{ position: "absolute", top: 0, right: 0, width: 36, bottom: 12, background: "linear-gradient(270deg, var(--bg), transparent)", pointerEvents: "none" }} />}
      <Arrow dir={1} />
      <style>{`.qpa-carousel > div::-webkit-scrollbar{display:none}`}</style>
    </div>
  );
}
