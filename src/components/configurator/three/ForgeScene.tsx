"use client";
/* ═══════════════════════════════════════════════════════════════════
   RENDERIZADOR 3D — da forma a cada pieza de la escena

   Recibe la escena ya colocada por visual-3d.ts (posiciones y tamaños en
   unidades de 100 mm) y construye cada componente con la geometría que
   tiene de verdad: un PCB con sus zócalos y conectores, una gráfica con
   su carcasa, ventiladores, soporte y puertos, un disipador con aletas y
   heatpipes, un radiador con depósitos, cables que salen de los
   pasacables de la bandeja. Cada pieza lleva rotulada su marca y modelo
   reales, tomados del catálogo. Nada de cajas lisas.

   La iluminación viene de un entorno de estudio generado en el momento
   (RoomEnvironment), sin descargar nada: sin él, los materiales metálicos
   se ven negros, que era el mal de la versión anterior.
   ═══════════════════════════════════════════════════════════════════ */
import { ContactShadows, OrbitControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type { Vector3Tuple, Visual3DCable, Visual3DPart, Visual3DScene } from "@/lib/visual-3d";
import type { VisualCategory } from "@/lib/visual-build";

/* ── Materiales ──────────────────────────────────────────────────────── */
type Mat = { color: string; metalness: number; roughness: number; emissive?: string; emissiveIntensity?: number; transparent?: boolean; opacity?: number };
const M = {
  steel: { color: "#262b29", metalness: 0.45, roughness: 0.55 },
  steelLight: { color: "#d4d8d4", metalness: 0.4, roughness: 0.5 },
  tray: { color: "#2b312e", metalness: 0.5, roughness: 0.58 },
  pcb: { color: "#16261c", metalness: 0.15, roughness: 0.75 },
  pcbLight: { color: "#cfd4cf", metalness: 0.2, roughness: 0.7 },
  alu: { color: "#b6bab6", metalness: 0.85, roughness: 0.38 },
  aluDark: { color: "#3b403e", metalness: 0.8, roughness: 0.42 },
  aluMid: { color: "#6e7572", metalness: 0.8, roughness: 0.4 },
  plastic: { color: "#181c1a", metalness: 0.1, roughness: 0.62 },
  plasticLight: { color: "#e2e5e1", metalness: 0.05, roughness: 0.55 },
  copper: { color: "#b87333", metalness: 0.95, roughness: 0.3 },
  gold: { color: "#dfb85e", metalness: 0.9, roughness: 0.32 },
  ihs: { color: "#c9cdc9", metalness: 0.95, roughness: 0.22 },
  fanFrame: { color: "#121614", metalness: 0.15, roughness: 0.65 },
  blade: { color: "#0c100e", metalness: 0.1, roughness: 0.5, transparent: true, opacity: 0.88 },
  rubber: { color: "#0d100f", metalness: 0.05, roughness: 0.9 },
  wood: { color: "#5b3a24", metalness: 0, roughness: 0.82 },
  black: { color: "#0a0d0b", metalness: 0.3, roughness: 0.6 },
} satisfies Record<string, Mat>;

/* Colores de estado de la interfaz sobre las piezas: azul = siguiente/activa, rojo = conflicto, ámbar = aviso. */
const STATE = { empty: "#6b7a8c", installed: "#000000", next: "#4D8DFF", warning: "#E9AB55", conflict: "#ED6666" } as const;

/** Material PBR con el estado de la pieza encima: fantasma si falta, azul si es la siguiente o está activa, ámbar si avisa, rojo si hay conflicto. */
function Skin({ part, active, base, tint }: { part: Visual3DPart; active?: boolean; base: Mat; tint?: string }) {
  const ghost = part.state === "empty" || part.state === "next";
  const accent = active ? "#4D8DFF" : STATE[part.state];
  const intensity = active ? 0.22 : part.state === "installed" ? 0 : part.state === "next" ? 0.35 : part.state === "empty" ? 0.12 : 0.3;
  return <meshStandardMaterial color={ghost ? (part.state === "next" ? "#3b5a8a" : "#3a4658") : tint || base.color} metalness={ghost ? 0.1 : base.metalness} roughness={ghost ? 0.7 : base.roughness}
    transparent={ghost || base.transparent} opacity={ghost ? (part.state === "next" ? 0.28 : 0.16) : base.opacity ?? 1} depthWrite={!ghost}
    emissive={accent} emissiveIntensity={intensity} />;
}

/* ── Primitivas ──────────────────────────────────────────────────────── */
type V3 = Vector3Tuple;
const AXIS: Record<"x" | "y" | "z", V3> = { x: [0, 0, -Math.PI / 2], y: [0, 0, 0], z: [Math.PI / 2, 0, 0] };

function Box({ size, at = [0, 0, 0], mat, part, active, tint, shadow = true }: { size: V3; at?: V3; mat: Mat; part?: Visual3DPart; active?: boolean; tint?: string; shadow?: boolean }) {
  return <mesh position={at} castShadow={shadow} receiveShadow={shadow}><boxGeometry args={size} />{part ? <Skin part={part} active={active} base={mat} tint={tint} /> : <meshStandardMaterial {...mat} />}</mesh>;
}
function Cyl({ r, h, axis = "y", at = [0, 0, 0], mat, part, active, seg = 28 }: { r: number; h: number; axis?: "x" | "y" | "z"; at?: V3; mat: Mat; part?: Visual3DPart; active?: boolean; seg?: number }) {
  return <mesh position={at} rotation={AXIS[axis]} castShadow receiveShadow><cylinderGeometry args={[r, r, h, seg]} />{part ? <Skin part={part} active={active} base={mat} /> : <meshStandardMaterial {...mat} />}</mesh>;
}

/** Ventilador: marco cuadrado, aro, siete palas y buje. `axis` es la dirección en la que sopla. */
function Fan({ size, axis, at = [0, 0, 0], part, active, light }: { size: number; axis: "x" | "y" | "z"; at?: V3; part?: Visual3DPart; active?: boolean; light?: boolean }) {
  const r = size / 2 - 0.05, blades = 7;
  const rot = AXIS[axis];
  const frame = light ? M.plasticLight : M.fanFrame;
  return <group position={at} rotation={rot}>
    <mesh castShadow receiveShadow><boxGeometry args={[size, 0.25, size]} />{part ? <Skin part={part} active={active} base={frame} /> : <meshStandardMaterial {...frame} />}</mesh>
    <mesh position={[0, 0.13, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[r - 0.02, 0.018, 8, 40]} /><meshStandardMaterial {...M.aluDark} /></mesh>
    <mesh position={[0, 0.02, 0]}><cylinderGeometry args={[r, r, 0.03, 40]} /><meshStandardMaterial color="#080b0a" metalness={0.2} roughness={0.7} transparent opacity={0.55} /></mesh>
    {Array.from({ length: blades }, (_, i) => <mesh key={i} rotation={[0, (i / blades) * Math.PI * 2, 0]} position={[0, 0.07, 0]}><mesh position={[r * 0.55, 0, 0]} rotation={[0.55, 0, 0]}><boxGeometry args={[r * 0.75, 0.012, r * 0.42]} /><meshStandardMaterial {...M.blade} /></mesh></mesh>)}
    <mesh position={[0, 0.1, 0]}><cylinderGeometry args={[r * 0.3, r * 0.3, 0.12, 24]} /><meshStandardMaterial {...M.plastic} /></mesh>
  </group>;
}

/* ── Rótulos: marca y modelo reales, dibujados en una textura de canvas ──
   Sin fuentes que descargar: usa la del sitio si ya está cargada y, si no,
   la del sistema. Las texturas se guardan por texto para no repetirlas. */
const labelCache = new Map<string, THREE.CanvasTexture>();
function labelTexture(text: string, fg: string, aspect: number, sub?: string, subColor?: string): THREE.CanvasTexture | null {
  if (typeof document === "undefined" || !text) return null;
  const height = Math.min(512, Math.max(64, Math.round(512 / Math.max(1, aspect))));
  const key = [text, fg, height, sub, subColor].join("|");
  const hit = labelCache.get(key); if (hit) return hit;
  const c = document.createElement("canvas"); c.width = 512; c.height = height;
  const ctx = c.getContext("2d"); if (!ctx) return null;
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  const draw = (t: string, px: number, weight: number, color: string, y: number) => {
    ctx.fillStyle = color;
    do { ctx.font = `${weight} ${px}px Archivo, "Inter Tight", system-ui, sans-serif`; px -= 4; } while (ctx.measureText(t).width > c.width - 32 && px > 14);
    ctx.fillText(t, c.width / 2, y);
  };
  if (sub) { draw(text.toUpperCase(), Math.round(height * 0.5), 800, fg, height * 0.36); draw(sub.toUpperCase(), Math.round(height * 0.26), 600, subColor || fg, height * 0.76); }
  else draw(text.toUpperCase(), Math.round(height * 0.6), 800, fg, height / 2);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  labelCache.set(key, tex); return tex;
}
type Facing = "x" | "-x" | "y" | "-y" | "z" | "-z";
const FACING: Record<Facing, V3> = { x: [0, Math.PI / 2, 0], "-x": [0, -Math.PI / 2, 0], y: [-Math.PI / 2, 0, 0], "-y": [Math.PI / 2, 0, 0], z: [0, 0, 0], "-z": [0, Math.PI, 0] };
/** Un rótulo plano pegado a una cara. `facing` es la normal de la cara; `roll` gira el texto sobre ella. */
function Label({ text, sub, at, facing, w, h, fg = "#dfe3df", subColor, glow = 0, roll = 0 }: { text?: string; sub?: string; at: V3; facing: Facing; w: number; h: number; fg?: string; subColor?: string; glow?: number; roll?: number }) {
  const tex = useMemo(() => labelTexture(text || "", fg, w / h, sub, subColor), [text, fg, w, h, sub, subColor]);
  if (!tex) return null;
  return <group position={at} rotation={FACING[facing]}><mesh rotation={[0, 0, roll]}>
    <planeGeometry args={[w, h]} />
    <meshStandardMaterial map={tex} transparent alphaTest={0.02} depthWrite={false} polygonOffset polygonOffsetFactor={-2} roughness={0.55} metalness={0.1} emissive={glow ? "#ffffff" : "#000000"} emissiveMap={glow ? tex : undefined} emissiveIntensity={glow} />
  </mesh></group>;
}
const shortModel = (name?: string) => (name || "").split(/\s+/).slice(0, 3).join(" ");
const isWhite = (name?: string) => /\bwhite\b|\bblanc|\bsnow\b|\bspectral\b/i.test(name || "");

/* ── Piezas ──────────────────────────────────────────────────────────── */
const num = (v: unknown, d: number) => (typeof v === "number" && Number.isFinite(v) ? v : d);
const rel = (part: Visual3DPart, u: { position: V3 }): V3 => [u.position[0] - part.position[0], u.position[1] - part.position[1], u.position[2] - part.position[2]];

function Motherboard({ part, active }: { part: Visual3DPart; active: boolean }) {
  const B = part.board!; const [t, h, d] = part.size;
  const light = part.profile.isLight;
  const ink = light ? "#2b302d" : "#b3b9b5";
  /* (u, v, alt) de tablero → posición relativa al centro del PCB. */
  const on = (u: number, v: number, alt: number): V3 => [t / 2 + alt / 100, h / 2 - v / 100, d / 2 - u / 100];
  return <group>
    <Box size={[t, h, d]} mat={light ? M.pcbLight : M.pcb} part={part} active={active} />
    {/* bloque de puertos traseros, atravesando el escudo I/O */}
    <Box size={[0.4, (B.ioV[1] - B.ioV[0]) / 100, 0.18]} at={on(9, (B.ioV[0] + B.ioV[1]) / 2, 20)} mat={M.aluDark} />
    {/* disipadores VRM: arriba del zócalo y a su lado trasero, con el modelo grabado */}
    <Box size={[0.3, 0.22, 0.72]} at={on(B.socket[0] + 10, 18, 15)} mat={light ? M.alu : M.aluMid} />
    <Label text={shortModel(part.source.model)} at={on(B.socket[0] + 10, 18, 30.3)} facing="x" w={0.64} h={0.15} fg={ink} />
    <Box size={[0.3, 1.0, 0.3]} at={on(B.socket[0] - 62, B.socket[1] + 12, 15)} mat={light ? M.alu : M.aluMid} />
    {/* zócalos DIMM */}
    {Array.from({ length: B.dimm }, (_, i) => <Box key={i} size={[0.075, B.ramLen / 100, 0.06]} at={on(B.ramU0 + i * B.ramPitch, B.ramV0 + B.ramLen / 2, 3.75)} mat={light ? M.plasticLight : M.plastic} />)}
    {/* ranuras de expansión: la ×16 principal y las secundarias */}
    <Box size={[0.11, 0.075, B.pcieLen / 100]} at={on(B.pcieU0 + B.pcieLen / 2, B.pcieV, 5.5)} mat={M.plastic} />
    {B.slots > 1 && <Box size={[0.11, 0.075, 0.25]} at={on(B.pcieU0 + 12.5, B.pcieV - 20.32, 5.5)} mat={M.plastic} />}
    {B.slots > 3 && <Box size={[0.11, 0.075, B.slots > 4 ? 0.89 : 0.4]} at={on(B.pcieU0 + (B.slots > 4 ? 44.5 : 20), B.pcieV + 3 * 20.32, 5.5)} mat={M.plastic} />}
    {/* chipset con la marca */}
    <Box size={[0.12, 0.42, 0.42]} at={on(B.chipset[0], B.chipset[1], 6)} mat={light ? M.alu : M.aluMid} />
    <Label text={part.source.brand} at={on(B.chipset[0], B.chipset[1], 12.3)} facing="x" w={0.36} h={0.12} fg={ink} />
    {/* conectores: 24 pines de canto en el borde delantero, EPS arriba, SATA acodados, cabecera del panel */}
    <Box size={[0.2, 0.52, 0.1]} at={on(B.atx24[0], B.atx24[1], 10)} mat={M.plastic} />
    <Box size={[0.16, 0.1, 0.2]} at={on(B.eps[0], B.eps[1], 8)} mat={M.plastic} />
    <Box size={[0.08, 0.18, 0.16]} at={on(B.sata[0], B.sata[1], 4)} mat={M.plastic} />
    <Box size={[0.08, 0.06, 0.2]} at={on(B.fp[0], B.fp[1], 4)} mat={M.plastic} />
    {/* huecos M.2 libres, marcados con el tornillo dorado */}
    {B.m2.map((m, i) => <Box key={i} size={[0.02, 0.06, 0.06]} at={on(m[0] - 40, m[1], 1.5)} mat={M.gold} shadow={false} />)}
  </group>;
}

function Cpu({ part, active }: { part: Visual3DPart; active: boolean }) {
  return <group>
    <Box size={[0.03, 0.45, 0.45]} at={[-0.02, 0, 0]} mat={M.plastic} part={part} active={active} />
    <Box size={[0.035, 0.39, 0.39]} at={[0.0125, 0, 0]} mat={M.ihs} part={part} active={active} />
    <Label text={part.source.brand} at={[0.031, 0, 0]} facing="x" w={0.3} h={0.1} fg="#5a605d" />
  </group>;
}

function Ram({ part, active }: { part: Visual3DPart; active: boolean }) {
  const [ht, len, th] = part.size; const light = part.profile.isLight; const rgb = Boolean(part.detail.rgb);
  return <>{part.units.map((u, i) => <group key={i} position={rel(part, u)}>
    <Box size={[ht, len, th]} mat={light ? M.plasticLight : M.aluDark} part={part} active={active} />
    <Box size={[0.02, len - 0.1, th + 0.004]} at={[-ht / 2 + 0.01, 0, 0]} mat={M.pcb} />
    {/* marca en la cara que mira al frontal, leída de arriba abajo */}
    <Label text={part.source.brand} at={[0.02, 0, -th / 2 - 0.004]} facing="-z" roll={-Math.PI / 2} w={len - 0.4} h={ht - 0.14} fg={light ? "#4a504d" : "#a9b0ac"} />
    {rgb && <mesh position={[ht / 2 + 0.006, 0, 0]}><boxGeometry args={[0.012, len - 0.16, th - 0.02]} /><meshStandardMaterial color="#c8f0ff" emissive="#7fd8ff" emissiveIntensity={0.9} /></mesh>}
  </group>)}</>;
}

/** Gráfica: carcasa con tapa lateral rotulada, placa trasera con rejilla, ventiladores
    con aro, soporte con puertos y rejilla. En un sándwich va girada: ventiladores al
    panel y conectores hacia abajo. */
function Gpu({ part, active }: { part: Visual3DPart; active: boolean }) {
  const sandwich = Boolean(part.detail.sandwich);
  const [H, T, L]: V3 = sandwich ? [part.size[1], part.size[0], part.size[2]] : part.size;
  const fans = num(part.detail.fans, 2);
  const hpwr = Boolean(part.detail.hpwr); const plugs = hpwr ? 1 : Math.max(0, Math.min(3, num(part.detail.conn8, 0) + num(part.detail.conn6, 0)));
  const fanD = Math.min(0.96, (L - 0.3) / fans - 0.06);
  const accent = part.profile.accentColor;
  const light = isWhite(part.source.name);
  const shroudMat = light ? M.plasticLight : M.plastic; const plateMat = light ? M.steelLight : M.aluDark;
  const brand = part.source.brand || ""; const chip = String(part.metadata.chip || "");
  const labelW = Math.min(1.1, Math.max(0.5, L - 1.0));
  return <group rotation={sandwich ? [0, 0, -Math.PI / 2] : [0, 0, 0]}>
    {/* carcasa del disipador: la tapa, 2 mm más estrecha que el grosor total */}
    <Box size={[H - 0.02, T - 0.04, L - 0.03]} at={[0, -0.01, 0]} mat={shroudMat} part={part} active={active} />
    {/* PCB asomando por el canto de la ranura y placa trasera de aluminio con rejilla y marca */}
    <Box size={[H - 0.2, 0.016, L - 0.06]} at={[-0.1, T / 2 - 0.02, 0]} mat={M.pcb} />
    <Box size={[H - 0.05, 0.012, L - 0.08]} at={[0, T / 2 - 0.004, 0]} mat={plateMat} />
    {Array.from({ length: 5 }, (_, i) => <Box key={i} size={[H - 0.34, 0.004, 0.018]} at={[0.02, T / 2 + 0.003, -L / 2 + 0.14 + i * 0.045]} mat={M.black} shadow={false} />)}
    <Label text={brand} at={[0.03, T / 2 + 0.005, L / 2 - 0.62]} facing="y" roll={Math.PI / 2} w={0.8} h={0.14} fg={light ? "#4a504d" : "#8f9692"} />
    {/* ventiladores hacia abajo, cada uno con su aro */}
    {Array.from({ length: fans }, (_, i) => { const z = L / 2 - 0.2 - fanD / 2 - i * (fanD + 0.05); return <group key={i}>
      <Fan size={fanD} axis="y" at={[0.02, -T / 2 - 0.02, z]} part={part} active={active} light={light} />
      <mesh position={[0.02, -T / 2 - 0.02, z]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[fanD / 2 + 0.02, 0.014, 8, 40]} /><meshStandardMaterial {...(light ? M.alu : M.aluMid)} /></mesh>
    </group>; })}
    {/* soporte de chapa en la trasera: pestañas, puertos de vídeo en la primera fila y rejilla en la segunda */}
    <Box size={[1.12, T + 0.06, 0.02]} at={[-H / 2 + 0.58, 0, L / 2 + 0.01]} mat={M.alu} />
    <Box size={[0.16, 0.05, 0.03]} at={[-H / 2 + 1.12 + 0.02, T / 2 + 0.05, L / 2 + 0.01]} mat={M.alu} />
    {[0, 1, 2, 3].map((i) => <Box key={i} size={[i === 3 ? 0.14 : 0.16, 0.06, 0.014]} at={[-H / 2 + 0.16 + i * 0.22, T / 2 - 0.08, L / 2 + 0.024]} mat={M.black} shadow={false} />)}
    {Array.from({ length: Math.max(0, Math.floor((T - 0.3) / 0.045)) }, (_, i) => <Box key={i} size={[0.94, 0.012, 0.012]} at={[-H / 2 + 0.56, T / 2 - 0.24 - i * 0.045, L / 2 + 0.024]} mat={M.black} shadow={false} />)}
    {/* dedos del conector PCIe, dorados */}
    <Box size={[0.025, 0.016, 0.89]} at={[-H / 2 + 0.05, T / 2 - 0.045, L / 2 - 0.5 - 0.445]} mat={M.gold} shadow={false} />
    {/* conectores de alimentación en el canto que mira al cristal */}
    {Array.from({ length: plugs }, (_, i) => <Box key={i} size={[0.09, 0.085, hpwr ? 0.26 : 0.19]} at={[H / 2 + 0.04, T / 2 - 0.07, L / 2 - 0.6 - i * 0.22]} mat={M.black} />)}
    {/* tapa lateral, la cara que ve el usuario: modelo iluminado y tira de acento */}
    <Box size={[0.012, T - 0.06, L - 0.1]} at={[H / 2 - 0.004, -0.01, 0]} mat={light ? M.plasticLight : M.black} />
    <Label text={chip || brand} sub={chip ? brand : undefined} at={[H / 2 + 0.004, 0, -L / 2 + 0.22 + labelW / 2]} facing="x" w={labelW} h={Math.min(0.26, T - 0.12)} fg={accent} subColor="#e3e6e2" glow={0.9} />
    <mesh position={[H / 2 + 0.004, -T / 2 + 0.06, 0]}><boxGeometry args={[0.005, 0.02, L * 0.42]} /><meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.5} /></mesh>
  </group>;
}

function AirCooler({ part, active }: { part: Visual3DPart; active: boolean }) {
  const [X, W, D] = part.size; const kind = String(part.detail.kind || "tower"); const fanSize = num(part.detail.fanSize, 120) / 100; const fans = num(part.detail.fans, 1);
  const c: V3 = part.connectionTarget ? [part.connectionTarget[0] - part.position[0], part.connectionTarget[1] - part.position[1], part.connectionTarget[2] - part.position[2]] : [-X / 2, 0, 0];
  const light = part.profile.isLight;
  const finMat = light ? M.steelLight : M.alu;
  if (kind === "stock") return <group><Cyl r={0.42} h={X - 0.04} axis="x" at={[0, c[1], c[2]]} mat={M.aluDark} part={part} active={active} /><Fan size={0.8} axis="x" at={[X / 2 - 0.1, c[1], c[2]]} part={part} active={active} /></group>;
  if (kind === "top-flow") return <group>
    <Box size={[0.24, 0.42, 0.42]} at={[-X / 2 + 0.12, c[1], c[2]]} mat={M.copper} part={part} active={active} />
    {Array.from({ length: 22 }, (_, i) => <Box key={i} size={[0.004, W, D - 0.3]} at={[-X / 2 + 0.26 + i * ((X - 0.55) / 22), c[1], c[2]]} mat={finMat} shadow={i % 4 === 0} />)}
    <Fan size={fanSize} axis="x" at={[X / 2 - 0.13, c[1], c[2]]} part={part} active={active} light={light} />
  </group>;
  /* Torre: base de cobre, aletas apiladas a lo largo de Z, heatpipes atravesándolas, tapa con la marca y ventiladores de 27 mm delante. */
  const towers = kind === "dual-tower" ? 2 : 1; const stack = 0.5; const finH = X - 0.34; const finCount = 26;
  const stackZ = towers === 2 ? [c[2] + 0.385, c[2] - 0.385] : [c[2]];
  const fanZ = towers === 2 ? [c[2], c[2] - 0.77] : [c[2] - 0.385];
  const pipes = towers === 2 ? [-0.42, -0.25, -0.08, 0.08, 0.25, 0.42] : [-0.3, -0.1, 0.1, 0.3];
  return <group>
    <Box size={[0.28, 0.42, 0.42]} at={[-X / 2 + 0.14, c[1], c[2]]} mat={M.copper} part={part} active={active} />
    {stackZ.map((z, s) => <group key={s}>
      {Array.from({ length: finCount }, (_, i) => <Box key={i} size={[finH, W - 0.08, 0.005]} at={[-X / 2 + 0.34 + finH / 2, c[1], z - stack / 2 + 0.02 + i * ((stack - 0.04) / (finCount - 1))]} mat={finMat} part={i % 5 === 0 ? part : undefined} active={active} shadow={i % 3 === 0} />)}
      <Box size={[0.03, W - 0.06, stack]} at={[X / 2 - 0.015, c[1], z]} mat={finMat} />
      {s === 0 && <Label text={part.source.brand} at={[X / 2 + 0.002, c[1], z]} facing="x" roll={-Math.PI / 2} w={W - 0.3} h={stack - 0.14} fg={light ? "#4a504d" : "#3a3f3c"} />}
      {pipes.map((py, i) => <Cyl key={i} r={0.03} h={X - 0.2} axis="x" at={[0.02, c[1] + py, z]} mat={M.copper} seg={12} />)}
    </group>)}
    {fanZ.slice(0, Math.max(1, fans)).map((z, i) => <Fan key={i} size={fanSize} axis="z" at={[-X / 2 + 0.34 + finH / 2, c[1], z]} part={part} active={active} light={light} />)}
  </group>;
}

/** Radiador AIO: núcleo con aletas y depósitos, ventiladores en la cara interior,
    bomba sobre la CPU con la marca en la tapa y dos tubos. La normal del
    anclaje decide su orientación (techo, frontal, lateral, suelo o trasera). */
function Aio({ part, active }: { part: Visual3DPart; active: boolean }) {
  const fans = num(part.detail.fans, 2); const fanSize = num(part.detail.fanSize, 120) / 100; const radT = num(part.detail.radT, 30) / 100;
  const normal: V3 = [num(part.detail.normalX, 0), num(part.detail.normalY, 0), num(part.detail.normalZ, 0)];
  const nIdx = normal[0] ? 0 : normal[1] ? 1 : 2; const lIdx = part.detail.along === "z" ? 2 : 1; const wIdx = [0, 1, 2].find((a) => a !== nIdx && a !== lIdx) ?? 0;
  const long = part.size[lIdx]; const wide = part.size[wIdx];
  const vec = (l: number, n: number, w: number): V3 => { const v: V3 = [0, 0, 0]; v[lIdx] = l; v[nIdx] = n; v[wIdx] = w; return v; };
  const fanAxis: "x" | "y" | "z" = nIdx === 0 ? "x" : nIdx === 1 ? "y" : "z";
  const fins = 34;
  const light = part.profile.isLight;
  const c: V3 = part.connectionTarget ? [part.connectionTarget[0] - part.position[0], part.connectionTarget[1] - part.position[1], part.connectionTarget[2] - part.position[2]] : [0, 0, 0];
  const curves = useMemo(() => (part.tubePaths || []).map((path) => new THREE.CatmullRomCurve3(path.map((pt) => new THREE.Vector3(pt[0] - part.position[0], pt[1] - part.position[1], pt[2] - part.position[2])), false, "catmullrom", 0.6)), [part.position, part.tubePaths]);
  return <group>
    {/* núcleo del radiador y sus dos depósitos */}
    <Box size={[part.size[0] - 0.02, part.size[1] - 0.02, part.size[2] - 0.02]} mat={M.aluDark} part={part} active={active} />
    {Array.from({ length: fins }, (_, i) => <Box key={i} size={vec(0.004, radT - 0.06, wide - 0.06)} at={vec(-long / 2 + 0.16 + i * ((long - 0.32) / (fins - 1)), 0, 0)} mat={M.alu} shadow={false} />)}
    {[-1, 1].map((s) => <Box key={s} size={vec(0.15, radT + 0.012, wide)} at={vec(s * (long / 2 - 0.075), 0, 0)} mat={M.plastic} part={part} active={active} />)}
    {/* ventiladores en la cara que mira al interior */}
    {Array.from({ length: fans }, (_, i) => <Fan key={i} size={fanSize} axis={fanAxis} at={vec(-long / 2 + 0.06 + fanSize / 2 + i * fanSize, normal[nIdx] * (radT / 2 + 0.13), 0)} part={part} active={active} light={light} />)}
    {/* bomba sobre la CPU con la marca en la tapa, y tubos */}
    <group position={c}>
      <Cyl r={0.33} h={0.42} axis="x" at={[0.21, 0, 0]} mat={light ? M.plasticLight : M.plastic} part={part} active={active} />
      <mesh position={[0.43, 0, 0]} rotation={AXIS.x}><cylinderGeometry args={[0.27, 0.27, 0.02, 32]} /><meshStandardMaterial color="#9fe3ff" emissive="#5cc8f0" emissiveIntensity={0.6} metalness={0.4} roughness={0.2} /></mesh>
      <Label text={part.source.brand} at={[0.445, 0, 0]} facing="x" w={0.42} h={0.12} fg="#0b1a20" />
      <Box size={[0.06, 0.42, 0.42]} at={[0.03, 0, 0]} mat={M.copper} />
    </group>
    {curves.map((curve, i) => <mesh key={i} castShadow><tubeGeometry args={[curve, 40, 0.055, 10, false]} /><Skin part={part} active={active} base={M.rubber} /></mesh>)}
  </group>;
}

function Psu({ part, active }: { part: Visual3DPart; active: boolean }) {
  const [sx, sy, sz] = part.size; const vertical = Boolean(part.detail.vertical); const top = Boolean(part.detail.top); const front = Boolean(part.detail.front);
  const light = part.profile.isLight;
  /* El ventilador mira al suelo (o al techo) en las horizontales y al cristal en las verticales. */
  const fanAxis: "x" | "y" = vertical ? "x" : "y"; const fanAt: V3 = vertical ? [sx / 2 + 0.005, 0, 0] : [0, top ? sy / 2 + 0.005 : -sy / 2 - 0.005, 0];
  const fanD = Math.min(vertical ? sy : sx, sz) - 0.2;
  const watt = num(part.detail.watt, 0);
  /* Los conectores modulares miran a la placa: al frontal si la fuente está atrás, atrás si está delante. */
  const plugZ = front ? sz / 2 + 0.015 : -sz / 2 - 0.015;
  return <group>
    <Box size={[sx, sy, sz]} mat={light ? M.steelLight : M.steel} part={part} active={active} />
    <group position={fanAt} rotation={fanAxis === "x" ? AXIS.x : top ? [Math.PI, 0, 0] : AXIS.y}>
      <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[fanD / 2 - 0.04, 0.02, 8, 48]} /><meshStandardMaterial {...M.aluDark} /></mesh>
      {[0, 1, 2, 3].map((i) => <mesh key={i} rotation={[0, (i / 4) * Math.PI, 0]}><boxGeometry args={[fanD - 0.08, 0.012, 0.03]} /><meshStandardMaterial {...M.aluDark} /></mesh>)}
      <mesh position={[0, -0.02, 0]}><cylinderGeometry args={[fanD / 2 - 0.06, fanD / 2 - 0.06, 0.02, 40]} /><meshStandardMaterial {...M.black} /></mesh>
    </group>
    {Array.from({ length: 6 }, (_, i) => <Box key={i} size={[0.14, 0.11, 0.03]} at={[-sx / 2 + 0.2 + i * 0.19 * (vertical ? 0.5 : 1), vertical ? -sy / 2 + 0.2 + i * 0.19 : -sy / 2 + 0.22, plugZ]} mat={M.black} />)}
    <Box size={[sx * 0.55, 0.004, sz * 0.5]} at={[0, vertical ? 0 : (top ? -sy / 2 - 0.002 : sy / 2 + 0.002), 0]} mat={M.aluDark} shadow={false} />
    {/* marca y potencia en la cara que mira al cristal */}
    {!vertical && <Label text={part.source.brand} sub={watt ? `${watt} W` : shortModel(part.source.model)} at={[sx / 2 + 0.004, 0, 0]} facing="x" w={Math.min(1.2, sz - 0.3)} h={sy - 0.24} fg={light ? "#2b302d" : "#c3c8c4"} subColor={light ? "#4a504d" : "#8f9692"} />}
  </group>;
}

function Drives({ part, active }: { part: Visual3DPart; active: boolean }) {
  const [sx, sy, sz] = part.size; const flat = sx > sy;
  return <>{part.units.map((u, i) => <group key={i} position={rel(part, u)}>
    <Box size={[sx, sy, sz]} mat={part.kind === "drive-35" ? M.aluDark : M.plastic} part={part} active={active} />
    <Box size={[flat ? sx * 0.7 : 0.004, flat ? 0.004 : sy * 0.7, sz * 0.72]} at={[flat ? 0 : sx / 2 + 0.002, flat ? sy / 2 + 0.002 : 0, 0]} mat={M.steelLight} shadow={false} />
    {flat && <Label text={part.source.brand} at={[0, sy / 2 + 0.005, 0]} facing="y" roll={Math.PI / 2} w={Math.min(0.9, sz - 0.2)} h={Math.min(0.2, sx - 0.2)} fg="#3a3f3c" />}
  </group>)}</>;
}

function M2({ part, active }: { part: Visual3DPart; active: boolean }) {
  return <>{part.units.map((u, i) => <group key={i} position={rel(part, u)}>
    <Box size={[0.016, 0.22, 0.8]} mat={M.pcb} part={part} active={active} />
    <Box size={[0.014, 0.16, 0.22]} at={[0.015, 0, 0.12]} mat={M.black} />
    <Box size={[0.014, 0.16, 0.22]} at={[0.015, 0, -0.14]} mat={M.black} />
    <Box size={[0.02, 0.18, 0.06]} at={[-0.002, 0, 0.37]} mat={M.gold} shadow={false} />
  </group>)}</>;
}

function CaseFans({ part, active }: { part: Visual3DPart; active: boolean }) {
  return <>{part.units.map((u, i) => { const n = u.normal || [0, 0, 1]; const axis: "x" | "y" | "z" = n[0] ? "x" : n[1] ? "y" : "z"; const size = u.size ? u.size[0] : part.size[0]; return <group key={i} position={rel(part, u)}><Fan size={size} axis={axis} part={part} active={active} light={part.profile.isLight} /></group>; })}</>;
}

function Rgb({ part, active }: { part: Visual3DPart; active: boolean }) {
  return <>{part.units.map((u, i) => <mesh key={i} position={rel(part, u)}><boxGeometry args={part.size} /><meshStandardMaterial color="#ffe2a8" emissive={active ? "#ffd27a" : "#e8b95a"} emissiveIntensity={part.state === "installed" || active ? 1.1 : 0.3} transparent={part.state === "empty"} opacity={part.state === "empty" ? 0.2 : 1} /></mesh>)}</>;
}

function Expansion({ part, active }: { part: Visual3DPart; active: boolean }) {
  const [sx, , sz] = part.size;
  return <>{part.units.map((u, i) => <group key={i} position={rel(part, u)}>
    <Box size={[sx, 0.016, sz]} mat={M.pcb} part={part} active={active} />
    <Box size={[0.2, 0.05, 0.4]} at={[0.05, 0.03, 0]} mat={M.black} />
    <Box size={[1.12, 0.2, 0.02]} at={[-sx / 2 + 0.56, 0.06, sz / 2 + 0.01]} mat={M.alu} />
  </group>)}</>;
}

/** Cables sueltos: cada uno es un haz de tubos paralelos siguiendo su recorrido.
    Se desvanecen al explosionar la vista, porque ya no unen nada. */
function Cables({ cables, explode, light }: { cables: Visual3DCable[]; explode: number; light: boolean }) {
  const strands = useMemo(() => cables.flatMap((c) => Array.from({ length: c.strands }, (_, i) => {
    const off = (i - (c.strands - 1) / 2) * c.radius * 2.15;
    return { radius: c.radius, curve: new THREE.CatmullRomCurve3(c.path.map((p) => new THREE.Vector3(p[0] + c.spread[0] * off, p[1] + c.spread[1] * off, p[2] + c.spread[2] * off)), false, "catmullrom", 0.5) };
  })), [cables]);
  if (explode > 0.3) return null;
  const opacity = 1 - explode / 0.3;
  return <group>{strands.map((s, i) => <mesh key={i} castShadow><tubeGeometry args={[s.curve, 40, s.radius, 8, false]} /><meshStandardMaterial color={light ? "#d9dcd6" : "#121513"} roughness={0.82} metalness={0.05} transparent={opacity < 1} opacity={opacity} /></mesh>)}</group>;
}

function Component({ part, active }: { part: Visual3DPart; active: boolean }) {
  /* Una pieza que falta se insinúa con su volumen; el detalle es para las que están. */
  if (part.state === "next" || part.state === "empty") return <Box size={part.size} mat={M.plastic} part={part} active={active} />;
  switch (part.kind) {
    case "motherboard": return <Motherboard part={part} active={active} />;
    case "cpu": return <Cpu part={part} active={active} />;
    case "ram": return <Ram part={part} active={active} />;
    case "gpu": return <Gpu part={part} active={active} />;
    case "air-cooler": return <AirCooler part={part} active={active} />;
    case "aio": return <Aio part={part} active={active} />;
    case "psu": return <Psu part={part} active={active} />;
    case "m2": return <M2 part={part} active={active} />;
    case "drive-25": case "drive-35": return <Drives part={part} active={active} />;
    case "fan": return <CaseFans part={part} active={active} />;
    case "rgb": return <Rgb part={part} active={active} />;
    case "expansion": return <Expansion part={part} active={active} />;
    default: return <Box size={part.size} mat={M.plastic} part={part} active={active} />;
  }
}

/* ── Chasis ──────────────────────────────────────────────────────────── */
function Chassis({ scene, explode, cutaway }: { scene: Visual3DScene; explode: number; cutaway: boolean }) {
  const L = scene.layout; const U = 0.01;
  const sh = { min: L.shell.min.map((v) => v * U) as V3, max: L.shell.max.map((v) => v * U) as V3 };
  const int = { min: L.interior.min.map((v) => v * U) as V3, max: L.interior.max.map((v) => v * U) as V3 };
  const W = sh.max[0] - sh.min[0], H = sh.max[1] - sh.min[1], D = sh.max[2] - sh.min[2];
  const cx = (sh.min[0] + sh.max[0]) / 2, cy = (sh.min[1] + sh.max[1]) / 2, cz = (sh.min[2] + sh.max[2]) / 2;
  const light = scene.chassis.profile.isLight;
  const steel = light ? M.steelLight : M.steel;
  const trayX = L.trayX * U; const B = L.board;
  const ioTop = (L.boardTopY - B.ioV[0]) * U, ioBot = (L.boardTopY - B.ioV[1]) * U;
  const front = L.panels.front; const window = L.panels.window;
  const glassMat = <meshPhysicalMaterial color="#c9d6e2" metalness={0} roughness={0.05} transparent opacity={0.09} clearcoat={1} clearcoatRoughness={0.05} depthWrite={false} side={THREE.DoubleSide} />;
  const meshMat = <meshStandardMaterial color="#141917" metalness={0.3} roughness={0.7} transparent opacity={0.62} depthWrite={false} side={THREE.DoubleSide} />;
  const e = explode; const slats = Math.max(6, Math.round(W / 0.17));
  const G = L.grommets; const rf = L.rearFan;
  return <group>
    {/* suelo, techo, panel ciego detrás de la bandeja y la bandeja misma */}
    <Box size={[W, 0.012, D]} at={[cx, int.min[1] - 0.006, cz]} mat={steel} />
    <group position={[0, e * 0.9, 0]}><Box size={[W, 0.012, D]} at={[cx, sh.max[1] - 0.006, cz]} mat={steel} /></group>
    <Box size={[0.012, H - 0.02, D]} at={[sh.min[0] + 0.006, cy, cz]} mat={steel} />
    <Box size={[0.014, int.max[1] - int.min[1], int.max[2] - int.min[2] - 0.05]} at={[trayX - 0.007, (int.min[1] + int.max[1]) / 2, (int.min[2] + int.max[2]) / 2 + 0.025]} mat={M.tray} />
    {/* pasacables de goma: tres en el canto delantero de la placa y uno arriba */}
    {[G.upper, G.mid, G.low].map((g, i) => <Box key={i} size={[0.02, 0.24, 0.06]} at={[trayX - 0.002, g[1] * U, g[2] * U]} mat={M.rubber} shadow={false} />)}
    <Box size={[0.02, 0.06, 0.24]} at={[trayX - 0.002, G.top[1] * U, G.top[2] * U]} mat={M.rubber} shadow={false} />
    {/* panel trasero con el escudo I/O, las pestañas de expansión y la rejilla del ventilador trasero, al lado del I/O */}
    <group position={[0, 0, e * 0.6]}>
      <Box size={[W, H - 0.02, 0.012]} at={[cx, cy, sh.max[2] - 0.006]} mat={steel} />
      <Box size={[0.42, ioTop - ioBot + 0.02, 0.014]} at={[L.boardFaceX * U + 0.21, (ioTop + ioBot) / 2, sh.max[2] + 0.002]} mat={M.black} shadow={false} />
      {Array.from({ length: B.slots }, (_, i) => <Box key={i} size={[1.12, 0.18, 0.014]} at={[L.boardFaceX * U + 0.06 + 0.56, (L.boardTopY - (B.slot0V + i * 20.32)) * U, sh.max[2] + 0.002]} mat={light ? M.steelLight : M.aluDark} shadow={false} />)}
      {rf && <mesh position={[rf.center[0] * U, rf.center[1] * U, sh.max[2] + 0.004]}><torusGeometry args={[rf.size * U / 2 - 0.04, 0.015, 8, 48]} /><meshStandardMaterial {...M.aluDark} /></mesh>}
      {rf && [0, 1, 2, 3].map((i) => <mesh key={i} position={[rf.center[0] * U, rf.center[1] * U, sh.max[2] + 0.004]} rotation={[0, 0, (i / 4) * Math.PI]}><boxGeometry args={[rf.size * U - 0.1, 0.01, 0.006]} /><meshStandardMaterial {...M.aluDark} /></mesh>)}
    </group>
    {/* frontal: madera con lamas, malla, cristal o chapa, con la marca de la caja abajo */}
    <group position={[0, 0, -e * 0.8]}>
      {front === "wood" ? <>
        <Box size={[W, H - 0.02, 0.016]} at={[cx, cy, sh.min[2] + 0.008]} mat={M.wood} />
        {Array.from({ length: slats }, (_, i) => <Box key={i} size={[W / slats - 0.03, H - 0.16, 0.024]} at={[sh.min[0] + (i + 0.5) * (W / slats), cy, sh.min[2] - 0.004]} mat={{ ...M.wood, color: i % 2 ? "#6a4529" : "#5b3a24" }} />)}
      </> : front === "glass" ? <mesh position={[cx, cy, sh.min[2] + 0.004]}><boxGeometry args={[W - 0.04, H - 0.06, 0.006]} />{glassMat}</mesh>
        : front === "mesh" ? <>
          <mesh position={[cx, cy, sh.min[2] + 0.006]}><boxGeometry args={[W - 0.06, H - 0.1, 0.008]} />{meshMat}</mesh>
          <Box size={[W, H - 0.02, 0.01]} at={[cx, cy, sh.min[2] + 0.014]} mat={{ ...steel, transparent: true, opacity: 0.0 }} shadow={false} />
          {[0, 1, 2, 3].map((i) => <Box key={i} size={i % 2 ? [0.03, H - 0.02, 0.012] : [W, 0.03, 0.012]} at={i % 2 ? [i === 1 ? sh.min[0] + 0.02 : sh.max[0] - 0.02, cy, sh.min[2] + 0.006] : [cx, i === 0 ? sh.max[1] - 0.02 : sh.min[1] + 0.02, sh.min[2] + 0.006]} mat={steel} />)}
        </> : <Box size={[W, H - 0.02, 0.016]} at={[cx, cy, sh.min[2] + 0.008]} mat={steel} />}
      <Label text={scene.chassis.source.brand} at={[sh.max[0] - 0.4, sh.min[1] + 0.13, sh.min[2] - (front === "wood" ? 0.022 : 0.006)]} facing="-z" w={0.44} h={0.08} fg={light ? "#3a3f3c" : "#8f9692"} />
    </group>
    {/* cubierta de la fuente */}
    {L.shroud && <group>
      <Box size={[(L.shroud.max[0] - L.shroud.min[0]) * U, 0.012, (L.shroud.max[2] - L.shroud.min[2]) * U]} at={[(L.shroud.min[0] + L.shroud.max[0]) / 2 * U, L.shroud.max[1] * U, (L.shroud.min[2] + L.shroud.max[2]) / 2 * U]} mat={steel} />
      <Box size={[(L.shroud.max[0] - L.shroud.min[0]) * U, (L.shroud.max[1] - L.shroud.min[1]) * U, 0.012]} at={[(L.shroud.min[0] + L.shroud.max[0]) / 2 * U, (L.shroud.min[1] + L.shroud.max[1]) / 2 * U, L.shroud.min[2] * U]} mat={steel} />
    </group>}
    {/* ventiladores que trae la caja */}
    {scene.chassisFans.map((f, i) => { const axis: "x" | "y" | "z" = f.normal[0] ? "x" : f.normal[1] ? "y" : "z"; return <Fan key={i} size={f.size / 100} axis={axis} at={f.position} light={light} />; })}
    {/* cristal lateral con su marco */}
    <group position={[e * 1.1, 0, 0]}>
      {!cutaway && (window === "solid" ? <Box size={[0.012, H - 0.02, D]} at={[sh.max[0] - 0.006, cy, cz]} mat={steel} />
        : <mesh position={[sh.max[0] - 0.004, cy, cz]}><boxGeometry args={[0.006, H - 0.08, D - 0.08]} />{window === "glass" ? glassMat : meshMat}</mesh>)}
      {[0, 1, 2, 3].map((i) => <Box key={i} size={i % 2 ? [0.014, H - 0.02, 0.04] : [0.014, 0.04, D]} at={i % 2 ? [sh.max[0] - 0.007, cy, i === 1 ? sh.min[2] + 0.02 : sh.max[2] - 0.02] : [sh.max[0] - 0.007, i === 0 ? sh.max[1] - 0.02 : sh.min[1] + 0.02, cz]} mat={steel} />)}
    </group>
    {/* pies */}
    {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([a, b], i) => <Box key={i} size={[0.07, 0.018, 0.07]} at={[cx + a * (W / 2 - 0.1), sh.min[1] + 0.009, cz + b * (D / 2 - 0.12)]} mat={M.rubber} />)}
  </group>;
}

/* ── Entorno e iluminación ───────────────────────────────────────────── */
const setEnvironment = (target: THREE.Scene, env: THREE.Texture | null) => { target.environment = env; target.environmentIntensity = 0.9; };
function Studio() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    setEnvironment(scene, env);
    return () => { setEnvironment(scene, null); env.dispose(); pmrem.dispose(); };
  }, [gl, scene]);
  return null;
}

function Interactive({ part, explode, children, onSelect, onHover }: { part: Visual3DPart; explode: number; children: React.ReactNode; onSelect: (p: Visual3DPart) => void; onHover: (p?: Visual3DPart) => void }) {
  const pos: V3 = [part.position[0] + part.explode.dir[0] * part.explode.distance * explode, part.position[1] + part.explode.dir[1] * part.explode.distance * explode, part.position[2] + part.explode.dir[2] * part.explode.distance * explode];
  return <group position={pos} onClick={(e) => { e.stopPropagation(); onSelect(part); }} onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = "pointer"; onHover(part); }} onPointerOut={() => { document.body.style.cursor = ""; onHover(); }}>{children}</group>;
}

export default function ForgeScene({ scene, active, onSelect, onHover, resetSignal, explode = 0, cutaway = false }: { scene: Visual3DScene; active?: VisualCategory; onSelect: (p: Visual3DPart) => void; onHover: (p?: Visual3DPart) => void; resetSignal: number; explode?: number; cutaway?: boolean }) {
  const controls = useRef<OrbitControlsImpl>(null);
  const { camera, size, invalidate } = useThree();
  const cameraRef = useRef(camera);
  const visible = scene.parts.filter((p) => p.state !== "empty");
  const radius = scene.camera.radius;
  const cableLight = Boolean(scene.parts.find((p) => p.category === "psu")?.profile.isLight);
  useEffect(() => {
    const cam = cameraRef.current; if (!(cam instanceof THREE.PerspectiveCamera)) return;
    const vfov = THREE.MathUtils.degToRad(cam.fov); const hfov = 2 * Math.atan(Math.tan(vfov / 2) * cam.aspect);
    const distance = (radius / Math.sin(Math.min(vfov, hfov) / 2)) * 1.0;
    const dir = new THREE.Vector3(...scene.camera.direction).normalize();
    cam.position.copy(new THREE.Vector3(...scene.focusTarget)).addScaledVector(dir, distance);
    cam.near = Math.max(0.05, distance - radius * 1.6); cam.far = distance + radius * 6; cam.updateProjectionMatrix();
    controls.current?.target.set(...scene.focusTarget); controls.current?.update(); invalidate();
  }, [invalidate, resetSignal, scene, radius, size.width, size.height]);
  const shadowSize = radius * 1.4;
  return <>
    <Studio />
    <hemisphereLight args={["#e4e9ef", "#1a2029", 0.55]} />
    <directionalLight position={[radius * 1.4, radius * 2.2, -radius * 1.6]} intensity={2.4} color="#fff3dc" castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0003} shadow-normalBias={0.02}
      shadow-camera-left={-shadowSize} shadow-camera-right={shadowSize} shadow-camera-top={shadowSize} shadow-camera-bottom={-shadowSize} shadow-camera-near={0.2} shadow-camera-far={radius * 8} />
    <directionalLight position={[-radius * 1.5, radius * 0.8, radius * 1.2]} intensity={0.7} color="#a9c4dc" />
    <pointLight position={[radius * 0.6, radius * 0.3, -radius * 0.9]} intensity={radius * 1.2} distance={radius * 5} color="#dfe6ee" />
    <group>
      <Chassis scene={scene} explode={explode} cutaway={cutaway} />
      <Cables cables={scene.cables} explode={explode} light={cableLight} />
      {visible.map((part) => <Interactive key={part.id} part={part} explode={explode} onSelect={onSelect} onHover={onHover}><Component part={part} active={active === part.category} /></Interactive>)}
    </group>
    <ContactShadows position={[0, scene.bounds.min[1] - 0.01, 0]} opacity={0.5} scale={radius * 4} blur={2.2} far={radius * 2} frames={1} />
    <OrbitControls ref={controls} makeDefault minDistance={scene.camera.minDistance} maxDistance={scene.camera.maxDistance} minPolarAngle={0.2} maxPolarAngle={1.55} enablePan={false} onChange={() => invalidate()} />
  </>;
}
