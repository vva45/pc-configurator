/* Micrófonos — datos extraídos línea a línea de forge-configurador.jsx (fase 1).
   ADD replica el add("mic", …) original, sin valores por defecto. */
import type { Row, SpecOf } from "./types";

const rows: Row<"mic">[] = [];
const ADD = (brand: string, name: string, price: number, o: SpecOf<"mic">) => { rows.push({ brand, name, price, ...o }); };

ADD("Shure","MV7+",299,{type:"Dinámico cardioide",conn:"USB-C + XLR",rate:"48 kHz / 24 bit",arm:false,shock:false,watt:2.5});
ADD("Elgato","Wave:3",149,{type:"Condensador cardioide",conn:"USB-C",rate:"96 kHz / 24 bit",arm:false,shock:false,watt:2.5});

export const MIC_ROWS = rows;
