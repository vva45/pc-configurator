/* Teclados — datos extraídos línea a línea de forge-configurador.jsx (fase 1).
   ADD replica el add("keyboard", …) original, sin valores por defecto. */
import type { Row, SpecOf } from "./types";

const rows: Row<"keyboard">[] = [];
const ADD = (brand: string, name: string, price: number, o: SpecOf<"keyboard">) => { rows.push({ brand, name, price, ...o }); };

ADD("Keychron","Q1 Pro QMK/VIA",199,{layout:"75%",switches:"Gateron Jupiter Banana",hotswap:true,conn:"USB-C + BT 5.1 + 2,4 GHz",kc:"PBT double-shot",case:"Aluminio CNC",rgb:true,rot:1000,watt:2.5});
ADD("Logitech","G915 TKL Lightspeed",199,{layout:"TKL",switches:"GL Tactile low-profile",hotswap:false,conn:"Lightspeed 2,4 GHz + BT",kc:"ABS",case:"Aluminio",rgb:true,rot:1000,watt:2});
ADD("Razer","Huntsman V3 Pro TKL",249,{layout:"TKL",switches:"Analógico óptico gen-2 (Rapid Trigger)",hotswap:false,conn:"USB-C",kc:"PBT double-shot",case:"Aluminio",rgb:true,rot:8000,watt:3});

export const KEYBOARD_ROWS = rows;
