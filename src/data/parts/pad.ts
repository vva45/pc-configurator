/* Alfombrillas — datos extraídos línea a línea de forge-configurador.jsx (fase 1).
   ADD replica el add("pad", …) original, sin valores por defecto. */
import type { Row, SpecOf } from "./types";

const rows: Row<"pad">[] = [];
const ADD = (brand: string, name: string, price: number, o: SpecOf<"pad">) => { rows.push({ brand, name, price, ...o }); };

ADD("Artisan","Hien Mid XL",65,{w:420,h:330,thick:3,surface:"Tela Hien (rápida)",base:"Caucho",stitch:false,rgb:false,washable:true});
ADD("Logitech","G840 XL",49,{w:900,h:400,thick:3,surface:"Tela con revestimiento",base:"Caucho",stitch:false,rgb:false,washable:true});
ADD("Corsair","MM700 RGB Extended",79,{w:930,h:400,thick:4,surface:"Tela microtejida",base:"Caucho antideslizante",stitch:true,rgb:true,washable:false,watt:2.5});

export const PAD_ROWS = rows;
