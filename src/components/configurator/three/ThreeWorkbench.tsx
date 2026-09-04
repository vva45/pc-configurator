"use client";
import { Canvas } from "@react-three/fiber";
import { Layers, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { ACESFilmicToneMapping } from "three";
import type { CatId } from "@/data/parts/types";
import { createVisual3DScene, type Visual3DPart } from "@/lib/visual-3d";
import { getInitialVisualPart, type VisualBuildModel, type VisualCategory } from "@/lib/visual-build";
import ForgeScene from "./ForgeScene";

export default function ThreeWorkbench({ model, onOpenCategory }: { model: VisualBuildModel; onOpenCategory: (category: CatId) => void }) {
  const scene = useMemo(() => createVisual3DScene(model), [model]);
  const [active, setActive] = useState<VisualCategory>(() => getInitialVisualPart(model).category);
  const [hovered, setHovered] = useState<Visual3DPart>();
  const [resetSignal, setResetSignal] = useState(0);
  const [explode, setExplode] = useState(0);
  const part = hovered?.source || model.parts[active] || getInitialVisualPart(model);
  const scenePart = scene.parts.find((p) => p.category === part.category);
  const L = scene.layout;
  return <div className="three-workbench">
    <div className="three-stage" role="img" aria-label={`Vista 3D interactiva del PC, chasis ${L.family}`} data-no-tab-swipe>
      <Canvas data-testid="forge-3d-canvas" frameloop="demand" dpr={[1, 2]} shadows camera={{ fov: scene.camera.fov, near: 0.05, far: 60 }}
        gl={{ antialias: true, powerPreference: "high-performance", alpha: true, toneMapping: ACESFilmicToneMapping, toneMappingExposure: 1.05 }}>
        <ForgeScene scene={scene} active={hovered?.category || active} resetSignal={resetSignal} explode={explode} onHover={setHovered} onSelect={(selected) => setActive(selected.category)} />
      </Canvas>
      <div className="three-stage-label">ORBIT · DRAG / ZOOM · PINCH</div>
      <div className="three-tools">
        <label className="three-explode" title="Vista explosionada"><Layers size={12} aria-hidden="true" /><input type="range" min={0} max={1} step={0.01} value={explode} onChange={(e) => setExplode(Number(e.target.value))} aria-label="Separar las piezas" /></label>
        <button className="btn three-reset" onClick={() => { setResetSignal((v) => v + 1); setExplode(0); }} aria-label="Restablecer vista 3D"><RotateCcw size={13} /> Reset view</button>
      </div>
    </div>
    <aside className={`visual-inspector is-${part.state}`} aria-live="polite">
      <span>{part.label}{" // "}{part.state}</span>
      <strong>{part.name || "Zona preparada"}</strong>
      <small>{Object.entries(part.metadata).filter(([k, v]) => v !== undefined && !/drives|radiatorMounts|fanSizes/.test(k)).map(([k, v]) => `${k}: ${v}`).join(" · ") || "Componente fantasma. Selecciona una opción compatible."}</small>
      {scenePart?.overflow && <em>{scenePart.overflow}</em>}
      {part.reason && <em>{part.reason}</em>}
      <small className="three-dims">{`${L.board.form} · chasis ${Math.round(L.size[2])}×${Math.round(L.size[0])}×${Math.round(L.size[1])} mm`}</small>
      <button className="btn" onClick={() => onOpenCategory(part.sourceCategory)}>Abrir {part.label}</button>
    </aside>
  </div>;
}
