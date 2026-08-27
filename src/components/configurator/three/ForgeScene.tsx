"use client";

import { ContactShadows, OrbitControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { CatmullRomCurve3, MathUtils, PerspectiveCamera, Vector3 } from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type { Vector3Tuple, Visual3DPart, Visual3DScene } from "@/lib/visual-3d";
import type { VisualCategory } from "@/lib/visual-build";

const accents = { empty: "#315543", installed: "#000000", next: "#dfb85e", warning: "#e3a83c", conflict: "#e05a48" } as const;

function Material({ part, active, color = part.profile.primaryColor, metalness = part.profile.metalness, roughness = part.profile.roughness }: { part: Visual3DPart; active: boolean; color?: string; metalness?: number; roughness?: number }) {
  const ghost = part.state === "empty" || part.state === "next";
  const accent = active ? "#dfb85e" : accents[part.state];
  return <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} transparent={ghost} opacity={ghost ? .16 : 1} wireframe={part.state === "empty"} emissive={accent} emissiveIntensity={active ? .22 : part.state === "installed" ? 0 : .09} />;
}

function Interactive({ part, children, onSelect, onHover }: { part: Visual3DPart; children: React.ReactNode; onSelect: (part: Visual3DPart) => void; onHover: (part?: Visual3DPart) => void }) {
  return <group position={part.position} onClick={(event) => { event.stopPropagation(); onSelect(part); }} onPointerOver={(event) => { event.stopPropagation(); document.body.style.cursor = "pointer"; onHover(part); }} onPointerOut={() => { document.body.style.cursor = ""; onHover(); }}>{children}</group>;
}

function Fan({ part, active, radius = .32, axis = "x" }: { part: Visual3DPart; active: boolean; radius?: number; axis?: "x" | "y" | "z" }) {
  const rotation: Vector3Tuple = axis === "x" ? [0, 0, Math.PI / 2] : axis === "z" ? [Math.PI / 2, 0, 0] : [0, 0, 0];
  return <group rotation={rotation}><mesh><cylinderGeometry args={[radius, radius, .085, 32]} /><Material part={part} active={active} color="#222a26" /></mesh><mesh position={[0, .047, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[radius * .7, .026, 8, 28]} /><meshStandardMaterial color="#8b9891" metalness={.46} roughness={.42} /></mesh></group>;
}

function Tubes({ part, active }: { part: Visual3DPart; active: boolean }) {
  const paths = useMemo(() => [-.065, .065].map((offset) => new CatmullRomCurve3((part.tubePath || []).map((point) => new Vector3(point[0] - part.position[0], point[1] - part.position[1], point[2] - part.position[2] + offset)))), [part]);
  return <>{paths.map((curve, index) => <mesh key={index}><tubeGeometry args={[curve, 36, .043, 10, false]} /><Material part={part} active={active} color="#111714" roughness={.86} /></mesh>)}</>;
}

function Radiator({ part, active }: { part: Visual3DPart; active: boolean }) {
  const [width, height, depth] = part.size;
  const length = part.mount === "top" ? depth : height;
  const spacing = length / part.instances;
  const radius = Math.min((part.mount === "side" ? depth : width) * .43, spacing * .44);
  return <group><mesh><boxGeometry args={part.size} /><Material part={part} active={active} color="#252c28" /></mesh>{Array.from({ length: part.instances }, (_, index) => {
    const offset = (index - (part.instances - 1) / 2) * spacing;
    const position: Vector3Tuple = part.mount === "top" ? [0, -height / 2 - .048, offset] : part.mount === "front" ? [0, offset, -depth / 2 - .048] : [width / 2 + .048, offset, 0];
    const axis = part.mount === "top" ? "y" : part.mount === "front" ? "z" : "x";
    return <group key={index} position={position}><Fan part={part} active={active} radius={radius} axis={axis} /></group>;
  })}</group>;
}

function Component({ part, active }: { part: Visual3DPart; active: boolean }) {
  if (part.kind === "motherboard") return <group><mesh><boxGeometry args={part.size} /><Material part={part} active={active} /></mesh><mesh position={[.075, part.size[1] * .29, -part.size[2] * .38]}><boxGeometry args={[.06, .58, .28]} /><Material part={part} active={active} color={part.profile.secondaryColor} /></mesh><mesh position={[.075, -part.size[1] * .35, 0]}><boxGeometry args={[.06, .16, part.size[2] * .68]} /><Material part={part} active={active} color="#b29a5b" /></mesh></group>;
  if (part.kind === "cpu") return <mesh><boxGeometry args={part.size} /><Material part={part} active={active} color="#d9dedb" metalness={.92} roughness={.18} /></mesh>;
  if (part.kind === "ram") return <>{Array.from({ length: part.instances }, (_, index) => <mesh key={index} position={[0, 0, (index - (part.instances - 1) / 2) * .15]}><boxGeometry args={[part.size[0], part.size[1], .1]} /><Material part={part} active={active} /></mesh>)}</>;
  if (part.kind === "gpu") return <group><mesh><boxGeometry args={part.size} /><Material part={part} active={active} /></mesh><mesh position={[-part.size[0] / 2 - .035, 0, -part.size[2] / 2 + .06]}><boxGeometry args={[.07, part.size[1] * .9, .12]} /><meshStandardMaterial color="#b2bbb6" metalness={.82} roughness={.25} /></mesh><mesh position={[0, -part.size[1] / 2 - .025, 0]}><boxGeometry args={[.08, .05, part.size[2] * .82]} /><meshStandardMaterial color="#c4a956" metalness={.8} roughness={.3} /></mesh></group>;
  if (part.kind === "air-cooler") return <group><mesh><boxGeometry args={[.78, part.size[1], .72]} /><Material part={part} active={active} color="#59625d" /></mesh><group position={[0, 0, .42]}><Fan part={part} active={active} axis="z" radius={.34} /></group></group>;
  if (part.kind === "aio") return <><Radiator part={part} active={active} /><Tubes part={part} active={active} /><group position={part.connectionTarget!.map((value, index) => value - part.position[index]) as Vector3Tuple}><mesh rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[.27, .27, .17, 28]} /><Material part={part} active={active} /></mesh></group></>;
  if (part.kind === "m2") return <>{Array.from({ length: part.instances }, (_, index) => <group key={index} position={[0, -index * .28, index * .14]}><mesh><boxGeometry args={part.size} /><Material part={part} active={active} color="#244936" /></mesh><mesh position={[part.size[0] / 2 + .012, 0, -part.size[2] * .43]}><boxGeometry args={[.02, .2, .09]} /><meshStandardMaterial color="#dfb85e" metalness={.75} /></mesh></group>)}</>;
  if (part.kind === "psu") return <mesh><boxGeometry args={part.size} /><Material part={part} active={active} /></mesh>;
  if (part.kind === "fan") return <>{Array.from({ length: part.instances }, (_, index) => <group key={index} position={[0, (index - (part.instances - 1) / 2) * .72, 0]}><Fan part={part} active={active} axis="z" /></group>)}</>;
  return <mesh><boxGeometry args={part.size} /><Material part={part} active={active} /></mesh>;
}

function Chassis({ scene }: { scene: Visual3DScene }) {
  const [width, height, depth] = scene.layout.size; const thickness = .08; const airflow = scene.layout.family === "airflow";
  const metal = <meshStandardMaterial color="#35423b" metalness={.66} roughness={.48} />;
  return <group>
    <mesh position={[scene.layout.tray[0], 0, 0]}><boxGeometry args={[thickness, height * .91, depth * .9]} /><meshStandardMaterial color="#26382e" roughness={.62} /></mesh>
    <mesh position={[0, -height / 2 + thickness / 2, 0]}><boxGeometry args={[width, thickness, depth]} />{metal}</mesh>
    <mesh position={[0, height / 2 - thickness / 2, 0]}><boxGeometry args={[width, thickness, depth]} />{metal}</mesh>
    <mesh position={[0, 0, -depth / 2 + thickness / 2]}><boxGeometry args={[width, height, thickness]} />{metal}</mesh>
    <mesh position={[0, 0, depth / 2 - thickness / 2]}><boxGeometry args={[width, height, thickness]} /><meshPhysicalMaterial color={airflow ? "#668271" : "#3e5147"} transparent opacity={airflow ? .22 : .13} roughness={.45} /></mesh>
    {scene.layout.family === "dual-chamber" && <mesh position={[scene.layout.interior.min[0] + .32, -height * .32, -depth * .1]}><boxGeometry args={[.55, height * .26, depth * .68]} /><meshStandardMaterial color="#1e2a24" roughness={.54} /></mesh>}
    <mesh position={[width / 2 - thickness / 2, 0, 0]}><boxGeometry args={[thickness, height * .94, depth * .94]} /><meshPhysicalMaterial color="#9ac0ad" transparent opacity={.105} roughness={.1} transmission={.58} depthWrite={false} /></mesh>
  </group>;
}

export default function ForgeScene({ scene, active, onSelect, onHover, resetSignal }: { scene: Visual3DScene; active?: VisualCategory; onSelect: (part: Visual3DPart) => void; onHover: (part?: Visual3DPart) => void; resetSignal: number }) {
  const controls = useRef<OrbitControlsImpl>(null); const { camera, size, invalidate } = useThree();
  useEffect(() => {
    if (!(camera instanceof PerspectiveCamera)) return;
    const [width, height, depth] = scene.layout.size; const radius = Math.hypot(width, height, depth) / 2;
    const verticalFov = MathUtils.degToRad(camera.fov); const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * camera.aspect);
    const distance = radius / Math.sin(Math.min(verticalFov, horizontalFov) / 2) * 1.03;
    camera.position.copy(new Vector3(...scene.focusTarget)).addScaledVector(new Vector3(1.28, .52, 1.42).normalize(), distance);
    camera.near = Math.max(.05, distance - radius * 1.4); camera.far = distance + radius * 5; camera.updateProjectionMatrix();
    controls.current?.target.set(...scene.focusTarget); controls.current?.update(); invalidate();
  }, [camera, invalidate, resetSignal, scene, size.width, size.height]);
  const renderedParts = scene.parts.filter((part) => !(["fan", "rgb", "expansion"] as Visual3DPart["kind"][]).includes(part.kind) || part.state === "installed" || part.state === "warning" || part.state === "conflict");
  return <><ambientLight intensity={1.55} color="#e5eee8" /><hemisphereLight args={["#dff4e8", "#294435", 2.05]} /><directionalLight position={[5, 7, 6]} intensity={3.1} color="#fff0cf" /><directionalLight position={[-3, 2, 5]} intensity={2.15} color="#86d4b8" /><pointLight position={[1.4, .8, .8]} intensity={2.5} distance={9} color="#b7e0ca" /><Chassis scene={scene} />{renderedParts.map((part) => <Interactive key={part.id} part={part} onSelect={onSelect} onHover={onHover}><Component part={part} active={active === part.category} /></Interactive>)}<ContactShadows position={[0, scene.bounds.min[1] - .05, 0]} opacity={.3} scale={8} blur={2.8} far={6} frames={1} /><OrbitControls ref={controls} makeDefault minDistance={scene.camera.minDistance} maxDistance={scene.camera.maxDistance} minPolarAngle={.4} maxPolarAngle={1.65} minAzimuthAngle={-.15} maxAzimuthAngle={1.45} enablePan={false} onChange={() => invalidate()} /></>;
}
