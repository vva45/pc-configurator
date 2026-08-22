/* Tarjeta de pieza */
import { Check, XCircle } from "lucide-react";
import type { Part } from "@/data/parts/types";
import { keyspecsFor } from "@/lib/filters";
import { eur } from "./format";
import PartArt from "./PartArt";

export default function PartCard({ part, blocked, reason, chosen, onPick, onBuy, cur }: {
  part: Part;
  blocked?: boolean;
  reason?: string;
  chosen?: boolean;
  onPick: (p: Part) => void;
  onBuy: (p: Part) => void;
  cur: string;
}) {
  const specs = keyspecsFor(part);
  return (
    <div className={`card ${blocked ? "blocked" : ""}`} tabIndex={0} role="button"
      aria-disabled={blocked} title={blocked ? reason : undefined}
      onClick={() => !blocked && onPick(part)}
      onKeyDown={(e) => { if ((e.key === "Enter" || e.key === " ") && !blocked) { e.preventDefault(); onPick(part); } }}
      style={chosen ? { borderColor: "var(--gold)" } : undefined}>
      <PartArt part={part} />
      {(part.museum || part.legacy) && <div className="mono" style={{ position: "absolute", right: 7, top: 7, fontSize: 9,
        letterSpacing: ".1em", color: "var(--copper)", border: "1px solid var(--copper)", padding: "1px 5px" }}>
        {part.museum ? "MUSEO" : "DESCAT."}</div>}
      {chosen && <div style={{ position: "absolute", right: 7, top: 7, background: "var(--gold)",
        color: "#0A1610", borderRadius: "50%", width: 19, height: 19, display: "grid", placeItems: "center" }}><Check size={12} /></div>}
      <div style={{ padding: "9px 10px" }}>
        <div style={{ fontWeight: 600, fontSize: 13, lineHeight: 1.25, minHeight: 32 }}>{part.name}</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 3, margin: "7px 0 9px" }}>
          {specs.map((s, i) =>
            <span key={i} className="mono" style={{ fontSize: 9.5, color: "var(--silk-dim)",
              border: "1px solid var(--trace)", padding: "1.5px 5px" }}>{s}</span>)}
        </div>
        {blocked ? (
          <div className="mono" style={{ fontSize: 10, color: "var(--red)", display: "flex", gap: 5,
            alignItems: "flex-start", lineHeight: 1.4 }}><XCircle size={11} style={{ flexShrink: 0, marginTop: 1 }} />{reason}</div>
        ) : (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6 }}>
            <span className="mono" style={{ fontSize: 13, color: "var(--gold)", fontWeight: 600 }}>
              {part.price ? `${eur(part.price)} ${cur}` : "—"}
            </span>
            <button className="btn" style={{ padding: "4px 8px", fontSize: 9.5 }}
              onClick={(e) => { e.stopPropagation(); onBuy(part); }}>Dónde comprar</button>
          </div>
        )}
      </div>
    </div>
  );
}
