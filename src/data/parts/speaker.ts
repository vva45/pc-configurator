/* Altavoces — datos extraídos línea a línea de forge-configurador.jsx (fase 1).
   ADD replica el add("speaker", …) original, sin valores por defecto. */
import type { Row, SpecOf } from "./types";

const rows: Row<"speaker">[] = [];
const ADD = (brand: string, name: string, price: number, o: SpecOf<"speaker">) => { rows.push({ brand, name, price, ...o }); };

ADD("Edifier","MR4",119,{type:"Monitores activos 2.0",power:42,drivers:"4\" + 1\" tweeter",conn:"TRS, RCA, AUX",sub:false,bt:false,watt:42});
ADD("Logitech","Z407",99,{type:"2.1 con subwoofer",power:40,drivers:"Satélites + sub 4\"",conn:"BT, USB, 3,5 mm",sub:true,bt:true,watt:40});

export const SPEAKER_ROWS = rows;
