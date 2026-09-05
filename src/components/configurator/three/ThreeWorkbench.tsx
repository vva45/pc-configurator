"use client";
import { Canvas } from "@react-three/fiber";
import { Info, Layers, PanelLeftClose, PanelLeftOpen, RotateCcw, X } from "lucide-react";
import { useMemo, useState } from "react";
import { ACESFilmicToneMapping } from "three";
import type { CatId } from "@/data/parts/types";
import { createVisual3DScene, type Visual3DPart } from "@/lib/visual-3d";
import { getInitialVisualPart, type VisualBuildModel, type VisualCategory } from "@/lib/visual-build";
import ForgeScene from "./ForgeScene";
import { visualPartDetails, visualPartLabel, visualStateLabel } from "../visual-labels";

export default function ThreeWorkbench({ model, onOpenCategory }: { model: VisualBuildModel; onOpenCategory: (category: CatId) => void }) {
  const scene = useMemo(() => createVisual3DScene(model), [model]);
  const [selection, setSelection] = useState<{ category: VisualCategory; navigation?: CatId }>(() => ({ category: getInitialVisualPart(model).category, navigation: model.nextCategory }));
  const active = selection.navigation === model.nextCategory ? selection.category : getInitialVisualPart(model).category;
  const [hovered, setHovered] = useState<Visual3DPart>();
  const [resetSignal, setResetSignal] = useState(0);
  const [explode, setExplode] = useState(0);
  const [cutaway, setCutaway] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [showExplode, setShowExplode] = useState(false);
  const part = (hovered && model.parts[hovered.category]) || model.parts[active] || getInitialVisualPart(model);
  const scenePart = scene.parts.find((p) => p.category === part.category);
  return <div className={`three-workbench${showDetails ? " details-open" : ""}`}>
    <div className="three-stage" role="group" aria-label="Vista 3D interactiva del PC" data-no-tab-swipe>
      <Canvas data-testid="forge-3d-canvas" frameloop="demand" dpr={[1, 1.5]} shadows camera={{ fov: scene.camera.fov, near: 0.05, far: 60 }}
        gl={{ antialias: true, powerPreference: "high-performance", alpha: true, toneMapping: ACESFilmicToneMapping, toneMappingExposure: 1.05 }}>
        <ForgeScene scene={scene} active={hovered?.category || active} resetSignal={resetSignal} explode={explode} cutaway={cutaway} onHover={setHovered} onSelect={(selected) => { setSelection({ category: selected.category, navigation: model.nextCategory }); setShowDetails(true); }} />
      </Canvas>
      <div className="three-orbit" aria-hidden="true"><span>360°</span></div>
      <div className="three-stage-label">Arrastra para girar · Desplaza para acercar</div>
      <div className="three-tools">
        <button className="btn three-tool" title={cutaway ? "Cerrar lateral" : "Ver interior"} aria-label={cutaway ? "Cerrar lateral" : "Ver interior"} aria-pressed={cutaway} onClick={() => setCutaway((value) => !value)}>{cutaway ? <PanelLeftClose size={19} /> : <PanelLeftOpen size={19} />}</button>
        <div className="three-explode-control">
          <button className="btn three-tool" title="Separar las piezas" aria-label="Vista explosionada" aria-expanded={showExplode} onClick={() => setShowExplode((value) => !value)}><Layers size={19} /></button>
          {showExplode && <label className="three-explode"><span>Separar piezas</span><input type="range" min={0} max={1} step={0.01} value={explode} onChange={(e) => setExplode(Number(e.target.value))} aria-label="Separar las piezas" /></label>}
        </div>
        <button className="btn three-tool" title="Restablecer vista" aria-label="Restablecer vista 3D" onClick={() => { setResetSignal((v) => v + 1); setExplode(0); }}><RotateCcw size={19} /></button>
        <button className="btn three-tool" title="Detalles de la pieza" aria-label="Detalles de la pieza" aria-expanded={showDetails} onClick={() => setShowDetails((value) => !value)}><Info size={19} /></button>
      </div>
    </div>
    <aside className={`visual-inspector is-${part.state}`} aria-live="polite">
      <button className="inspector-close" aria-label="Cerrar detalles" onClick={() => setShowDetails(false)}><X size={15} /></button>
      <span>{visualPartLabel(part)}{" · "}{visualStateLabel[part.state]}</span>
      <strong>{part.name || "Zona preparada"}</strong>
      <small>{visualPartDetails(part) || "Selecciona una pieza compatible para esta zona."}</small>
      {scenePart?.overflow && <em>{scenePart.overflow}</em>}
      {part.reason && <em>{part.reason}</em>}
      {part.category !== "case" && <small className="three-dims">{model.parts.case?.metadata.dimensions ? `Caja · ${model.parts.case.metadata.dimensions} (catálogo)` : "Caja de referencia · medidas aproximadas"}</small>}
      <button className="btn" onClick={() => onOpenCategory(part.sourceCategory)}>Elegir {visualPartLabel(part)}</button>
    </aside>
  </div>;
}
