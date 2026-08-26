"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Maximize2, X } from "lucide-react";
import type { CatId } from "@/data/parts/types";
import type { VisualBuildModel, VisualCategory, VisualPart } from "@/lib/visual-build";

interface Props { model: VisualBuildModel; onOpenCategory: (category: CatId) => void; }

const ZONES: Record<VisualCategory, { x: number; y: number; w: number; h: number }> = {
  case: { x: 12, y: 10, w: 316, h: 240 }, mbo: { x: 72, y: 47, w: 170, h: 160 },
  cpu: { x: 118, y: 80, w: 42, h: 42 }, ram: { x: 170, y: 68, w: 38, h: 76 },
  gpu: { x: 90, y: 151, w: 166, h: 38 }, cooler: { x: 111, y: 73, w: 57, h: 63 },
  storage: { x: 217, y: 67, w: 22, h: 63 }, psu: { x: 218, y: 202, w: 90, h: 38 },
  fan: { x: 274, y: 56, w: 42, h: 118 }, rgb: { x: 31, y: 28, w: 9, h: 196 },
  expansion: { x: 83, y: 197, w: 116, h: 16 },
};

function details(part: VisualPart) {
  const entries = Object.entries(part.metadata).filter(([, value]) => value !== undefined);
  return entries.map(([key, value]) => `${key}: ${value}`).join(" · ");
}

function PartShape({ part, active, onActivate, onInspect }: { part: VisualPart; active: boolean; onActivate: () => void; onInspect: () => void }) {
  const z = ZONES[part.category];
  const installed = part.state !== "empty" && part.state !== "next";
  const cls = `visual-part visual-part-${part.category} is-${part.state}${active ? " is-active" : ""}`;
  const common = { className: cls, role: "button", tabIndex: 0, "aria-label": `${part.label}: ${part.name || "vacío"}`, onClick: onActivate, onFocus: onInspect, onMouseEnter: onInspect, onKeyDown: (event: React.KeyboardEvent<SVGGElement>) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onActivate(); } } };
  if (part.category === "fan") return <g {...common}>{[77, 137].map((cy) => <g key={cy}><circle cx="295" cy={cy} r="18" /><circle cx="295" cy={cy} r="5" /><path d={`M295 ${cy - 14}q12 8 0 14q-12-8 0-14M309 ${cy}q-8 12-14 0q8-12 14 0`} /></g>)}</g>;
  if (part.category === "gpu") {
    const length = typeof part.metadata.lengthMm === "number" ? Math.max(105, Math.min(185, 105 + (part.metadata.lengthMm - 170) * .28)) : z.w;
    return <g {...common}><rect x={z.x} y={z.y} width={installed ? length : z.w} height={z.h} rx="2" />{installed && <><circle cx={z.x + 45} cy={z.y + 19} r="13" /><circle cx={z.x + 99} cy={z.y + 19} r="13" /><path d={`M${z.x + 8} ${z.y + 7}h145M${z.x + 12} ${z.y + 31}h132`} /></>}</g>;
  }
  if (part.category === "ram") {
    const modules = installed ? Math.max(1, Math.min(4, Number(part.metadata.modules) || 1)) : 2;
    return <g {...common}>{Array.from({ length: modules }, (_, i) => <rect key={i} x={z.x + i * 9} y={z.y} width="6" height={z.h} rx="1" />)}</g>;
  }
  if (part.category === "cooler" && part.metadata.mode === "aio") return <g {...common}><rect x="268" y="45" width="52" height="137" rx="2" /><circle cx="139" cy="101" r="22" /><path d="M155 86C210 35 245 55 268 65M158 112c50 43 80 35 110 49" /></g>;
  return <g {...common}><rect x={z.x} y={z.y} width={z.w} height={z.h} rx="2" />{part.category === "mbo" && <path d="M80 57h67v-7m68 12h18v62m-151 65h42v10m47-32h62" />}{part.category === "cpu" && <><path d="M124 86h30v30h-30zM118 101h42" /><circle cx="139" cy="101" r="4" /></>}{part.category === "psu" && <><circle cx="286" cy="221" r="13" /><path d="M230 211h31M230 218h26M230 225h20" /></>}{part.category === "storage" && <path d="M222 75v43m0-32h12m-12 12h12m-12 12h12" />}</g>;
}

function Renderer({ model, onOpenCategory, compact = false }: Props & { compact?: boolean }) {
  const initial = model.parts.gpu || model.parts.mbo!;
  const [inspected, setInspected] = useState<VisualPart>(initial);
  const order: VisualCategory[] = ["case", "mbo", "cpu", "ram", "storage", "expansion", "gpu", "psu", "fan", "rgb", "cooler"];
  return <div className={`visual-renderer${compact ? " is-compact" : ""}`}>
    <svg viewBox="0 0 340 262" aria-label="Representación técnica del montaje" preserveAspectRatio="xMidYMid meet">
      <defs><pattern id="visual-grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M10 0H0V10" /></pattern></defs>
      <rect className="visual-grid" x="1" y="1" width="338" height="260" />
      {order.map((category) => { const part = model.parts[category]; return part ? <PartShape key={category} part={part} active={inspected.category === category} onInspect={() => setInspected(part)} onActivate={() => onOpenCategory(part.sourceCategory)} /> : null; })}
      <text className="visual-axis" x="18" y="244">SYSTEM FRAME{" // "}{model.installedCount.toString().padStart(2, "0")} ZONES ONLINE</text>
    </svg>
    {!compact && <div className={`visual-inspector is-${inspected.state}`} aria-live="polite"><span>{inspected.label}{" // "}{inspected.state}</span><strong>{inspected.name || "Esperando componentes"}</strong><small>{details(inspected) || inspected.reason || "Selecciona esta zona para abrir su categoría."}</small>{inspected.reason && <em>{inspected.reason}</em>}</div>}
  </div>;
}

export default function VisualBuild({ model, onOpenCategory }: Props) {
  const [expanded, setExpanded] = useState(false);
  useEffect(() => {
    if (!expanded) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setExpanded(false); };
    window.addEventListener("keydown", close);
    return () => { document.body.style.overflow = previous; window.removeEventListener("keydown", close); };
  }, [expanded]);
  return <section className="visual-build" aria-labelledby="visual-build-title">
    <header><div><span className="eyebrow">Visual build</span><h2 id="visual-build-title">Forge digital twin</h2></div><button className="btn visual-expand" onClick={() => setExpanded(true)}><Maximize2 size={11} /> Inspeccionar</button></header>
    <Renderer model={model} onOpenCategory={onOpenCategory} compact />
    <footer><span>{model.isEmpty ? "SYSTEM FRAME · Esperando componentes" : `${model.installedCount} zonas instaladas`}</span><i aria-hidden="true" /></footer>
    {expanded && createPortal(<div className="visual-modal" role="dialog" aria-modal="true" aria-labelledby="visual-modal-title"><div className="visual-modal-card"><header><div><span className="eyebrow">Forge visual build</span><h2 id="visual-modal-title">System assembly · live</h2></div><button className="btn" onClick={() => setExpanded(false)} aria-label="Cerrar Visual Build"><X size={14} /> Cerrar</button></header><Renderer model={model} onOpenCategory={(cat) => { setExpanded(false); onOpenCategory(cat); }} /></div></div>, document.body)}
  </section>;
}
