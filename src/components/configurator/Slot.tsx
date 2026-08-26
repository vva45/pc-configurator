/* Fila de la lista de montaje */
import { AlertTriangle, Check, Trash2 } from "lucide-react";
import type { Category } from "@/data/categories";
import type { Picked } from "@/lib/compat";
import type { CatId } from "@/data/parts/types";
import { eur } from "./format";
import Fingers from "./Fingers";

export default function Slot({ cat, items, active, onOpen, onRemove, onQty, cur, conflicts }: {
  cat: Category;
  items: Picked[];
  active: boolean;
  onOpen: (id: CatId) => void;
  onRemove: (c: CatId, uid: string) => void;
  onQty: (c: CatId, uid: string, d: number) => void;
  cur: string;
  conflicts?: Set<string>;
}) {
  const Icon = cat.icon;
  const filled = items.length > 0;
  const bad = items.some((i) => conflicts?.has(i._uid));
  const state = bad ? "conflict" : active ? "active" : filled ? "selected" : cat.req ? "required" : "optional";
  const stateLabel = bad ? "Conflicto" : active ? "Siguiente" : filled ? "Instalado" : cat.req ? "Requerido" : "Opcional";
  return (
    <div className="slot-wrap">
      <button className={`slot slot-${state}`} onClick={() => onOpen(cat.id)}
        aria-current={active ? "step" : undefined} aria-label={`${cat.label}: ${stateLabel}`}>
        <Fingers on={filled} tone={bad ? "bad" : ""} />
        <Icon size={15} color={bad ? "var(--red)" : filled ? "var(--gold)" : "var(--silk-dim)"} style={{ flexShrink: 0, marginTop: 1 }} />
        <span style={{ flex: 1, minWidth: 0 }}>
          <span className="slot-heading">
            <span className="eyebrow">{cat.label}</span>
            <span className={`slot-state slot-state-${state}`}>
              {bad ? <AlertTriangle size={9} /> : filled && !active ? <Check size={9} /> : null}{stateLabel}
            </span>
          </span>
          <span className="trunc" style={{ display: "block", fontSize: 12.5, marginTop: 2,
            color: filled ? "var(--silk)" : "var(--silk-dim)" }}>
            {filled ? items.map((i) => i.name).join(" + ") : cat.req ? "Pendiente para completar el núcleo" : "Disponible si lo necesitas"}
          </span>
        </span>
        {filled && <span className="mono" style={{ fontSize: 11, color: "var(--gold)", whiteSpace: "nowrap" }}>
          {eur(items.reduce((a, i) => a + (i.price || 0) * (i.qty || 1), 0))} {cur}
        </span>}
      </button>
      {filled && cat.multi && items.map((i) => (
        <div key={i._uid} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 8px 4px 32px" }}>
          <span className="mono trunc" style={{ fontSize: 10, color: "var(--silk-dim)", flex: 1 }}>{i.brand} {i.name}</span>
          <button className="btn" style={{ padding: "3px 9px", fontSize: 12.5 }} onClick={() => onQty(cat.id, i._uid, -1)} aria-label="Menos">–</button>
          <span className="mono" style={{ fontSize: 12.5, minWidth: 16, textAlign: "center" }}>{i.qty || 1}</span>
          <button className="btn" style={{ padding: "3px 9px", fontSize: 12.5 }} onClick={() => onQty(cat.id, i._uid, 1)} aria-label="Más">+</button>
          <button className="btn" style={{ padding: "3px 8px" }} onClick={() => onRemove(cat.id, i._uid)} aria-label="Quitar"><Trash2 size={13} /></button>
        </div>
      ))}
      {filled && !cat.multi && (
        <div style={{ display: "flex", justifyContent: "flex-end", padding: "3px 8px 0" }}>
          <button className="btn" style={{ padding: "3px 10px", fontSize: 11 }}
            onClick={() => onRemove(cat.id, items[0]._uid)}>Quitar</button>
        </div>
      )}
    </div>
  );
}
