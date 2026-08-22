"use client";
/* Lista de compra del montaje completo */
import { useRef, useState } from "react";
import { ExternalLink, X } from "lucide-react";
import { CATS } from "@/data/categories";
import { REGIONS, storesFor, type RegionId } from "@/lib/regions";
import type { AppBuild, Picked } from "@/lib/compat";
import { eur } from "./format";

type ItemRow = Picked & { _cat: string };

export default function ShoppingList({ build, region, total, onClose }: {
  build: AppBuild;
  region: RegionId;
  total: number;
  onClose: () => void;
}) {
  const R = REGIONS[region];
  const [store, setStore] = useState("all");
  const [copied, setCopied] = useState(false);
  const ta = useRef<HTMLTextAreaElement>(null);
  const items: ItemRow[] = CATS.flatMap((c) => ((build[c.id] || []) as Picked[]).map((p) => ({ ...p, _cat: c.label })));

  const text = [
    `Montaje — ${new Date().toLocaleDateString("es-ES")}`,
    ...items.map((p) => `${p._cat}: ${p.brand} ${p.name}${(p.qty || 1) > 1 ? ` ×${p.qty}` : ""}`),
    `Total orientativo: ${eur(total)} ${R.cur}`,
  ].join("\n");

  const copy = async () => {
    try { await navigator.clipboard.writeText(text); }
    catch { ta.current?.select(); document.execCommand?.("copy"); }
    setCopied(true); setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div role="dialog" aria-modal="true" aria-label="Lista de compra" onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(4,10,7,.82)", zIndex: 60,
        display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div className="panel fade" onClick={(e) => e.stopPropagation()}
        style={{ width: "min(760px,100%)", maxHeight: "88vh", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start",
          padding: 14, borderBottom: "1px solid var(--trace)" }}>
          <div>
            <div className="eyebrow">Lista de compra · {R.label}</div>
            <div className="dsp" style={{ fontSize: 19, marginTop: 5 }}>
              {items.length} pieza{items.length !== 1 ? "s" : ""} · {eur(total)} {R.cur}
            </div>
          </div>
          <button className="btn" onClick={onClose} aria-label="Cerrar"><X size={13} /></button>
        </div>

        <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--trace)",
          display: "flex", gap: 5, flexWrap: "wrap", alignItems: "center" }}>
          <span className="eyebrow" style={{ marginRight: 3 }}>Tienda</span>
          <button className={`chip ${store === "all" ? "sel" : ""}`} onClick={() => setStore("all")}>Todas</button>
          {R.stores.map((s) =>
            <button key={s.id} className={`chip ${store === s.id ? "sel" : ""}`}
              onClick={() => setStore(s.id)}>{s.name}</button>)}
        </div>

        <div className="scroll" style={{ padding: 14, flex: 1, minHeight: 0 }}>
          {items.length === 0 && (
            <div style={{ textAlign: "center", padding: 24, color: "var(--silk-dim)" }}>
              El montaje está vacío. Elige piezas y vuelve aquí.
            </div>
          )}
          {items.map((p) => {
            const ss = storesFor(p, region);
            const only = store === "all" ? null : ss.find((x) => x.id === store);
            return (
              <div key={p._uid} style={{ borderBottom: "1px solid var(--trace)", padding: "9px 0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline" }}>
                  <div style={{ minWidth: 0 }}>
                    <span className="eyebrow">{p._cat}</span>
                    <div style={{ fontSize: 13, fontWeight: 600, marginTop: 1 }}>
                      {p.brand} {p.name}{(p.qty || 1) > 1 && <span className="mono"
                        style={{ color: "var(--gold)", fontSize: 11 }}> ×{p.qty}</span>}
                    </div>
                  </div>
                  <span className="mono" style={{ fontSize: 12, color: "var(--silk-dim)", whiteSpace: "nowrap" }}>
                    {p.price ? `${eur(p.price * (p.qty || 1))} ${R.cur}` : "—"}
                  </span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 7 }}>
                  {(only ? [only] : ss).map((s) =>
                    <a key={s.id} className="chip" href={s.url} target="_blank" rel="noopener noreferrer"
                      style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4,
                        color: s.kind === "comparador" ? "var(--copper)" : undefined }}>
                      {s.name}<ExternalLink size={9} />
                    </a>)}
                </div>
              </div>
            );
          })}
        </div>

        {items.length > 0 && (
          <div style={{ padding: 14, borderTop: "1px solid var(--trace)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span className="eyebrow">Copiar el montaje</span>
              <button className="btn btn-gold" onClick={copy}>{copied ? "Copiado" : "Copiar"}</button>
            </div>
            <textarea ref={ta} readOnly value={text} rows={4} aria-label="Montaje en texto"
              style={{ width: "100%", background: "var(--board)", border: "1px solid var(--trace)",
                color: "var(--silk-dim)", fontFamily: "'IBM Plex Mono',monospace", fontSize: 11,
                padding: "8px 9px", resize: "vertical" }} />
          </div>
        )}
      </div>
    </div>
  );
}
