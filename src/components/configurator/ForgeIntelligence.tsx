import { AlertTriangle, Check, CircleAlert, Info } from "lucide-react";
import type { CatId } from "@/data/parts/types";
import type { ForgeAnalysis, ForgeSeverity } from "@/lib/forge-intelligence";

const severityMeta: Record<ForgeSeverity, { icon: typeof Info; text: string }> = {
  critical: { icon: CircleAlert, text: "Crítico" }, warning: { icon: AlertTriangle, text: "Aviso" },
  info: { icon: Info, text: "Información" }, success: { icon: Check, text: "Correcto" },
};

export default function ForgeIntelligence({ analysis, onAction }: {
  analysis: ForgeAnalysis;
  onAction: (cat: CatId, minWatt?: number) => void;
}) {
  const shown = analysis.insights.slice(0, 4);
  const score = analysis.score;
  return <>
    <section className="forge-score" aria-label={score ? `Forge Score ${score.total} de 100, ${score.label}` : "Forge Score pendiente"}>
      <div className="forge-score-head">
        <div><div className="eyebrow">Forge score</div><div className="forge-score-caption">Integridad del montaje</div></div>
        <div className="forge-score-reading"><strong>{score?.total ?? "—"}</strong><span>{score ? "/ 100" : "PENDIENTE"}</span></div>
      </div>
      {score ? <>
        <div className="forge-score-status">{score.label}</div>
        <div className="forge-score-track" aria-hidden="true"><i style={{ width: `${score.total}%` }} /></div>
        <dl className="forge-score-breakdown">
          {([['CORE', score.core, 35], ['COMPAT.', score.compatibility, 30], ['POST', score.post, 20], ['ENERGÍA', score.power, 15]] as const).map(([label, value, max]) =>
            <div key={label}><dt>{label}</dt><dd>{value} / {max}</dd></div>)}
        </dl>
      </> : <div className="forge-score-empty"><strong>Esperando componentes</strong><span>Forge todavía no dispone de información suficiente. El cálculo comenzará con la primera pieza.</span></div>}
      <p className="forge-score-note" title="Evalúa completitud, compatibilidad, POST y alimentación. No representa rendimiento.">Evalúa salud y preparación del montaje; no representa rendimiento.</p>
    </section>
    <section className="forge-insights" aria-labelledby="forge-insight-title">
      <div className="forge-insights-head"><div id="forge-insight-title" className="eyebrow">Forge insight</div><span>{analysis.insights.length} señales</span></div>
      <div className="forge-insight-list">
        {shown.map((insight) => { const meta = severityMeta[insight.severity]; const Icon = meta.icon; return <article key={insight.id} className={`forge-insight forge-insight-${insight.severity}`}>
          <div className="forge-insight-marker"><Icon size={13} aria-hidden="true" /><span>{meta.text} · {insight.label}</span></div>
          <h3>{insight.title}</h3><p>{insight.detail}</p>
          {insight.targetCat && <button className="btn" onClick={() => onAction(insight.targetCat!, insight.minWatt)}>
            {insight.targetCat === "psu" && insight.minWatt ? `Ver fuentes ≥ ${insight.minWatt} W` : `Abrir ${insight.title.replace(/^(Selecciona|Empieza por) /, "")}`}
          </button>}
        </article>; })}
      </div>
      {analysis.insights.length > shown.length && <div className="forge-insights-more">+ {analysis.insights.length - shown.length} señales disponibles en POST</div>}
    </section>
  </>;
}
