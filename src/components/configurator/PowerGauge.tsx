/* Medidor de carga de la fuente: la firma del configurador */
import type { BuildItem } from "@/lib/compat";
import type { CatMap } from "@/data/parts/types";
import type { PowerReport } from "@/lib/power";

export default function PowerGauge({ power, psu, compact }: {
  power: PowerReport;
  psu?: BuildItem<CatMap["psu"]>;
  compact?: boolean;
}) {
  const cap = psu?.watt || power.rec || 850;
  const pct = Math.min(100, (power.total / cap) * 100);
  const spikePct = Math.min(100, (power.spike / cap) * 100);
  const tone = pct > 85 ? "var(--red)" : pct > 70 ? "var(--amber)" : "var(--gold)";
  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
        <span className="eyebrow" title="Todos los componentes a su límite a la vez">Peor caso</span>
        <span className="mono" style={{ fontSize: compact ? 13 : 16, color: tone, fontWeight: 600 }}>
          {power.total} W <span style={{ color: "var(--silk-dim)", fontSize: 11 }}>/ {cap} W</span>
        </span>
      </div>
      <div style={{ position: "relative", height: compact ? 9 : 14, background: "#0A1610",
        border: "1px solid var(--trace)", overflow: "hidden" }}>
        {/* zona segura 0–60 % */}
        <div style={{ position: "absolute", left: "60%", top: 0, bottom: 0, width: 1, background: "rgba(216,174,82,.35)" }} />
        <div style={{ position: "absolute", left: "85%", top: 0, bottom: 0, width: 1, background: "rgba(224,90,72,.5)" }} />
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${spikePct}%`,
          background: "rgba(224,90,72,.16)" }} title="Pico transitorio" />
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${pct}%`, background: tone,
          transition: "width .4s cubic-bezier(.2,.8,.2,1)" }} />
        {!psu && power.total > 0 &&
          <div className="gauge-sweep" style={{ position: "absolute", top: 0, bottom: 0, width: "18%",
            background: "linear-gradient(90deg,transparent,rgba(216,174,82,.22),transparent)" }} />}
      </div>
      {!compact && (
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, flexWrap: "wrap", gap: 4 }}>
          <span className="mono" style={{ fontSize: 10, color: "var(--silk-dim)" }}>
            En juego ≈ {power.gaming} W · pico {power.spike} W
          </span>
          <span className="mono" style={{ fontSize: 10, color: "var(--silk-dim)" }}>
            Recomendada: <b style={{ color: "var(--gold)" }}>{power.rec} W</b>
          </span>
        </div>
      )}
    </div>
  );
}
