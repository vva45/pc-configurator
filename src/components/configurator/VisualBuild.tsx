"use client";

import { Component, useEffect, useId, useRef, useState, type ErrorInfo, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { createPortal } from "react-dom";
import { Box, Maximize2, X } from "lucide-react";
import type { CatId } from "@/data/parts/types";
import { getAioSchematicGeometry } from "@/lib/aio-schematic";
import { getInitialVisualPart, type VisualBuildModel, type VisualCategory, type VisualPart } from "@/lib/visual-build";
import { dimmPopulation } from "@/lib/visual-3d";
import { createVisualHardwareProfile, type VisualHardwareProfile } from "@/lib/visual-hardware-profile";

interface Props { model: VisualBuildModel; onOpenCategory: (category: CatId) => void; }
const ThreeWorkbench = dynamic(() => import("./three/ThreeWorkbench"), { ssr: false });
class ThreeBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error("Forge 3D renderer failed", error, info.componentStack); }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}
function supportsWebGL() { try { const canvas = document.createElement("canvas"); return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl")); } catch { return false; } }

const ZONES: Record<VisualCategory, { x: number; y: number; w: number; h: number }> = {
  case: { x: 12, y: 10, w: 316, h: 240 }, mbo: { x: 72, y: 47, w: 170, h: 160 },
  cpu: { x: 118, y: 80, w: 42, h: 42 }, ram: { x: 170, y: 68, w: 38, h: 76 },
  gpu: { x: 90, y: 151, w: 166, h: 38 }, cooler: { x: 111, y: 73, w: 57, h: 63 },
  storage: { x: 198, y: 62, w: 44, h: 78 }, psu: { x: 218, y: 202, w: 90, h: 38 },
  fan: { x: 274, y: 56, w: 42, h: 118 }, rgb: { x: 31, y: 28, w: 9, h: 196 },
  expansion: { x: 83, y: 197, w: 116, h: 16 },
};

function details(part: VisualPart) {
  /* Las claves compuestas (listas de discos, anclajes, tamaños de ventilador) ya se leen en su sitio; aquí serían JSON crudo. */
  const entries = Object.entries(part.metadata).filter(([key, value]) => value !== undefined && !/drives|radiatorMounts|fanSizes/.test(key));
  return entries.map(([key, value]) => `${key}: ${value}`).join(" · ");
}

function PartShape({ part, profile, active, onActivate, onInspect }: { part: VisualPart; profile: VisualHardwareProfile; active: boolean; onActivate: () => void; onInspect: () => void }) {
  const z = ZONES[part.category];
  const installed = part.state !== "empty" && part.state !== "next";
  const cls = `visual-part visual-part-${part.category} is-${part.state}${active ? " is-active" : ""}`;
  const common = { className: cls, style: { "--hardware-primary": profile.primaryColor, "--hardware-secondary": profile.secondaryColor, "--hardware-accent": profile.accentColor } as React.CSSProperties, role: "button", tabIndex: 0, "aria-label": `${part.label}: ${part.name || "vacío"}`, onClick: onActivate, onFocus: onInspect, onMouseEnter: onInspect, onKeyDown: (event: React.KeyboardEvent<SVGGElement>) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onActivate(); } } };
  if (part.category === "fan") return <g {...common}>{[77, 137].map((cy) => <g key={cy}><circle cx="295" cy={cy} r="18" /><circle cx="295" cy={cy} r="5" /><path d={`M295 ${cy - 14}q12 8 0 14q-12-8 0-14M309 ${cy}q-8 12-14 0q8-12 14 0`} /></g>)}</g>;
  if (part.category === "gpu") {
    const length = typeof part.metadata.lengthMm === "number" ? Math.max(105, Math.min(185, 105 + (part.metadata.lengthMm - 170) * .28)) : z.w;
    const plugs = part.metadata.hpwr ? [16] : [...Array(Number(part.metadata.conn8 || 0)).fill(8), ...Array(Number(part.metadata.conn6 || 0)).fill(6)].slice(0, 3);
    const connectorReserve = plugs.length ? Math.min(42, plugs.length * 12 + 5) : 8;
    const labelAreaWidth = Math.max(42, length - connectorReserve - 18);
    const labelWidth = Math.min(58, labelAreaWidth);
    return <g {...common}><path className="visual-solid" d={`M${z.x} ${z.y + 4}h${length - 12}l12 8v${z.h - 12}H${z.x}z`} />{installed && <><path className="visual-gpu-profile" d={`M${z.x + 7} ${z.y + 11}h${length - 27}m-${length - 27} 17h${length - 12}M${z.x + 13} ${z.y + 15}v9m8-9v9`} />{plugs.map((pins, i) => { const width = pins === 16 ? 11 : 9; const x = z.x + length - 18 - i * 12; return <g className="visual-gpu-power" key={`${pins}-${i}`}><rect x={x} y={z.y - 3} width={width} height="8" rx="1"/><path d={`M${x + 2} ${z.y + 1}h${width - 4}`} /><text x={x + width / 2} y={z.y + 2.5} textAnchor="middle">{pins}</text></g>; })}<text className={`visual-gpu-label is-${part.metadata.vendor}`} x={z.x + 10 + labelAreaWidth / 2} y={z.y + 23} textAnchor="middle" textLength={labelWidth} lengthAdjust="spacingAndGlyphs">{String(part.metadata.family || "GPU")}</text></>}</g>;
  }
  if (part.category === "ram") {
    const modules = installed ? Math.max(1, Math.min(4, Number(part.metadata.modules) || 1)) : 2;
    /* Mismo criterio que el 3D: dos módulos en los zócalos 2 y 4, uno en el más lejano de la CPU. */
    const used = new Set(dimmPopulation(4, modules));
    return <g {...common}>{[0, 1, 2, 3].map((i) => <rect key={i} x={z.x + i * 9} y={z.y} width="6" height={z.h} rx="1" opacity={used.has(i) ? 1 : 0.28} strokeDasharray={used.has(i) ? undefined : "2 2"} />)}</g>;
  }
  if (part.category === "cooler" && part.metadata.mode === "aio") {
    const geometry = getAioSchematicGeometry(part.metadata.radiatorMm);
    // One physical scale is shared by every size and is limited by the 420 mm
    // radiator. This preserves the visible 120/140 mm width difference.
    const scale = 147 / getAioSchematicGeometry(420).radiatorLength;
    const x = 294 - geometry.radiatorWidth * scale / 2;
    const y = 113.5 - geometry.radiatorLength * scale / 2;
    const portX = x;
    const firstPortY = y + geometry.endTankMargin * scale * .35;
    const secondPortY = y + geometry.endTankMargin * scale * .72;
    const fanRadius = geometry.fanDiameter / 2;
    const fins = Math.floor((geometry.radiatorLength - geometry.endTankMargin * 2) / 9);
    return <g {...common}>
      <g className="visual-aio" transform={`translate(${x} ${y}) scale(${scale})`}>
        <rect className="visual-radiator" width={geometry.radiatorWidth} height={geometry.radiatorLength} rx="6" />
        <g className="visual-radiator-fins">{Array.from({ length: fins }, (_, index) => <path key={index} d={`M5 ${geometry.endTankMargin + 4 + index * 9}h${geometry.radiatorWidth - 10}`} />)}</g>
        <rect className="visual-end-tank" x="2" y="2" width={geometry.radiatorWidth - 4} height={geometry.endTankMargin - 2} rx="3" />
        <rect className="visual-end-tank" x="2" y={geometry.radiatorLength - geometry.endTankMargin} width={geometry.radiatorWidth - 4} height={geometry.endTankMargin - 2} rx="3" />
        {geometry.fanCenters.map((center) => <g className="visual-radiator-fan" key={center}>
          <rect x="3" y={center - fanRadius} width={geometry.fanDiameter} height={geometry.fanDiameter} rx="7" />
          <circle cx={geometry.radiatorWidth / 2} cy={center} r={fanRadius - 4} />
          <circle className="visual-fan-ring" cx={geometry.radiatorWidth / 2} cy={center} r={fanRadius - 12} />
          {[0, 60, 120, 180, 240, 300].map((angle) => <path key={angle} transform={`rotate(${angle} ${geometry.radiatorWidth / 2} ${center})`} d={`M${geometry.radiatorWidth / 2} ${center - 7}C${geometry.radiatorWidth / 2 + 13} ${center - fanRadius + 13},${geometry.radiatorWidth / 2 + fanRadius - 9} ${center - fanRadius / 2},${geometry.radiatorWidth / 2 + 10} ${center + 3}Z`} />)}
          <circle className="visual-fan-hub" cx={geometry.radiatorWidth / 2} cy={center} r="10" />
        </g>)}
      </g>
      <circle className="visual-pump" cx="139" cy="101" r="23" /><circle className="visual-pump" cx="139" cy="101" r="17" />
      <path className="visual-tube" d={`M157 87C205 42 239 ${firstPortY} ${portX} ${firstPortY}M158 115C205 145 239 ${secondPortY} ${portX} ${secondPortY}`} />
      <rect className="visual-hit" x="258" y="36" width="72" height="155" />
    </g>;
  }
  if (part.category === "storage" && installed) { const drives = JSON.parse(String(part.metadata.drives || "[]")) as Array<{type:string;capacity:string}>; return <g {...common}>{drives.slice(0,4).map((drive,i) => drive.type === "M.2" ? <g className="visual-m2" key={i}><rect x={198-i*4} y={63+i*19} width="42" height="14" rx="1.5"/><circle cx={236-i*4} cy={70+i*19} r="1.7"/><path className="visual-m2-contact" d={`M${198-i*4} ${66+i*19}h6v8h-6z`}/><text className="visual-capacity" x={220-i*4} y={72+i*19} textAnchor="middle" textLength="20" lengthAdjust="spacingAndGlyphs">{drive.capacity}</text></g> : <g key={i}><rect x={207-i*4} y={64+i*20} width="33" height="18" rx="2"/><text className="visual-capacity" x={223.5-i*4} y={76+i*20} textAnchor="middle" textLength="22" lengthAdjust="spacingAndGlyphs">{drive.capacity}</text></g>)}</g>; }
  return <g {...common}><rect x={z.x} y={z.y} width={z.w} height={z.h} rx="2" />{part.category === "mbo" && <path d="M80 57h67v-7m68 12h18v62m-151 65h42v10m47-32h62" />}{part.category === "cpu" && <><path d="M124 86h30v30h-30zM118 101h42" /><circle cx="139" cy="101" r="4" /><rect className="visual-hit" x="120" y="82" width="38" height="38" /></>}{part.category === "psu" && <><circle cx="276" cy="221" r="15" /><circle cx="276" cy="221" r="10"/><path d="M261 221h30m-15-15v30M229 210h20v10h-20zM232 225h13v7h-13z" /></>}{part.category === "storage" && <path d="M222 75v43m0-32h12m-12 12h12m-12 12h12" />}</g>;
}

function Renderer({ model, onOpenCategory, compact = false }: Props & { compact?: boolean }) {
  const gridId = `visual-grid-${useId().replace(/:/g, "")}`;
  const [inspectedCategory, setInspectedCategory] = useState<VisualCategory>(() => getInitialVisualPart(model).category);
  const inspected = model.parts[inspectedCategory] || getInitialVisualPart(model);
  const order: VisualCategory[] = ["case", "mbo", "ram", "storage", "expansion", "gpu", "psu", "fan", "rgb", "cooler", "cpu"];
  const motherboardProfile = createVisualHardwareProfile(model.parts.mbo!);
  return <div className={`visual-renderer${compact ? " is-compact" : ""}`}>
    <svg viewBox="0 0 340 262" aria-label="Representación técnica del montaje" preserveAspectRatio="xMidYMid meet">
      <defs><pattern id={gridId} width="10" height="10" patternUnits="userSpaceOnUse"><path d="M10 0H0V10" /></pattern></defs>
      <rect className="visual-grid" style={{ fill: `url(#${gridId})` }} x="1" y="1" width="338" height="260" />
      {order.map((category) => { const part = model.parts[category]; return part ? <PartShape key={category} part={part} profile={createVisualHardwareProfile(part, motherboardProfile)} active={inspected.category === category} onInspect={() => setInspectedCategory(part.category)} onActivate={() => onOpenCategory(part.sourceCategory)} /> : null; })}
      <text className="visual-axis" x="18" y="244">SYSTEM FRAME{" // "}{model.installedCount.toString().padStart(2, "0")} ZONES ONLINE</text>
    </svg>
    {!compact && <div className={`visual-inspector is-${inspected.state}`} aria-live="polite"><span>{inspected.label}{" // "}{inspected.state}</span><strong>{inspected.name || "Esperando componentes"}</strong><small>{details(inspected) || inspected.reason || "Selecciona esta zona para abrir su categoría."}</small>{inspected.reason && <em>{inspected.reason}</em>}</div>}
  </div>;
}

export default function VisualBuild({ model, onOpenCategory }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [mode, setMode] = useState<"3d" | "schema">("3d");
  const [webgl, setWebgl] = useState<boolean>();
  const openButton = useRef<HTMLButtonElement>(null);
  const modal = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!expanded) return;
    const opener = openButton.current;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); setExpanded(false); return; }
      if (event.key !== "Tab") return;
      const focusable = Array.from(modal.current?.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])') || [])
        .filter((element) => !element.hasAttribute("disabled"));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", handleKey);
      opener?.focus();
    };
  }, [expanded]);
  return <section className="visual-build" aria-labelledby="visual-build-title">
    <header><div><span className="eyebrow">Visual build</span><h2 id="visual-build-title">Forge digital twin</h2></div><button ref={openButton} className="btn visual-expand" onClick={() => { setWebgl(supportsWebGL()); setExpanded(true); }}><Maximize2 size={11} /> Inspeccionar</button></header>
    <Renderer model={model} onOpenCategory={onOpenCategory} compact />
    <footer><span>{model.isEmpty ? "SYSTEM FRAME · Esperando componentes" : `${model.installedCount} zonas instaladas`}</span><i aria-hidden="true" /></footer>
    {expanded && createPortal(<div ref={modal} className="visual-modal" role="dialog" aria-modal="true" aria-labelledby="visual-modal-title"><div className="visual-modal-card"><header><div><span className="eyebrow">Forge visual build</span><h2 id="visual-modal-title">3D Workbench · live</h2></div><div className="visual-modal-actions" role="group" aria-label="Modo de visualización"><button className={`btn${mode === "3d" ? " is-active" : ""}`} aria-pressed={mode === "3d"} onClick={() => setMode("3d")}><Box size={13}/> 3D</button><button className={`btn${mode === "schema" ? " is-active" : ""}`} aria-pressed={mode === "schema"} onClick={() => setMode("schema")}>Esquema</button><button ref={closeButton} className="btn" onClick={() => setExpanded(false)} aria-label="Cerrar Visual Build"><X size={14} /> Cerrar</button></div></header>{mode === "3d" && webgl ? <ThreeBoundary fallback={<div className="three-fallback"><p>Vista 3D no disponible en este dispositivo.</p><Renderer model={model} onOpenCategory={onOpenCategory} /></div>}><ThreeWorkbench model={model} onOpenCategory={(cat) => { setExpanded(false); onOpenCategory(cat); }} /></ThreeBoundary> : <div className={mode === "3d" ? "three-fallback" : undefined}>{mode === "3d" && <p>Vista 3D no disponible en este dispositivo.</p>}<Renderer model={model} onOpenCategory={(cat) => { setExpanded(false); onOpenCategory(cat); }} /></div>}</div></div>, document.body)}
  </section>;
}
