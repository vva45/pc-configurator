/* Cables y gestión — datos extraídos línea a línea de forge-configurador.jsx (fase 1).
   ADD replica el add("cable", …) original, sin valores por defecto. */
import type { Row, SpecOf } from "./types";

const rows: Row<"cable">[] = [];
const ADD = (brand: string, name: string, price: number, o: SpecOf<"cable">) => { rows.push({ brand, name, price, ...o }); };

ADD("CableMod","Pro ModMesh Kit ATX/EPS/PCIe",99,{kind:"Kit de extensores sleeved",pieces:6,len:300,combs:true,color:"Múltiples"});
ADD("Corsair","Premium 12VHPWR 600 W Type-4",39,{kind:"Cable 12V-2×6 nativo",pieces:1,len:650,combs:true,color:"Negro"});
ADD("Velcro","Bridas reutilizables 20 uds.",6,{kind:"Gestión de cables",pieces:20,len:200,combs:false,color:"Negro"});
ADD("Noctua","NA-SEC1 Extensores PWM 30 cm (3 uds.)",8,{kind:"Extensor 4-pin PWM",pieces:3,len:300,combs:false,color:"Negro"});

export const CABLE_ROWS = rows;
