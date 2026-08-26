"use client";
import { ContactShadows, OrbitControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { Box3, CatmullRomCurve3, MathUtils, PerspectiveCamera, Sphere, Vector3 } from "three";
import type { Group } from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type { Visual3DPart, Visual3DScene } from "@/lib/visual-3d";
import type { VisualCategory } from "@/lib/visual-build";

const stateAccent = { empty: "#315543", installed: "#000000", next: "#dfb85e", warning: "#e3a83c", conflict: "#e05a48" } as const;
function Material({ part, active, color = part.profile.primaryColor, metalness = part.profile.metalness, roughness = part.profile.roughness }: { part: Visual3DPart; active: boolean; color?: string; metalness?: number; roughness?: number }) {
  const ghost = part.state === "empty" || part.state === "next";
  const accent = active ? "#dfb85e" : stateAccent[part.state];
  return <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} transparent={ghost} opacity={ghost ? .24 : 1} wireframe={part.state === "empty"} emissive={accent} emissiveIntensity={active ? .32 : part.state === "installed" ? 0 : .18} />;
}
function Interactive({ part, children, onSelect, onHover }: { part: Visual3DPart; children: React.ReactNode; onSelect: (p: Visual3DPart) => void; onHover: (p?: Visual3DPart) => void }) {
  return <group position={part.position} rotation={part.rotation} scale={part.scale} onClick={(e) => { e.stopPropagation(); onSelect(part); }} onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = "pointer"; onHover(part); }} onPointerOut={() => { document.body.style.cursor = ""; onHover(); }}>{children}</group>;
}
function Fan({ part, active, radius = .34 }: { part: Visual3DPart; active: boolean; radius?: number }) {
  return <group><mesh><cylinderGeometry args={[radius, radius, .12, 20]} /><Material part={part} active={active} color="#171b19" /></mesh><mesh position={[0, 0, .075]}><torusGeometry args={[radius * .66, .025, 7, 20]} /><meshStandardMaterial color="#747c77" metalness={.5} roughness={.5} /></mesh><mesh position={[0,0,.105]}><cylinderGeometry args={[.07,.07,.035,16]} /><meshStandardMaterial color="#303633" /></mesh></group>;
}
function Tubes({ part, active }: { part: Visual3DPart; active: boolean }) {
  const curves = useMemo(() => [-.1, .1].map((offset) => new CatmullRomCurve3([new Vector3(-.82 + offset, -.08, .05), new Vector3(-1.25 + offset, -.35, .25), new Vector3(-1.48 + offset, -.75, .42), new Vector3(-1.42 + offset, -1.05, .62)])), []);
  return <>{curves.map((curve, i) => <mesh key={i}><tubeGeometry args={[curve, 18, .045, 7, false]} /><Material part={part} active={active} color="#090b0a" metalness={.05} roughness={.8} /></mesh>)}</>;
}
function ComponentMesh({ part, active }: { part: Visual3DPart; active: boolean }) {
  if (part.kind === "fan") return <>{Array.from({ length: part.instances }, (_, i) => <group key={i} position={[0, (i - (part.instances - 1) / 2) * .78, 0]} rotation={[0, Math.PI / 2, 0]}><Fan part={part} active={active} /></group>)}</>;
  if (part.kind === "ram") return <>{Array.from({ length: part.instances }, (_, i) => <mesh key={i} position={[(i - (part.instances - 1) / 2) * .15, 0, 0]}><boxGeometry args={[.09, 1.05, .3]} /><Material part={part} active={active} /></mesh>)}</>;
  if (part.kind === "motherboard") return <group><mesh><boxGeometry args={[2.45,2.9,.12]} /><Material part={part} active={active} /></mesh><mesh position={[-.65,.85,.09]}><boxGeometry args={[.75,.5,.08]} /><Material part={part} active={active} color={part.profile.secondaryColor} /></mesh><mesh position={[.62,-.45,.09]}><boxGeometry args={[.62,1.1,.08]} /><Material part={part} active={active} color={part.profile.secondaryColor} /></mesh></group>;
  if (part.kind === "cpu") return <group><mesh><boxGeometry args={[1,1,1]} /><Material part={part} active={active} /></mesh><mesh position={[0,0,-.52]}><boxGeometry args={[1.12,1.12,.08]} /><Material part={part} active={active} color="#202523" /></mesh></group>;
  if (part.kind === "gpu") return <group><mesh><boxGeometry args={[2.8, .58, .72]} /><Material part={part} active={active} /></mesh>{[0,1,2].map(i => <group key={i} position={[-.82 + i * .82, 0, .38]} rotation={[Math.PI / 2, 0, 0]}><Fan part={part} active={active} /></group>)}<mesh position={[0,-.305,.1]}><boxGeometry args={[2.25,.035,.18]} /><Material part={part} active={active} color={part.profile.accentColor} /></mesh>{Array.from({length: part.metadata.hpwr ? 1 : Math.min(3, Number(part.metadata.conn8 || 0) + Number(part.metadata.conn6 || 0))},(_,i)=><mesh key={i} position={[.8-i*.22,.36,-.12]}><boxGeometry args={[.16,.12,.24]}/><meshStandardMaterial color="#080a09"/></mesh>)}</group>;
  if (part.kind === "air-cooler") return <group><mesh><boxGeometry args={[.82, 1.25, .82]} /><Material part={part} active={active} color="#4a504d" /></mesh><group position={[0,0,.48]}><Fan part={part} active={active} /></group></group>;
  if (part.kind === "aio") { const spacing = .62; return <group><mesh scale={[1.9,.52,.22]}><boxGeometry /><Material part={part} active={active} /></mesh>{Array.from({length:part.instances},(_,i)=><group key={i} position={[(i-(part.instances-1)/2)*spacing,0,.28]}><Fan part={part} active={active} radius={.28}/></group>)}<Tubes part={part} active={active}/></group>; }
  if (part.kind === "m2") return <>{Array.from({length:part.instances},(_,i)=><group key={i} position={[0,(i-(part.instances-1)/2)*.27,i*.035]}><mesh><boxGeometry args={[.75,.18,.08]}/><Material part={part} active={active}/></mesh><mesh position={[-.335,0,.045]}><boxGeometry args={[.08,.17,.012]}/><Material part={part} active={active} color={part.profile.accentColor}/></mesh></group>)}</>;
  if (part.kind === "psu") return <group><mesh><boxGeometry args={[1.45,1.15,1.45]}/><Material part={part} active={active}/></mesh><group position={[0,0,.76]} rotation={[Math.PI/2,0,0]}><Fan part={part} active={active} radius={.38}/></group><mesh position={[.35,-.25,-.735]}><boxGeometry args={[.38,.28,.035]}/><meshStandardMaterial color="#090b0a"/></mesh><mesh position={[-.42,-.28,-.75]}><boxGeometry args={[.18,.12,.04]}/><meshStandardMaterial color="#090b0a"/></mesh></group>;
  const sizes: Partial<Record<Visual3DPart["kind"], [number,number,number]>> = { "drive-25":[.75,1.05,.16], "drive-35":[1.05,1.45,.25], expansion:[1.65,.28,.38], rgb:[.08,3.7,.08] };
  return <mesh><boxGeometry args={sizes[part.kind] || [.5,.5,.5]} /><Material part={part} active={active} /></mesh>;
}
function Chassis({ part }: { part: Visual3DPart }) {
  const wide = part.profile.style === "WIDE_DUAL_CHAMBER" || part.profile.style === "AQUARIUM";
  const open = part.profile.style === "OPEN_FRAME";
  const bars: Array<[[number,number,number],[number,number,number]]> = [[[0,-.48,0],[.98,.04,.98]],[[0,.48,0],[.98,.04,.98]],[[-.48,0,0],[.04,.96,.98]],[[.48,0,0],[.04,.96,.98]],[[0,0,-.48],[.96,.92,.035]]];
  return <group scale={part.scale}>{bars.map(([position,scale],i)=><mesh key={i} position={position} scale={scale}><boxGeometry /><meshStandardMaterial color={part.profile.primaryColor} metalness={.8} roughness={.3} /></mesh>)}{!open&&<mesh position={[0,0,.49]}><boxGeometry args={[.94,.92,.018]} /><meshPhysicalMaterial color={wide?"#39433e":"#202b26"} transparent opacity={.15} roughness={.08} transmission={.35} /></mesh>}<group position={[0,0,-.505]}>{/* rear I/O: decorative only; parent is outside picking handlers */}<mesh position={[-.19,.22,0]}><boxGeometry args={[.25,.2,.025]}/><meshStandardMaterial color="#727a75" metalness={.7}/></mesh><mesh position={[-.12,-.12,0]}><boxGeometry args={[.45,.17,.025]}/><meshStandardMaterial color="#3c423f"/></mesh>{[-.18,-.12,-.06,0].map(y=><mesh key={y} position={[-.12,y-.08,.017]}><boxGeometry args={[.38,.018,.012]}/><meshStandardMaterial color="#909792"/></mesh>)}<mesh position={[.28,-.29,0]}><boxGeometry args={[.28,.22,.025]}/><meshStandardMaterial color="#252a28"/></mesh></group></group>;
}

export default function ForgeScene({ scene, active, onSelect, onHover, resetSignal }: { scene: Visual3DScene; active?: VisualCategory; onSelect: (p: Visual3DPart) => void; onHover: (p?: Visual3DPart) => void; resetSignal: number }) {
  const controls = useRef<OrbitControlsImpl>(null); const assembly = useRef<Group>(null); const { camera, size, invalidate } = useThree();
  const cameraRef = useRef(camera);
  const [limits,setLimits] = useState({min:scene.camera.minDistance,max:scene.camera.maxDistance});
  useEffect(() => {
    const fittedCamera = cameraRef.current;
    if (!assembly.current || !(fittedCamera instanceof PerspectiveCamera)) return;
    const box = new Box3().setFromObject(assembly.current); const sphere = box.getBoundingSphere(new Sphere());
    const vertical = MathUtils.degToRad(fittedCamera.fov); const horizontal = 2*Math.atan(Math.tan(vertical/2)*fittedCamera.aspect);
    const distance = sphere.radius / Math.sin(Math.min(vertical,horizontal)/2) * 1.08;
    const direction = new Vector3(1,.62,1.2).normalize(); fittedCamera.position.copy(sphere.center).addScaledVector(direction,distance);
    fittedCamera.near=Math.max(.03,distance-sphere.radius*1.8); fittedCamera.far=distance+sphere.radius*8; fittedCamera.updateProjectionMatrix();
    controls.current?.target.copy(sphere.center); controls.current?.update(); setLimits({min:Math.max(sphere.radius*1.5,distance*.48),max:distance*2.5}); invalidate();
  },[invalidate,resetSignal,scene,size.width,size.height]);
  return <><hemisphereLight args={["#9ccbb4", "#07100b", .9]} /><directionalLight position={[5,7,6]} intensity={2.2} color="#f2e3bc" /><directionalLight position={[-4,1,4]} intensity={1.1} color="#4fb9a5" /><pointLight position={[0,0,-2]} intensity={1.2} color="#315e49" /><group ref={assembly}><Chassis part={scene.chassis}/>{scene.parts.map(part => <Interactive key={part.id} part={part} onSelect={onSelect} onHover={onHover}><ComponentMesh part={part} active={active === part.category} /></Interactive>)}</group><ContactShadows position={[0,scene.bounds.min[1]-.04,0]} opacity={.42} scale={Math.max(7,scene.bounds.max[2]*3)} blur={2.5} far={5} frames={1} /><OrbitControls ref={controls} makeDefault minDistance={limits.min} maxDistance={limits.max} minPolarAngle={.35} maxPolarAngle={1.72} enablePan={false} onChange={() => invalidate()} /></>;
}
