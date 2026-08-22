/* Pasta térmica — datos extraídos línea a línea de forge-configurador.jsx (fase 1).
   ADD replica el add("paste", …) original, sin valores por defecto. */
import type { Row, SpecOf } from "./types";

const rows: Row<"paste">[] = [];
const ADD = (brand: string, name: string, price: number, o: SpecOf<"paste">) => { rows.push({ brand, name, price, ...o }); };

ADD("Thermal Grizzly","Kryonaut 1 g",9,{cond:12.5,type:"Cerámica no conductiva",grams:1,elec:false,cure:false,life:"2 años"});
ADD("Arctic","MX-6 4 g",8,{cond:10.5,type:"Compuesto de carbono",grams:4,elec:false,cure:200,life:"8 años"});
ADD("Thermal Grizzly","Conductonaut Extreme 1 g",19,{cond:73,type:"Metal líquido",grams:1,elec:true,cure:false,life:"—",warn:"Conductivo: no usar sobre aluminio ni cerca de PCB"});

export const PASTE_ROWS = rows;
