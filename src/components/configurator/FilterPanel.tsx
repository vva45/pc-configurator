"use client";
/* Panel de filtros */
import { useState } from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { FILTERS, type ActiveFilters, type EnumValue, type FilterValue } from "@/lib/filters";
import type { CatId, Part } from "@/data/parts/types";
import type { Dispatch, SetStateAction } from "react";

export default function FilterPanel({ cat, pool, filters, setFilters, onClear }: {
  cat: CatId;
  pool: Part[];
  filters: ActiveFilters;
  setFilters: Dispatch<SetStateAction<ActiveFilters>>;
  onClear: () => void;
}) {
  const defs = FILTERS[cat] || [];
  const [open, setOpen] = useState<Set<string>>(() => new Set(defs.slice(0, 4).map((d) => d.k)));
  /* Al cambiar de categoría se reabren los cuatro primeros filtros. Mismo
     comportamiento que el useEffect original, con el patrón de estado
     derivado en render que recomienda React (sin render en cascada). */
  const [prevCat, setPrevCat] = useState(cat);
  if (prevCat !== cat) {
    setPrevCat(cat);
    setOpen(new Set((FILTERS[cat] || []).slice(0, 4).map((d) => d.k)));
  }
  const toggle = (k: string) => setOpen((s) => { const n = new Set(s); if (n.has(k)) n.delete(k); else n.add(k); return n; });
  const set = (k: string, v: FilterValue | undefined) => setFilters((f) => ({ ...f, [k]: v }));
  const active = Object.values(filters).filter((v) => v !== undefined && v !== null && !(Array.isArray(v) && !v.length)).length;

  return (
    <div className="panel scroll" style={{ padding: "12px 12px 20px", height: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <span className="eyebrow" style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <SlidersHorizontal size={11} /> Filtros {active > 0 && `· ${active}`}
        </span>
        {active > 0 && <button className="btn" style={{ padding: "3px 7px", fontSize: 10 }} onClick={onClear}>Limpiar</button>}
      </div>

      {defs.map((d) => {
        const vals = pool.map((p) => (p as unknown as Record<string, unknown>)[d.k]).filter((v) => v !== undefined);
        if (!vals.length) return null;
        const isOpen = open.has(d.k);
        let body: React.ReactNode = null;

        if (d.type === "enum") {
          const uniq = [...new Set(vals.flat().filter((v) => v !== null && v !== ""))].sort((a, b) =>
            typeof a === "number" && typeof b === "number" ? a - b : String(a).localeCompare(String(b))) as EnumValue[];
          if (uniq.length < 2) return null;
          const sel = (filters[d.k] as EnumValue[] | undefined) || [];
          body = <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {uniq.map((v) => <button key={String(v)} className={`chip ${sel.includes(v) ? "sel" : ""}`}
              onClick={() => set(d.k, sel.includes(v) ? sel.filter((x) => x !== v) : [...sel, v])}>{String(v)}</button>)}
          </div>;
        }
        else if (d.type === "range") {
          const nums = vals.filter((v): v is number => typeof v === "number");
          if (nums.length < 2) return null;
          const lo = Math.min(...nums), hi = Math.max(...nums);
          if (lo === hi) return null;
          const cur = (filters[d.k] as [number, number] | undefined) || [lo, hi];
          body = <div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <input type="number" value={cur[0]} min={lo} max={hi} aria-label={`${d.label} mínimo`}
                onChange={(e) => set(d.k, [Number(e.target.value), cur[1]])} />
              <span className="mono" style={{ color: "var(--silk-dim)", fontSize: 11 }}>–</span>
              <input type="number" value={cur[1]} min={lo} max={hi} aria-label={`${d.label} máximo`}
                onChange={(e) => set(d.k, [cur[0], Number(e.target.value)])} />
            </div>
            <input type="range" min={lo} max={hi} value={cur[0]} aria-label={`${d.label} mínimo`}
              step={(hi - lo) / 100 < 1 ? 0.1 : 1} style={{ marginTop: 5 }}
              onChange={(e) => set(d.k, [Number(e.target.value), cur[1]])} />
            <div className="mono" style={{ fontSize: 9.5, color: "var(--silk-dim)", display: "flex", justifyContent: "space-between" }}>
              <span>{lo}{d.unit || ""}</span><span>{hi}{d.unit || ""}</span>
            </div>
          </div>;
        }
        else { // bool | has
          const v = filters[d.k] as "si" | "no" | undefined;
          body = <div style={{ display: "flex", gap: 4 }}>
            {([["si", "Sí"], ["no", "No"]] as const).map(([k, lab]) =>
              <button key={k} className={`chip ${v === k ? "sel" : ""}`}
                onClick={() => set(d.k, v === k ? undefined : k)}>{lab}</button>)}
          </div>;
        }

        return (
          <div key={d.k} style={{ borderTop: "1px solid var(--trace)", padding: "8px 0" }}>
            <button onClick={() => toggle(d.k)} style={{ all: "unset", cursor: "pointer", width: "100%",
              display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="mono" style={{ fontSize: 11, letterSpacing: ".04em" }}>{d.label}</span>
              <ChevronDown size={13} color="var(--silk-dim)"
                style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform .18s" }} />
            </button>
            {isOpen && <div style={{ marginTop: 8 }}>{body}</div>}
          </div>
        );
      })}
    </div>
  );
}
