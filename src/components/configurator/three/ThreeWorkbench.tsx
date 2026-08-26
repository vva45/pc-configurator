"use client";
import { Canvas } from "@react-three/fiber";
import { RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";
import type { CatId } from "@/data/parts/types";
import { createVisual3DScene, type Visual3DPart } from "@/lib/visual-3d";
import { getInitialVisualPart, type VisualBuildModel, type VisualCategory } from "@/lib/visual-build";
import ForgeScene from "./ForgeScene";

export default function ThreeWorkbench({ model, onOpenCategory }: { model: VisualBuildModel; onOpenCategory: (category: CatId) => void }) {
 const scene = useMemo(() => createVisual3DScene(model), [model]); const [active, setActive] = useState<VisualCategory>(() => getInitialVisualPart(model).category); const [hovered, setHovered] = useState<Visual3DPart>(); const [resetSignal, setResetSignal] = useState(0); const part = hovered?.source || model.parts[active] || getInitialVisualPart(model);
 return <div className="three-workbench"><div className="three-stage" role="img" aria-label="Vista 3D interactiva del PC"><Canvas frameloop="demand" dpr={[1, 1.6]} shadows={false} camera={{ position: scene.camera.position, fov: 35 }} gl={{ antialias: true, powerPreference: "high-performance", alpha: true }}><ForgeScene scene={scene} active={hovered?.category || active} resetSignal={resetSignal} onHover={setHovered} onSelect={(selected) => setActive(selected.category)} /></Canvas><div className="three-stage-label">ORBIT · DRAG / ZOOM · PINCH</div><button className="btn three-reset" onClick={() => setResetSignal(v => v + 1)} aria-label="Restablecer vista 3D"><RotateCcw size={13}/> Reset view</button></div><aside className={`visual-inspector is-${part.state}`} aria-live="polite"><span>{part.label}{" // "}{part.state}</span><strong>{part.name || "Zona preparada"}</strong><small>{Object.entries(part.metadata).filter(([,v]) => v !== undefined).map(([k,v]) => `${k}: ${v}`).join(" · ") || "Componente fantasma. Selecciona una opción compatible."}</small>{part.reason && <em>{part.reason}</em>}<button className="btn" onClick={() => onOpenCategory(part.sourceCategory)}>Abrir {part.label}</button></aside></div>;
}
