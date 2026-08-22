/* ── CATÁLOGO ────────────────────────────────────────────────────────
   Precios = orientativos EUR (referencia de encaje de presupuesto).
   Un fichero por categoría; aquí se ensambla P y se asignan los ids.
   El id es `cat-índice` dentro de su categoría (en el monolito era la
   posición global de inserción; nada visible depende del valor).
   ─────────────────────────────────────────────────────────────────── */
import type { CatId, CatMap, Part, Row } from "./types";
import { CPU_ROWS } from "./cpu";
import { MBO_ROWS } from "./mbo";
import { RAM_ROWS } from "./ram";
import { GPU_ROWS } from "./gpu";
import { STORAGE_ROWS } from "./storage";
import { PSU_ROWS } from "./psu";
import { CASE_ROWS } from "./case";
import { COOLER_ROWS } from "./cooler";
import { FAN_ROWS } from "./fan";
import { HUB_ROWS } from "./hub";
import { PASTE_ROWS } from "./paste";
import { RGB_ROWS } from "./rgb";
import { CABLE_ROWS } from "./cable";
import { MONITOR_ROWS } from "./monitor";
import { KEYBOARD_ROWS } from "./keyboard";
import { MOUSE_ROWS } from "./mouse";
import { PAD_ROWS } from "./pad";
import { HEADSET_ROWS } from "./headset";
import { MIC_ROWS } from "./mic";
import { WEBCAM_ROWS } from "./webcam";
import { SPEAKER_ROWS } from "./speaker";

const withIds = <K extends CatId>(cat: K, rows: Row<K>[]): CatMap[K][] =>
  rows.map((r, i) => ({ id: `${cat}-${i}`, cat, ...r }) as CatMap[K]);

/* Mismo orden de bloques que el monolito (la vista por categoría y los
   tests dependen del orden dentro de cada categoría, no entre ellas). */
export const P: Part[] = [
  ...withIds("cpu", CPU_ROWS),
  ...withIds("mbo", MBO_ROWS),
  ...withIds("ram", RAM_ROWS),
  ...withIds("gpu", GPU_ROWS),
  ...withIds("storage", STORAGE_ROWS),
  ...withIds("psu", PSU_ROWS),
  ...withIds("case", CASE_ROWS),
  ...withIds("cooler", COOLER_ROWS),
  ...withIds("fan", FAN_ROWS),
  ...withIds("hub", HUB_ROWS),
  ...withIds("paste", PASTE_ROWS),
  ...withIds("rgb", RGB_ROWS),
  ...withIds("cable", CABLE_ROWS),
  ...withIds("monitor", MONITOR_ROWS),
  ...withIds("keyboard", KEYBOARD_ROWS),
  ...withIds("mouse", MOUSE_ROWS),
  ...withIds("pad", PAD_ROWS),
  ...withIds("headset", HEADSET_ROWS),
  ...withIds("mic", MIC_ROWS),
  ...withIds("webcam", WEBCAM_ROWS),
  ...withIds("speaker", SPEAKER_ROWS),
];

export * from "./types";
