/* Hoja de tiendas de una pieza */
import { ExternalLink, X } from "lucide-react";
import { REGIONS, searchTerm, storesFor, type RegionId, type ResolvedStore } from "@/lib/regions";
import type { Part } from "@/data/parts/types";

export default function StoreSheet({ part, region, onClose }: {
  part: Part;
  region: RegionId;
  onClose: () => void;
}) {
  const stores = storesFor(part, region);
  const R = REGIONS[region];
  const shops = stores.filter((s) => s.kind === "tienda");
  const comps = stores.filter((s) => s.kind === "comparador");
  const Row = (s: ResolvedStore) => (
    <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer"
      style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "11px 12px", border: "1px solid var(--border)", marginBottom: 6,
        textDecoration: "none", color: "var(--text)" }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}>
      <span style={{ fontWeight: 600, fontSize: 13 }}>{s.name}</span>
      <ExternalLink size={12} color="var(--accent)" />
    </a>
  );
  return (
    <div role="dialog" aria-modal="true" aria-label="Dónde comprar" onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(3,6,10,.84)", zIndex: 60,
        display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div className="panel fade" onClick={(e) => e.stopPropagation()}
        style={{ width: "min(560px,100%)", maxHeight: "86vh", overflow: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start",
          padding: 14, borderBottom: "1px solid var(--border)" }}>
          <div>
            <div className="eyebrow">Dónde comprar · {R.label}</div>
            <div className="dsp" style={{ fontSize: 19, marginTop: 5 }}>{part.brand} {part.name}</div>
          </div>
          <button className="btn" onClick={onClose} aria-label="Cerrar"><X size={13} /></button>
        </div>
        <div style={{ padding: 14 }}>
          <div className="eyebrow" style={{ marginBottom: 7 }}>Tiendas</div>
          {shops.map(Row)}
          {comps.length > 0 && <>
            <div className="eyebrow" style={{ margin: "14px 0 7px" }}>Comparadores de precio</div>
            {comps.map(Row)}
          </>}
          <div className="mono" style={{ fontSize: 10, color: "var(--text-secondary)", marginTop: 12, lineHeight: 1.6 }}>
            Cada enlace abre el buscador de la tienda con «{decodeURIComponent(searchTerm(part))}».
            Cambia la región arriba para ver otro mercado.
          </div>
        </div>
      </div>
    </div>
  );
}
