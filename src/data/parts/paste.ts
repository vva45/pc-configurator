/* Pasta térmica — datos extraídos línea a línea de forge-configurador.jsx (fase 1).
   ADD replica el add("paste", …) original, sin valores por defecto. */
import type { Row, SpecOf } from "./types";

const rows: Row<"paste">[] = [];
const ADD = (brand: string, name: string, price: number, o: SpecOf<"paste">) => { rows.push({ brand, name, price, ...o }); };

ADD("Thermal Grizzly","Kryonaut 1 g",9,{cond:12.5,type:"Cerámica no conductiva",grams:1,elec:false,cure:false,life:"2 años"});
ADD("Arctic","MX-6 4 g",8,{cond:10.5,type:"Compuesto de carbono",grams:4,elec:false,cure:200,life:"8 años"});
ADD("Thermal Grizzly","Conductonaut Extreme 1 g",19,{cond:73,type:"Metal líquido",grams:1,elec:true,cure:false,life:"—",warn:"Conductivo: no usar sobre aluminio ni cerca de PCB"});

/* ── Expansión de pastas térmicas (petición del usuario, ago 2026): cuando
   el fabricante no publica W/mK se deja cond:0 con nota, sin inventar. ── */
ADD("Thermal Grizzly","Aeronaut 5,5 g",8,{cond:8.5,type:"Cerámica no conductiva",grams:5.5,elec:false,cure:false,life:"3 años"});
ADD("Thermal Grizzly","Hydronaut 5,5 g",8,{cond:11.8,type:"Cerámica no conductiva",grams:5.5,elec:false,cure:false,life:"3 años"});
ADD("Thermal Grizzly","Kryonaut 5,5 g",11,{cond:12.5,type:"Cerámica no conductiva",grams:5.5,elec:false,cure:false,life:"2 años"});
ADD("Thermal Grizzly","Kryonaut Extreme 5,5 g",10,{cond:0,type:"Cerámica no conductiva",grams:5.5,elec:false,cure:false,life:"2 años",warn:"El fabricante no publica conductividad (W/mK)"});
ADD("Thermal Grizzly","Duronaut 5,5 g",10,{cond:0,type:"Cerámica no conductiva",grams:5.5,elec:false,cure:false,life:"5 años",warn:"El fabricante no publica conductividad (W/mK)"});
ADD("Thermal Grizzly","Duronaut Pro 5,5 g",10,{cond:0,type:"Cerámica no conductiva",grams:5.5,elec:false,cure:false,life:"5 años",warn:"El fabricante no publica conductividad (W/mK)"});
ADD("Thermal Grizzly","Conductonaut 1 g",17,{cond:73,type:"Metal líquido",grams:1,elec:true,cure:false,life:"—",warn:"Conductivo: no usar sobre aluminio ni cerca de PCB"});
ADD("Noctua","NT-H1 3,5 g",10,{cond:0,type:"Cerámica no conductiva",grams:3.5,elec:false,cure:false,life:"3 años",warn:"El fabricante no publica conductividad (W/mK)"});
ADD("Noctua","NT-H2 3,5 g",10,{cond:0,type:"Cerámica no conductiva",grams:3.5,elec:false,cure:false,life:"3 años",warn:"El fabricante no publica conductividad (W/mK)"});
ADD("Arctic","MX-2 4 g",6,{cond:5.6,type:"Compuesto de carbono",grams:4,elec:false,cure:false,life:"8 años"});
ADD("Arctic","MX-4 4 g",8,{cond:8.5,type:"Compuesto de carbono",grams:4,elec:false,cure:false,life:"8 años"});
ADD("Arctic","MX-5 4 g",6,{cond:6,type:"Compuesto de carbono",grams:4,elec:false,cure:false,life:"8 años"});
ADD("Arctic","Silver 5 3,5 g",8,{cond:8.8,type:"Cerámica no conductiva",grams:3.5,elec:false,cure:false,life:"8 años"});
ADD("Cooler Master","MasterGel Regular 4 g",6,{cond:5,type:"Cerámica no conductiva",grams:4,elec:false,cure:false,life:"3 años"});
ADD("Cooler Master","MasterGel Pro 4 g",8,{cond:8,type:"Cerámica no conductiva",grams:4,elec:false,cure:false,life:"3 años"});
ADD("Cooler Master","MasterGel Maker 4 g",8,{cond:11,type:"Cerámica no conductiva",grams:4,elec:false,cure:false,life:"3 años"});
ADD("Cooler Master","CryoFuze 2 g",11,{cond:14,type:"Cerámica no conductiva",grams:2,elec:false,cure:false,life:"3 años"});
ADD("Cooler Master","CryoFuze Violet 2 g",11,{cond:12.6,type:"Cerámica no conductiva",grams:2,elec:false,cure:false,life:"3 años"});
ADD("be quiet!","DC2 3 g",6,{cond:7.5,type:"Cerámica no conductiva",grams:3,elec:false,cure:false,life:"3 años"});
ADD("Corsair","TM30 3 g",4,{cond:3.8,type:"Cerámica no conductiva",grams:3,elec:false,cure:false,life:"3 años"});
ADD("Corsair","XTM50 5 g",6,{cond:5,type:"Cerámica no conductiva",grams:5,elec:false,cure:false,life:"3 años"});
ADD("Corsair","XTM70 3 g",6,{cond:6,type:"Cerámica no conductiva",grams:3,elec:false,cure:false,life:"3 años"});
ADD("Thermalright","TF8 2 g",11,{cond:13.8,type:"Cerámica no conductiva",grams:2,elec:false,cure:false,life:"3 años"});
ADD("Thermalright","TF9 2 g",11,{cond:14,type:"Cerámica no conductiva",grams:2,elec:false,cure:false,life:"3 años"});
ADD("Thermalright","TF7 2 g",11,{cond:12.8,type:"Cerámica no conductiva",grams:2,elec:false,cure:false,life:"3 años"});
ADD("Thermalright","TF4 2 g",8,{cond:9.5,type:"Cerámica no conductiva",grams:2,elec:false,cure:false,life:"3 años"});
ADD("Gelid","GC-Extreme 3,5 g",8,{cond:8.5,type:"Cerámica no conductiva",grams:3.5,elec:false,cure:false,life:"5 años"});
ADD("Gelid","GC-4 3,5 g",6,{cond:5.4,type:"Cerámica no conductiva",grams:3.5,elec:false,cure:false,life:"5 años"});
ADD("Gelid","GC-Performance 3,5 g",6,{cond:7.5,type:"Cerámica no conductiva",grams:3.5,elec:false,cure:false,life:"5 años"});
ADD("Alphacool","Apex 4 g",11,{cond:17,type:"Cerámica no conductiva",grams:4,elec:false,cure:false,life:"3 años"});
ADD("Alphacool","Subzero 4 g",11,{cond:16,type:"Cerámica no conductiva",grams:4,elec:false,cure:false,life:"3 años"});
ADD("Alphacool","Eisfrost X 4 g",11,{cond:16.8,type:"Cerámica no conductiva",grams:4,elec:false,cure:false,life:"3 años"});
ADD("EK","EK-TIM Ecotherm 3,5 g",8,{cond:8.5,type:"Cerámica no conductiva",grams:3.5,elec:false,cure:false,life:"3 años"});
ADD("EK","EK-TIM Indigo 1 hoja",12,{cond:0,type:"Cambio de fase",grams:1,elec:false,cure:false,life:"5 años",warn:"El fabricante no publica conductividad (W/mK)"});
ADD("Prolimatech","PK-3 4 g",8,{cond:11.2,type:"Cerámica no conductiva",grams:4,elec:false,cure:false,life:"5 años"});
ADD("Prolimatech","PK-2 4 g",6,{cond:5,type:"Cerámica no conductiva",grams:4,elec:false,cure:false,life:"5 años"});
ADD("Prolimatech","PK-1 4 g",8,{cond:10.2,type:"Cerámica no conductiva",grams:4,elec:false,cure:false,life:"5 años"});
ADD("Shin-Etsu","MicroSi G751 1 g",6,{cond:6,type:"Silicona térmica",grams:1,elec:false,cure:false,life:"5 años"});
ADD("Shin-Etsu","X23-7783D 1 g",6,{cond:6,type:"Silicona térmica",grams:1,elec:false,cure:false,life:"5 años"});
ADD("DOWSIL","TC-5888 4 g",4,{cond:3.8,type:"Silicona térmica",grams:4,elec:false,cure:false,life:"5 años"});
ADD("Honeywell","PTM7950 1 hoja",12,{cond:8.5,type:"Cambio de fase",grams:1,elec:false,cure:false,life:"8 años"});
ADD("IC Diamond","Diamond 7 1,5 g",4,{cond:4.5,type:"Cerámica no conductiva",grams:1.5,elec:false,cure:false,life:"5 años"});
ADD("IC Diamond","Diamond 24 4,8 g",4,{cond:4.5,type:"Cerámica no conductiva",grams:4.8,elec:false,cure:false,life:"5 años"});
ADD("Zalman","ZM-STC8 1,5 g",8,{cond:8.3,type:"Cerámica no conductiva",grams:1.5,elec:false,cure:false,life:"3 años"});
ADD("Zalman","ZM-STC9 4 g",4,{cond:4.1,type:"Cerámica no conductiva",grams:4,elec:false,cure:false,life:"3 años"});
ADD("Xigmatek","PTI-G3606 3 g",6,{cond:6.5,type:"Cerámica no conductiva",grams:3,elec:false,cure:false,life:"3 años"});
ADD("DeepCool","Z5 3 g",4,{cond:1.46,type:"Silicona térmica",grams:3,elec:false,cure:false,life:"3 años"});
ADD("DeepCool","Z3 1,5 g",4,{cond:1.13,type:"Silicona térmica",grams:1.5,elec:false,cure:false,life:"3 años"});
ADD("DeepCool","EX750 5 g",6,{cond:6.2,type:"Cerámica no conductiva",grams:5,elec:false,cure:false,life:"3 años"});
ADD("SYY","SYY-157 2 g",11,{cond:15.7,type:"Cerámica no conductiva",grams:2,elec:false,cure:false,life:"3 años"});
ADD("Halnziye","HY510 10 g",4,{cond:1.93,type:"Silicona térmica",grams:10,elec:false,cure:false,life:"2 años"});
ADD("Jeyi","HPC-200 2 g",11,{cond:14.8,type:"Cerámica no conductiva",grams:2,elec:false,cure:false,life:"3 años"});
ADD("Kingpin Cooling","KPx 3 g",11,{cond:14.3,type:"Cerámica no conductiva",grams:3,elec:false,cure:false,life:"3 años"});
ADD("Coollaboratory","Liquid Ultra 1 g",15,{cond:38.4,type:"Metal líquido",grams:1,elec:true,cure:false,life:"—",warn:"Conductivo: no usar sobre aluminio ni cerca de PCB"});
ADD("Coollaboratory","Liquid Pro 1 g",17,{cond:80,type:"Metal líquido",grams:1,elec:true,cure:false,life:"—",warn:"Conductivo: no usar sobre aluminio ni cerca de PCB"});
ADD("Phobya","HeGrease Extreme 3,5 g",11,{cond:16,type:"Cerámica no conductiva",grams:3.5,elec:false,cure:false,life:"3 años"});

export const PASTE_ROWS = rows;
