/* Arte generativo de PCB, distinto por pieza (sin fotos de terceros) */
import { CAT } from "@/data/categories";
import type { Part } from "@/data/parts/types";
import { hash } from "./format";

export default function PartArt({ part, h = 88 }: { part: Part; h?: number }) {
  const Icon = CAT[part.cat].icon;
  const s = hash(part.brand + part.name);
  const traces = Array.from({ length: 6 }, (_, i) => {
    const y = 8 + ((s >> (i * 3)) % 9) * 10;
    const x = 6 + ((s >> (i * 2)) % 5) * 14;
    const w = 20 + ((s >> i) % 6) * 12;
    return (
      <g key={i}>
        <path d={`M${x} ${y} h${w} l10 10 h${16 + ((s >> i) % 20)}`} fill="none"
          stroke="rgba(120,150,185,.28)" strokeWidth="1.4" />
        <circle cx={x} cy={y} r="2.1" fill="rgba(120,150,185,.28)" />
      </g>
    );
  });
  return (
    <div style={{ height: h, position: "relative", background: "transparent", overflow: "hidden" }}>
      <svg width="100%" height="100%" viewBox="0 0 220 100" preserveAspectRatio="xMidYMid slice">{traces}</svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {/* Tamaño calibrado sobre captura del usuario: ~44px en la tarjeta
            estándar (antes 30) para que los iconos con detalle se lean. */}
        <Icon size={h > 70 ? 44 : 30} color="#9FB6D2" strokeWidth={1.3} opacity={0.9} />
      </div>
    </div>
  );
}
