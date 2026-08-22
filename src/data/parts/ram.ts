/* Memoria RAM — datos extraídos línea a línea de forge-configurador.jsx (fase 1).
   ADD replica el add("ram", …) original, sin valores por defecto;
   R replica el ayudante original con sus defaults. */
import type { Row, SpecOf, WithDefaults } from "./types";

const rows: Row<"ram">[] = [];
const ADD = (brand: string, name: string, price: number, o: SpecOf<"ram">) => { rows.push({ brand, name, price, ...o }); };
const R = (brand: string, name: string, price: number, o: WithDefaults<SpecOf<"ram">, "rgb">) =>
  ADD(brand, name, price, { rgb: false, ...o });

ADD("Corsair","XMS2 8 GB (2×4) DDR2-800 CL5",0,{memType:"DDR2",kit:2,capGB:8,perStick:4,speed:800,cl:5,timings:"5-5-5-18",volt:1.9,profile:"EPP",rgb:false,height:43,watt:8,rank:"2R",die:"Varios",museum:true});
ADD("G.Skill","Trident Z5 Neo RGB 32 GB (2×16) 6000 CL30",119,{memType:"DDR5",kit:2,capGB:32,perStick:16,speed:6000,cl:30,timings:"30-38-38-96",volt:1.35,profile:"EXPO + XMP 3.0",rgb:true,height:44,watt:8,rank:"1R",die:"SK hynix M-die"});
ADD("Corsair","Vengeance 32 GB (2×16) 6000 CL30",109,{memType:"DDR5",kit:2,capGB:32,perStick:16,speed:6000,cl:30,timings:"30-36-36-76",volt:1.4,profile:"EXPO + XMP 3.0",rgb:false,height:34,watt:8,rank:"1R",die:"SK hynix A-die"});
ADD("Corsair","Dominator Titanium RGB 48 GB (2×24) 7200 CL34",289,{memType:"DDR5",kit:2,capGB:48,perStick:24,speed:7200,cl:34,timings:"34-44-44-96",volt:1.45,profile:"XMP 3.0",rgb:true,height:55,watt:10,rank:"1R",die:"SK hynix M-die"});
ADD("Kingston","FURY Beast 64 GB (2×32) 5600 CL36",179,{memType:"DDR5",kit:2,capGB:64,perStick:32,speed:5600,cl:36,timings:"36-38-38-80",volt:1.25,profile:"EXPO + XMP 3.0",rgb:false,height:35,watt:11,rank:"2R",die:"Micron"});
ADD("G.Skill","Flare X5 32 GB (2×16) 6000 CL32",105,{memType:"DDR5",kit:2,capGB:32,perStick:16,speed:6000,cl:32,timings:"32-38-38-96",volt:1.35,profile:"EXPO",rgb:false,height:33,watt:8,rank:"1R",die:"SK hynix"});
ADD("G.Skill","Trident Z Neo 32 GB (2×16) 3600 CL16",89,{memType:"DDR4",kit:2,capGB:32,perStick:16,speed:3600,cl:16,timings:"16-19-19-39",volt:1.35,profile:"XMP 2.0",rgb:true,height:44,watt:6,rank:"1R",die:"Samsung B-die"});
ADD("Corsair","Vengeance LPX 16 GB (2×8) 3200 CL16",39,{memType:"DDR4",kit:2,capGB:16,perStick:8,speed:3200,cl:16,timings:"16-18-18-36",volt:1.35,profile:"XMP 2.0",rgb:false,height:34,watt:5,rank:"1R",die:"Varios"});
ADD("Kingston","FURY Renegade 32 GB (2×16) 3600 CL16",95,{memType:"DDR4",kit:2,capGB:32,perStick:16,speed:3600,cl:16,timings:"16-20-20-38",volt:1.35,profile:"XMP 2.0",rgb:false,height:40,watt:6,rank:"1R",die:"Varios"});
ADD("Corsair","Vengeance 16 GB (2×8) 1600 CL9",0,{memType:"DDR3",kit:2,capGB:16,perStick:8,speed:1600,cl:9,timings:"9-9-9-24",volt:1.5,profile:"XMP 1.3",rgb:false,height:43,watt:6,rank:"2R",die:"Varios",museum:true});
ADD("Kingston","Server Premier 64 GB RDIMM 5600 CL46",329,{memType:"DDR5-RDIMM",kit:1,capGB:64,perStick:64,speed:5600,cl:46,timings:"46-45-45",volt:1.1,profile:"JEDEC ECC",rgb:false,height:32,watt:12,rank:"2R",die:"ECC registrada"});
R("G.Skill","Trident Z5 RGB 32 GB (2×16) 7200 CL34",189,{memType:"DDR5",kit:2,capGB:32,perStick:16,speed:7200,cl:34,timings:"34-45-45-115",volt:1.4,profile:"XMP 3.0",rgb:true,height:44,watt:9,rank:"1R",die:"SK hynix M-die"});
R("G.Skill","Ripjaws S5 64 GB (2×32) 6000 CL30",219,{memType:"DDR5",kit:2,capGB:64,perStick:32,speed:6000,cl:30,timings:"30-40-40-96",volt:1.4,profile:"EXPO + XMP 3.0",height:32,watt:11,rank:"2R",die:"SK hynix"});
R("Corsair","Vengeance RGB 96 GB (2×48) 6600 CL32",399,{memType:"DDR5",kit:2,capGB:96,perStick:48,speed:6600,cl:32,timings:"32-39-39-76",volt:1.4,profile:"XMP 3.0",rgb:true,height:44,watt:13,rank:"2R",die:"SK hynix M-die"});
R("Kingston","FURY Renegade RGB 32 GB (2×16) 6400 CL32",159,{memType:"DDR5",kit:2,capGB:32,perStick:16,speed:6400,cl:32,timings:"32-39-39-80",volt:1.4,profile:"XMP 3.0",rgb:true,height:44,watt:9,rank:"1R",die:"SK hynix"});
R("Crucial","Pro 32 GB (2×16) 5600 CL46",89,{memType:"DDR5",kit:2,capGB:32,perStick:16,speed:5600,cl:46,timings:"46-45-45",volt:1.1,profile:"JEDEC",height:31,watt:7,rank:"1R",die:"Micron"});
R("TeamGroup","T-Force Delta RGB 16 GB (2×8) 6000 CL38",69,{memType:"DDR5",kit:2,capGB:16,perStick:8,speed:6000,cl:38,timings:"38-38-38-78",volt:1.25,profile:"XMP 3.0",rgb:true,height:44,watt:6,rank:"1R",die:"SK hynix"});
R("Corsair","Vengeance LPX 32 GB (2×16) 3600 CL18",69,{memType:"DDR4",kit:2,capGB:32,perStick:16,speed:3600,cl:18,timings:"18-22-22-42",volt:1.35,profile:"XMP 2.0",height:34,watt:6,rank:"1R",die:"Varios"});
R("Corsair","Vengeance RGB PRO 64 GB (4×16) 3200 CL16",149,{memType:"DDR4",kit:4,capGB:64,perStick:16,speed:3200,cl:16,timings:"16-20-20-38",volt:1.35,profile:"XMP 2.0",rgb:true,height:51,watt:12,rank:"2R",die:"Varios"});
R("G.Skill","Ripjaws V 16 GB (2×8) 3200 CL16",39,{memType:"DDR4",kit:2,capGB:16,perStick:8,speed:3200,cl:16,timings:"16-18-18-38",volt:1.35,profile:"XMP 2.0",height:42,watt:5,rank:"1R",die:"Varios"});
R("Crucial","Ballistix 32 GB (2×16) 3600 CL16",0,{memType:"DDR4",kit:2,capGB:32,perStick:16,speed:3600,cl:16,timings:"16-18-18-38",volt:1.35,profile:"XMP 2.0",height:39,watt:6,rank:"1R",die:"Micron E-die"});
R("Kingston","ValueRAM 16 GB (1×16) 2666 CL19",39,{memType:"DDR4",kit:1,capGB:16,perStick:16,speed:2666,cl:19,timings:"19-19-19",volt:1.2,profile:"JEDEC",height:31,watt:3,rank:"2R",die:"Varios"});
R("G.Skill","Ripjaws X 8 GB (2×4) 1600 CL9",0,{memType:"DDR3",kit:2,capGB:8,perStick:4,speed:1600,cl:9,timings:"9-9-9-24",volt:1.5,profile:"XMP 1.3",height:40,watt:5,rank:"1R",die:"Varios"});
R("Kingston","HyperX Fury 16 GB (2×8) 1866 CL10",0,{memType:"DDR3",kit:2,capGB:16,perStick:8,speed:1866,cl:10,timings:"10-11-10-30",volt:1.5,profile:"XMP 1.3",height:35,watt:6,rank:"2R",die:"Varios"});
R("Crucial","32 GB (2×16) DDR3L 1600 CL11",0,{memType:"DDR3",kit:2,capGB:32,perStick:16,speed:1600,cl:11,timings:"11-11-11-28",volt:1.35,profile:"JEDEC",height:30,watt:6,rank:"2R",die:"Micron"});
R("Kingston","Server Premier 32 GB RDIMM 4800 CL40",189,{memType:"DDR5-RDIMM",kit:1,capGB:32,perStick:32,speed:4800,cl:40,timings:"40-39-39",volt:1.1,profile:"JEDEC ECC",height:32,watt:9,rank:"2R",die:"ECC registrada"});
R("Micron","128 GB RDIMM 5600 CL46",849,{memType:"DDR5-RDIMM",kit:1,capGB:128,perStick:128,speed:5600,cl:46,timings:"46-45-45",volt:1.1,profile:"JEDEC ECC",height:32,watt:15,rank:"4R",die:"ECC registrada"});

export const RAM_ROWS = rows;
