/* ── Categorías del configurador ─────────────────────────────────── */
import {
  Cpu, CircuitBoard, MemoryStick, MonitorSmartphone, HardDrive, Zap, Box,
  Fan, Wind, Droplet, Cable, Lightbulb, Monitor, Keyboard, Mouse, Headphones,
  Mic, Video, Speaker, Layers, Rows3,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { CatId } from "./parts/types";

export type GroupId = "core" | "aux" | "periph";
export interface Category {
  id: CatId; label: string; icon: LucideIcon; group: GroupId;
  req?: boolean; multi?: boolean;
}
export interface Group { id: GroupId; label: string; sub: string; }

export const CATS: Category[] = [
  { id: "cpu",     label: "CPU",               icon: Cpu,               group: "core", req: true },
  { id: "cooler",  label: "Refrigeración CPU", icon: Wind,              group: "core", req: true },
  { id: "mbo",     label: "Placa base",        icon: CircuitBoard,      group: "core", req: true },
  { id: "ram",     label: "Memoria RAM",       icon: MemoryStick,       group: "core", req: true, multi: true },
  { id: "gpu",     label: "Gráfica",           icon: MonitorSmartphone, group: "core" },
  { id: "storage", label: "Almacenamiento",    icon: HardDrive,         group: "core", req: true, multi: true },
  { id: "psu",     label: "Fuente",            icon: Zap,               group: "core", req: true },
  { id: "case",    label: "Caja",              icon: Box,               group: "core", req: true },

  { id: "fan",     label: "Ventiladores",       icon: Fan,       group: "aux", multi: true },
  { id: "hub",     label: "Hub de ventiladores", icon: Layers,   group: "aux" },
  { id: "paste",   label: "Pasta térmica",      icon: Droplet,   group: "aux" },
  { id: "rgb",     label: "Tiras LED / RGB",    icon: Lightbulb, group: "aux", multi: true },
  { id: "cable",   label: "Cables y gestión",   icon: Cable,     group: "aux", multi: true },

  { id: "monitor",  label: "Monitor",     icon: Monitor,    group: "periph", multi: true },
  { id: "keyboard", label: "Teclado",     icon: Keyboard,   group: "periph" },
  { id: "mouse",    label: "Ratón",       icon: Mouse,      group: "periph" },
  { id: "pad",      label: "Alfombrilla", icon: Rows3,      group: "periph" },
  { id: "headset",  label: "Auriculares", icon: Headphones, group: "periph" },
  { id: "mic",      label: "Micrófono",   icon: Mic,        group: "periph" },
  { id: "webcam",   label: "Webcam",      icon: Video,      group: "periph" },
  { id: "speaker",  label: "Altavoces",   icon: Speaker,    group: "periph" },
];

export const GROUPS: Group[] = [
  { id: "core",   label: "Componentes", sub: "Se comprueba compatibilidad" },
  { id: "aux",    label: "Auxiliares",  sub: "Filtrado por caja y placa" },
  { id: "periph", label: "Periféricos", sub: "Sin restricción de montaje" },
];

export const CAT = Object.fromEntries(CATS.map((c) => [c.id, c])) as Record<CatId, Category>;
