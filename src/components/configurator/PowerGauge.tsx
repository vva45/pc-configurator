/* Medidor de carga de la fuente: la firma del configurador */
import type { BuildItem } from "@/lib/compat";
import type { CatMap } from "@/data/parts/types";
import type { PowerReport } from "@/lib/power";

export default function PowerGauge({ power, psu, compact }: {
  power: PowerReport;
  psu?: BuildItem<CatMap["psu"]>;
  compact?: boolean;
}) {
  const hasLoad = power.total > 0;
  const cap = psu?.watt || (hasLoad ? power.rec : 0);
  const pct = cap ? Math.min(100, (power.total / cap) * 100) : 0;
  const spikePct = cap ? Math.min(100, (power.spike / cap) * 100) : 0;
  /* Carga normal en azul (es la lectura del usuario), alta en ámbar, crítica en rojo. */
  const tone = pct > 85 ? "var(--danger)" : pct > 70 ? "var(--warning)" : "var(--accent)";
  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
        <span className="eyebrow" title="Todos los componentes a su límite a la vez">Peor caso</span>
        <span className="mono" style={{ fontSize: compact ? 13 : 16, color: tone, fontWeight: 600 }}>
          {power.total} W <span style={{ color: "var(--text-secondary)", fontSize: 11 }}>/ {cap ? `${cap} W` : "—"}</span>
        </span>
      </div>
      <div style={{ position: "relative", height: compact ? 9 : 14, background: "#090D12",
        border: "1px solid var(--border)", overflow: "hidden" }}>
        {/* zona segura 0–60 % */}
        <div style={{ position: "absolute", left: "60%", top: 0, bottom: 0, width: 1, background: "rgba(120,155,200,.28)" }} />
        <div style={{ position: "absolute", left: "85%", top: 0, bottom: 0, width: 1, background: "rgba(237,102,102,.45)" }} />
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${spikePct}%`,
          background: "var(--danger-soft)" }} title="Pico transitorio" />
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${pct}%`, background: tone,
          transition: "width .4s cubic-bezier(.2,.8,.2,1)" }} />
        {!psu && power.total > 0 &&
          <div className="gauge-sweep" style={{ position: "absolute", top: 0, bottom: 0, width: "18%",
            background: "linear-gradient(90deg,transparent,rgba(77,141,255,.18),transparent)" }} />}
      </div>
      {!compact && (
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, flexWrap: "wrap", gap: 4 }}>
          <span className="mono" style={{ fontSize: 10, color: "var(--text-secondary)" }}>
            En juego ≈ {power.gaming} W · pico {power.spike} W
          </span>
          <span className="mono" style={{ fontSize: 10, color: "var(--text-secondary)" }}>
            Recomendada: <b style={{ color: "var(--text)" }}>{hasLoad ? `${power.rec} W` : "—"}</b>
          </span>
        </div>
      )}
    </div>
  );
}
