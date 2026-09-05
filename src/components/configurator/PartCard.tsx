/* Tarjeta de pieza */
import { Check, ShoppingBag, XCircle } from "lucide-react";
import type { Part } from "@/data/parts/types";
import { keyspecsFor } from "@/lib/filters";
import { eur } from "./format";
import PartArt from "./PartArt";
import { CAT } from "@/data/categories";

export default function PartCard({ part, blocked, reason, chosen, onPick, onBuy, cur, compact = false }: {
  part: Part;
  blocked?: boolean;
  reason?: string;
  chosen?: boolean;
  onPick: (p: Part) => void;
  onBuy: (p: Part) => void;
  cur: string;
  compact?: boolean;
}) {
  const specs = keyspecsFor(part);
  const state = blocked ? "blocked" : chosen ? "selected" : "compatible";
  const stateLabel = blocked ? "Incompatible" : chosen ? "Seleccionada" : "Compatible";
  if (compact) {
    const Icon = CAT[part.cat].icon;
    return <article className={`visual-option is-${state}`} aria-label={`${part.brand} ${part.name}: ${stateLabel}`}>
      <button className="visual-option-select" type="button" disabled={blocked}
        title={blocked ? reason : specs.join(" · ")}
        aria-label={`${chosen ? "Cambiar selección a" : "Seleccionar"} ${part.brand} ${part.name}`}
        aria-pressed={chosen} onClick={() => onPick(part)}>
        <Icon size={25} />
        {(part.museum || part.legacy) && <span className="visual-option-legacy">{part.museum ? "Museo" : "Descatalogada"}</span>}
        {chosen && <Check className="visual-option-check" size={13} />}
        <span className="visual-option-brand">{part.brand}</span>
        <strong>{part.name}</strong>
        <span className="visual-option-price">{blocked ? "Incompatible" : part.price ? `${eur(part.price)} ${cur}` : "Consultar precio"}</span>
        {blocked && reason && <span className="visual-option-reason">{reason}</span>}
      </button>
      {!blocked && <button className="visual-option-buy" aria-label={`Dónde comprar ${part.brand} ${part.name}`} title="Dónde comprar" onClick={() => onBuy(part)}><ShoppingBag size={12} /></button>}
    </article>;
  }
  return (
    <article className={`card part-card part-card-${state}`} aria-label={`${part.brand} ${part.name}: ${stateLabel}`}>
      <button className="part-card-select" type="button" disabled={blocked}
        aria-label={`${chosen ? "Cambiar selección a" : "Seleccionar"} ${part.brand} ${part.name}`}
        aria-pressed={chosen} onClick={() => onPick(part)} />
      <div className="part-card-art"><PartArt part={part} /></div>
      {(part.museum || part.legacy) && <div className="mono" style={{ position: "absolute", right: 7, top: 7, fontSize: 9,
        letterSpacing: ".1em", color: "var(--legacy)", border: "1px solid var(--legacy)", padding: "1px 5px" }}>
        {part.museum ? "MUSEO" : "DESCAT."}</div>}
      <div className="part-card-body">
        <div className="part-brand">{part.brand}</div>
        <h3 className="part-name">{part.name}</h3>
        <div className="part-specs">
          {specs.map((s, i) =>
            <span key={i} className="mono" style={{ fontSize: 9.5, color: "var(--text-secondary)",
              border: "1px solid var(--border)", padding: "1.5px 5px" }}>{s}</span>)}
        </div>
        <div className={`part-status part-status-${state}`}>
          {blocked ? <XCircle size={11} /> : <Check size={11} />}
          <span>{stateLabel}</span>
        </div>
        {blocked && reason && <div className="part-reason mono">{reason}</div>}
        {!blocked && <div className="part-card-footer">
          <div><span className="part-price-label">Precio</span><span className="part-price mono">
            {part.price ? `${eur(part.price)} ${cur}` : "—"}
          </span></div>
          <button className="btn part-buy" type="button" onClick={() => onBuy(part)}>
            <ShoppingBag size={11} /> Dónde comprar
          </button>
        </div>}
      </div>
    </article>
  );
}
