/* Gráficas — datos extraídos línea a línea de forge-configurador.jsx (fase 1).
   ADD replica el add("gpu", …) original, sin valores por defecto;
   G replica el ayudante original con sus defaults. */
import type { Row, SpecOf, WithDefaults } from "./types";

const rows: Row<"gpu">[] = [];
const ADD = (brand: string, name: string, price: number, o: SpecOf<"gpu">) => { rows.push({ brand, name, price, ...o }); };
const G = (brand: string, name: string, price: number, o: WithDefaults<SpecOf<"gpu">, "conn8" | "conn6" | "hpwr" | "seg">) =>
  ADD(brand, name, price, { conn8: 0, conn6: 0, hpwr: false, seg: "Gaming", ...o });

ADD("NVIDIA","GeForce RTX 5090 Founders Edition",1999,{chip:"GB202",vram:32,vtype:"GDDR7",bus:512,tbp:575,len:304,slots:2,pcie:"5.0 ×16",power:"1× 12V-2×6 (600 W)",hpwr:true,conn8:4,psuMin:1000,outs:"3× DP 2.1b, 1× HDMI 2.1b",boost:2.41,cuda:21760,year:2025});
ADD("ASUS","ROG Astral RTX 5090 OC",2499,{chip:"GB202",vram:32,vtype:"GDDR7",bus:512,tbp:600,len:358,slots:4,pcie:"5.0 ×16",power:"1× 12V-2×6 (600 W)",hpwr:true,conn8:4,psuMin:1000,outs:"3× DP 2.1b, 2× HDMI 2.1b",boost:2.58,cuda:21760,year:2025});
ADD("NVIDIA","GeForce RTX 5080 Founders Edition",1169,{chip:"GB203",vram:16,vtype:"GDDR7",bus:256,tbp:360,len:304,slots:2,pcie:"5.0 ×16",power:"1× 12V-2×6 (450 W)",hpwr:true,conn8:3,psuMin:850,outs:"3× DP 2.1b, 1× HDMI 2.1b",boost:2.62,cuda:10752,year:2025});
ADD("MSI","GeForce RTX 5070 Ti Gaming Trio OC",879,{chip:"GB203",vram:16,vtype:"GDDR7",bus:256,tbp:300,len:337,slots:3,pcie:"5.0 ×16",power:"1× 12V-2×6 (450 W)",hpwr:true,conn8:2,psuMin:750,outs:"3× DP 2.1b, 1× HDMI 2.1b",boost:2.51,cuda:8960,year:2025});
ADD("Gigabyte","GeForce RTX 4060 WINDFORCE OC 8G",299,{chip:"AD107",vram:8,vtype:"GDDR6",bus:128,tbp:115,len:192,slots:2,pcie:"4.0 ×8",power:"1× 8 pines",conn8:1,psuMin:450,outs:"2× DP 1.4a, 2× HDMI 2.1",boost:2.49,cuda:3072,year:2023});
ADD("Sapphire","NITRO+ Radeon RX 9070 XT",759,{chip:"Navi 48",vram:16,vtype:"GDDR6",bus:256,tbp:340,len:326,slots:3,pcie:"5.0 ×16",power:"3× 8 pines",conn8:3,psuMin:850,outs:"3× DP 2.1a, 1× HDMI 2.1b",boost:3.06,cuda:4096,year:2025});
ADD("AMD","Radeon RX 7900 XTX",899,{chip:"Navi 31",vram:24,vtype:"GDDR6",bus:384,tbp:355,len:287,slots:2.5,pcie:"4.0 ×16",power:"2× 8 pines",conn8:2,psuMin:800,outs:"2× DP 2.1, 1× HDMI 2.1, 1× USB-C",boost:2.5,cuda:6144,year:2022});
ADD("XFX","Speedster SWFT Radeon RX 6600",189,{chip:"Navi 23",vram:8,vtype:"GDDR6",bus:128,tbp:132,len:212,slots:2,pcie:"4.0 ×8",power:"1× 8 pines",conn8:1,psuMin:450,outs:"3× DP 1.4, 1× HDMI 2.1",boost:2.49,cuda:1792,year:2021});
ADD("Intel","Arc B580 Limited Edition",279,{chip:"BMG-G21",vram:12,vtype:"GDDR6",bus:192,tbp:190,len:272,slots:2,pcie:"4.0 ×8",power:"1× 8 pines + 1× 6 pines",conn8:1,conn6:1,psuMin:600,outs:"3× DP 2.1, 1× HDMI 2.1",boost:2.67,cuda:2560,year:2024});

// NVIDIA · entrada y oficina
G("NVIDIA","GeForce GT 710 2 GB",45,{chip:"GK208B",vram:2,vtype:"DDR3",bus:64,tbp:19,len:146,slots:1,pcie:"2.0 ×8",power:"Sin conector adicional",psuMin:300,outs:"1× VGA, 1× DVI, 1× HDMI 1.4",boost:0.95,cuda:192,year:2014,seg:"Oficina",legacy:true});
G("NVIDIA","GeForce GT 730 2 GB GDDR5",59,{chip:"GK208B",vram:2,vtype:"GDDR5",bus:64,tbp:38,len:150,slots:1,pcie:"2.0 ×8",power:"Sin conector adicional",psuMin:300,outs:"1× VGA, 1× DVI, 1× HDMI 1.4",boost:0.9,cuda:384,year:2014,seg:"Oficina",legacy:true});
G("NVIDIA","GeForce GT 1030 2 GB GDDR5",79,{chip:"GP108",vram:2,vtype:"GDDR5",bus:64,tbp:30,len:150,slots:1,pcie:"3.0 ×4",power:"Sin conector adicional",psuMin:300,outs:"1× DVI, 1× HDMI 2.0b",boost:1.47,cuda:384,year:2017,seg:"Oficina"});
G("NVIDIA","GeForce GTX 750 Ti 2 GB",0,{chip:"GM107",vram:2,vtype:"GDDR5",bus:128,tbp:60,len:145,slots:2,pcie:"3.0 ×16",power:"Sin conector adicional",psuMin:300,outs:"1× VGA, 1× DVI, 1× HDMI",boost:1.085,cuda:640,year:2014,legacy:true});
// NVIDIA · Maxwell y Pascal
G("NVIDIA","GeForce GTX 960 2 GB",0,{chip:"GM206",vram:2,vtype:"GDDR5",bus:128,tbp:120,len:250,slots:2,pcie:"3.0 ×16",power:"1× 6 pines",conn6:1,psuMin:400,outs:"3× DP 1.2, 1× DVI, 1× HDMI 2.0",boost:1.178,cuda:1024,year:2015,legacy:true});
G("NVIDIA","GeForce GTX 970 4 GB",0,{chip:"GM204",vram:4,vtype:"GDDR5",bus:256,tbp:145,len:267,slots:2,pcie:"3.0 ×16",power:"2× 6 pines",conn6:2,psuMin:500,outs:"3× DP 1.2, 1× DVI, 1× HDMI 2.0",boost:1.178,cuda:1664,year:2014,legacy:true});
G("NVIDIA","GeForce GTX 980 Ti 6 GB",0,{chip:"GM200",vram:6,vtype:"GDDR5",bus:384,tbp:250,len:267,slots:2,pcie:"3.0 ×16",power:"1× 8 pines + 1× 6 pines",conn8:1,conn6:1,psuMin:600,outs:"3× DP 1.2, 1× DVI, 1× HDMI 2.0",boost:1.075,cuda:2816,year:2015,legacy:true});
G("NVIDIA","GeForce GTX 1050 Ti 4 GB",0,{chip:"GP107",vram:4,vtype:"GDDR5",bus:128,tbp:75,len:145,slots:2,pcie:"3.0 ×16",power:"Sin conector adicional",psuMin:300,outs:"1× DP 1.4, 1× DVI, 1× HDMI 2.0",boost:1.392,cuda:768,year:2016,legacy:true});
G("NVIDIA","GeForce GTX 1060 6 GB",0,{chip:"GP106",vram:6,vtype:"GDDR5",bus:192,tbp:120,len:250,slots:2,pcie:"3.0 ×16",power:"1× 6 pines",conn6:1,psuMin:400,outs:"3× DP 1.4, 1× DVI, 1× HDMI 2.0",boost:1.708,cuda:1280,year:2016,legacy:true});
G("NVIDIA","GeForce GTX 1070 8 GB",0,{chip:"GP104",vram:8,vtype:"GDDR5",bus:256,tbp:150,len:267,slots:2,pcie:"3.0 ×16",power:"1× 8 pines",conn8:1,psuMin:500,outs:"3× DP 1.4, 1× DVI, 1× HDMI 2.0",boost:1.683,cuda:1920,year:2016,legacy:true});
G("NVIDIA","GeForce GTX 1080 Ti 11 GB",0,{chip:"GP102",vram:11,vtype:"GDDR5X",bus:352,tbp:250,len:267,slots:2,pcie:"3.0 ×16",power:"1× 8 pines + 1× 6 pines",conn8:1,conn6:1,psuMin:600,outs:"3× DP 1.4, 1× HDMI 2.0b",boost:1.582,cuda:3584,year:2017,legacy:true});
// NVIDIA · Turing
G("NVIDIA","GeForce GTX 1650 4 GB",129,{chip:"TU117",vram:4,vtype:"GDDR5",bus:128,tbp:75,len:145,slots:2,pcie:"3.0 ×16",power:"Sin conector adicional",psuMin:300,outs:"1× DP 1.4, 1× HDMI 2.0b",boost:1.665,cuda:896,year:2019});
G("NVIDIA","GeForce GTX 1660 SUPER 6 GB",179,{chip:"TU116",vram:6,vtype:"GDDR6",bus:192,tbp:125,len:229,slots:2,pcie:"3.0 ×16",power:"1× 8 pines",conn8:1,psuMin:450,outs:"1× DP 1.4, 1× HDMI 2.0b",boost:1.785,cuda:1408,year:2019});
G("NVIDIA","GeForce RTX 2060 6 GB",0,{chip:"TU106",vram:6,vtype:"GDDR6",bus:192,tbp:160,len:229,slots:2,pcie:"3.0 ×16",power:"1× 8 pines",conn8:1,psuMin:500,outs:"1× DP 1.4, 1× HDMI 2.0b",boost:1.68,cuda:1920,year:2019,legacy:true});
G("NVIDIA","GeForce RTX 2070 SUPER 8 GB",0,{chip:"TU104",vram:8,vtype:"GDDR6",bus:256,tbp:215,len:267,slots:2,pcie:"3.0 ×16",power:"1× 8 pines + 1× 6 pines",conn8:1,conn6:1,psuMin:650,outs:"3× DP 1.4, 1× HDMI 2.0b, 1× USB-C",boost:1.77,cuda:2560,year:2019,legacy:true});
G("NVIDIA","GeForce RTX 2080 Ti 11 GB",0,{chip:"TU102",vram:11,vtype:"GDDR6",bus:352,tbp:250,len:267,slots:2,pcie:"3.0 ×16",power:"2× 8 pines",conn8:2,psuMin:650,outs:"3× DP 1.4, 1× HDMI 2.0b, 1× USB-C",boost:1.545,cuda:4352,year:2018,legacy:true});
// NVIDIA · Ampere
G("NVIDIA","GeForce RTX 3050 8 GB",219,{chip:"GA106",vram:8,vtype:"GDDR6",bus:128,tbp:130,len:200,slots:2,pcie:"4.0 ×8",power:"1× 8 pines",conn8:1,psuMin:550,outs:"3× DP 1.4a, 1× HDMI 2.1",boost:1.777,cuda:2560,year:2022});
G("NVIDIA","GeForce RTX 3060 12 GB",259,{chip:"GA106",vram:12,vtype:"GDDR6",bus:192,tbp:170,len:242,slots:2,pcie:"4.0 ×16",power:"1× 8 pines",conn8:1,psuMin:550,outs:"3× DP 1.4a, 1× HDMI 2.1",boost:1.777,cuda:3584,year:2021});
G("NVIDIA","GeForce RTX 3060 Ti 8 GB",0,{chip:"GA104",vram:8,vtype:"GDDR6",bus:256,tbp:200,len:242,slots:2,pcie:"4.0 ×16",power:"2× 8 pines",conn8:2,psuMin:600,outs:"3× DP 1.4a, 1× HDMI 2.1",boost:1.665,cuda:4864,year:2020,legacy:true});
G("NVIDIA","GeForce RTX 3070 8 GB",0,{chip:"GA104",vram:8,vtype:"GDDR6",bus:256,tbp:220,len:242,slots:2,pcie:"4.0 ×16",power:"2× 8 pines",conn8:2,psuMin:650,outs:"3× DP 1.4a, 1× HDMI 2.1",boost:1.725,cuda:5888,year:2020,legacy:true});
G("NVIDIA","GeForce RTX 3080 10 GB",0,{chip:"GA102",vram:10,vtype:"GDDR6X",bus:320,tbp:320,len:285,slots:2,pcie:"4.0 ×16",power:"2× 8 pines",conn8:2,psuMin:750,outs:"3× DP 1.4a, 1× HDMI 2.1",boost:1.71,cuda:8704,year:2020,legacy:true});
G("NVIDIA","GeForce RTX 3090 24 GB",0,{chip:"GA102",vram:24,vtype:"GDDR6X",bus:384,tbp:350,len:313,slots:3,pcie:"4.0 ×16",power:"2× 8 pines",conn8:2,psuMin:750,outs:"3× DP 1.4a, 1× HDMI 2.1",boost:1.695,cuda:10496,year:2020,legacy:true});
// NVIDIA · Ada
G("NVIDIA","GeForce RTX 4060 Ti 16 GB",429,{chip:"AD106",vram:16,vtype:"GDDR6",bus:128,tbp:165,len:244,slots:2,pcie:"4.0 ×8",power:"1× 8 pines",conn8:1,psuMin:550,outs:"3× DP 1.4a, 1× HDMI 2.1",boost:2.54,cuda:4352,year:2023});
G("NVIDIA","GeForce RTX 4070 SUPER 12 GB",599,{chip:"AD104",vram:12,vtype:"GDDR6X",bus:192,tbp:220,len:244,slots:2,pcie:"4.0 ×16",power:"1× 12VHPWR (adaptador 2× 8 pines)",hpwr:true,conn8:2,psuMin:650,outs:"3× DP 1.4a, 1× HDMI 2.1",boost:2.475,cuda:7168,year:2024});
G("NVIDIA","GeForce RTX 4070 Ti SUPER 16 GB",799,{chip:"AD103",vram:16,vtype:"GDDR6X",bus:256,tbp:285,len:304,slots:3,pcie:"4.0 ×16",power:"1× 12VHPWR (adaptador 2× 8 pines)",hpwr:true,conn8:2,psuMin:700,outs:"3× DP 1.4a, 1× HDMI 2.1",boost:2.61,cuda:8448,year:2024});
G("NVIDIA","GeForce RTX 4080 SUPER 16 GB",1099,{chip:"AD103",vram:16,vtype:"GDDR6X",bus:256,tbp:320,len:304,slots:3,pcie:"4.0 ×16",power:"1× 12VHPWR (adaptador 3× 8 pines)",hpwr:true,conn8:3,psuMin:750,outs:"3× DP 1.4a, 1× HDMI 2.1",boost:2.55,cuda:10240,year:2024});
G("NVIDIA","GeForce RTX 4090 24 GB",1799,{chip:"AD102",vram:24,vtype:"GDDR6X",bus:384,tbp:450,len:304,slots:3,pcie:"4.0 ×16",power:"1× 12VHPWR (adaptador 4× 8 pines)",hpwr:true,conn8:4,psuMin:850,outs:"3× DP 1.4a, 1× HDMI 2.1",boost:2.52,cuda:16384,year:2022});
// NVIDIA · Blackwell
G("NVIDIA","GeForce RTX 5060 Ti 16 GB",459,{chip:"GB206",vram:16,vtype:"GDDR7",bus:128,tbp:180,len:244,slots:2,pcie:"5.0 ×8",power:"1× 12V-2×6 (300 W)",hpwr:true,conn8:2,psuMin:600,outs:"3× DP 2.1b, 1× HDMI 2.1b",boost:2.572,cuda:4608,year:2025});
G("NVIDIA","GeForce RTX 5070 12 GB",629,{chip:"GB205",vram:12,vtype:"GDDR7",bus:192,tbp:250,len:242,slots:2,pcie:"5.0 ×16",power:"1× 12V-2×6 (300 W)",hpwr:true,conn8:2,psuMin:650,outs:"3× DP 2.1b, 1× HDMI 2.1b",boost:2.512,cuda:6144,year:2025});
// NVIDIA · profesionales
G("NVIDIA","RTX A2000 12 GB",0,{chip:"GA106",vram:12,vtype:"GDDR6 ECC",bus:192,tbp:70,len:168,slots:2,pcie:"4.0 ×16",power:"Sin conector adicional",psuMin:450,outs:"4× mDP 1.4",boost:1.2,cuda:3328,year:2021,seg:"Profesional",legacy:true});
G("NVIDIA","RTX A4000 16 GB",0,{chip:"GA104",vram:16,vtype:"GDDR6 ECC",bus:256,tbp:140,len:241,slots:1,pcie:"4.0 ×16",power:"1× 6 pines",conn6:1,psuMin:550,outs:"4× DP 1.4",boost:1.56,cuda:6144,year:2021,seg:"Profesional",legacy:true});
G("NVIDIA","RTX 4000 Ada 20 GB",1349,{chip:"AD104",vram:20,vtype:"GDDR6 ECC",bus:160,tbp:130,len:241,slots:1,pcie:"4.0 ×16",power:"1× 8 pines",conn8:1,psuMin:550,outs:"4× DP 1.4a",boost:2.175,cuda:6144,year:2023,seg:"Profesional"});
G("NVIDIA","RTX 6000 Ada 48 GB",7499,{chip:"AD102",vram:48,vtype:"GDDR6 ECC",bus:384,tbp:300,len:267,slots:2,pcie:"4.0 ×16",power:"1× 12VHPWR",hpwr:true,conn8:2,psuMin:750,outs:"4× DP 1.4a",boost:2.505,cuda:18176,year:2022,seg:"Profesional"});
G("NVIDIA","RTX PRO 6000 Blackwell 96 GB",8999,{chip:"GB202",vram:96,vtype:"GDDR7 ECC",bus:512,tbp:600,len:305,slots:2,pcie:"5.0 ×16",power:"1× 12V-2×6 (600 W)",hpwr:true,conn8:4,psuMin:1000,outs:"4× DP 2.1b",boost:2.617,cuda:24064,year:2025,seg:"Profesional"});
G("NVIDIA","Quadro P2000 5 GB",0,{chip:"GP106",vram:5,vtype:"GDDR5",bus:160,tbp:75,len:200,slots:1,pcie:"3.0 ×16",power:"Sin conector adicional",psuMin:350,outs:"4× DP 1.4",boost:1.48,cuda:1024,year:2017,seg:"Profesional",legacy:true});
// AMD · leyendas HD y R
G("AMD","Radeon HD 4870 1 GB",0,{chip:"RV770",vram:1,vtype:"GDDR5",bus:256,tbp:160,len:241,slots:2,pcie:"2.0 ×16",power:"2× 6 pines",conn6:2,psuMin:500,outs:"2× DVI, 1× S-Video",boost:0.75,cuda:800,year:2008,seg:"Clásica",legacy:true});
G("AMD","Radeon HD 5870 1 GB",0,{chip:"Cypress XT",vram:1,vtype:"GDDR5",bus:256,tbp:188,len:282,slots:2,pcie:"2.1 ×16",power:"2× 6 pines",conn6:2,psuMin:500,outs:"2× DVI, 1× HDMI, 1× DP",boost:0.85,cuda:1600,year:2009,seg:"Clásica",legacy:true});
G("AMD","Radeon HD 7970 GHz Edition 3 GB",0,{chip:"Tahiti XT2",vram:3,vtype:"GDDR5",bus:384,tbp:250,len:275,slots:2,pcie:"3.0 ×16",power:"1× 8 pines + 1× 6 pines",conn8:1,conn6:1,psuMin:600,outs:"1× DVI, 1× HDMI, 2× mDP",boost:1.05,cuda:2048,year:2012,seg:"Clásica",legacy:true});
G("AMD","Radeon R7 260X 2 GB",0,{chip:"Bonaire XTX",vram:2,vtype:"GDDR5",bus:128,tbp:115,len:213,slots:2,pcie:"3.0 ×16",power:"1× 6 pines",conn6:1,psuMin:450,outs:"2× DVI, 1× HDMI, 1× DP",boost:1.1,cuda:896,year:2013,seg:"Clásica",legacy:true});
G("AMD","Radeon R9 280X 3 GB",0,{chip:"Tahiti XTL",vram:3,vtype:"GDDR5",bus:384,tbp:250,len:276,slots:2,pcie:"3.0 ×16",power:"1× 8 pines + 1× 6 pines",conn8:1,conn6:1,psuMin:600,outs:"2× DVI, 1× HDMI, 2× mDP",boost:1.0,cuda:2048,year:2013,seg:"Clásica",legacy:true});
G("AMD","Radeon R9 290X 4 GB",0,{chip:"Hawaii XT",vram:4,vtype:"GDDR5",bus:512,tbp:290,len:275,slots:2,pcie:"3.0 ×16",power:"1× 8 pines + 1× 6 pines",conn8:1,conn6:1,psuMin:750,outs:"2× DVI, 1× HDMI, 1× DP",boost:1.0,cuda:2816,year:2013,seg:"Clásica",legacy:true});
G("AMD","Radeon R9 Fury X 4 GB HBM",0,{chip:"Fiji XT",vram:4,vtype:"HBM",bus:4096,tbp:275,len:198,slots:2,pcie:"3.0 ×16",power:"2× 8 pines",conn8:2,psuMin:750,outs:"3× DP 1.2, 1× HDMI 1.4",boost:1.05,cuda:4096,year:2015,seg:"Clásica",legacy:true});
// AMD · Polaris y Vega
G("AMD","Radeon RX 460 4 GB",0,{chip:"Polaris 11",vram:4,vtype:"GDDR5",bus:128,tbp:75,len:210,slots:2,pcie:"3.0 ×8",power:"Sin conector adicional",psuMin:350,outs:"1× DVI, 1× HDMI 2.0, 1× DP 1.4",boost:1.2,cuda:896,year:2016,legacy:true});
G("AMD","Radeon RX 470 4 GB",0,{chip:"Polaris 10",vram:4,vtype:"GDDR5",bus:256,tbp:120,len:241,slots:2,pcie:"3.0 ×16",power:"1× 6 pines",conn6:1,psuMin:450,outs:"1× DVI, 1× HDMI 2.0, 3× DP 1.4",boost:1.206,cuda:2048,year:2016,legacy:true});
G("AMD","Radeon RX 480 8 GB",0,{chip:"Polaris 10",vram:8,vtype:"GDDR5",bus:256,tbp:150,len:241,slots:2,pcie:"3.0 ×16",power:"1× 6 pines",conn6:1,psuMin:500,outs:"1× DVI, 1× HDMI 2.0, 3× DP 1.4",boost:1.266,cuda:2304,year:2016,legacy:true});
G("AMD","Radeon RX 550 4 GB",0,{chip:"Polaris 12",vram:4,vtype:"GDDR5",bus:128,tbp:50,len:170,slots:1,pcie:"3.0 ×8",power:"Sin conector adicional",psuMin:300,outs:"1× DVI, 1× HDMI 2.0, 1× DP 1.4",boost:1.183,cuda:512,year:2017,seg:"Oficina",legacy:true});
G("AMD","Radeon RX 560 4 GB",0,{chip:"Polaris 21",vram:4,vtype:"GDDR5",bus:128,tbp:80,len:210,slots:2,pcie:"3.0 ×8",power:"1× 6 pines",conn6:1,psuMin:400,outs:"1× DVI, 1× HDMI 2.0, 1× DP 1.4",boost:1.275,cuda:1024,year:2017,legacy:true});
G("AMD","Radeon RX 570 8 GB",0,{chip:"Polaris 20",vram:8,vtype:"GDDR5",bus:256,tbp:150,len:241,slots:2,pcie:"3.0 ×16",power:"1× 8 pines",conn8:1,psuMin:450,outs:"1× DVI, 1× HDMI 2.0, 3× DP 1.4",boost:1.244,cuda:2048,year:2017,legacy:true});
G("AMD","Radeon RX 580 8 GB",0,{chip:"Polaris 20",vram:8,vtype:"GDDR5",bus:256,tbp:185,len:241,slots:2,pcie:"3.0 ×16",power:"1× 8 pines",conn8:1,psuMin:500,outs:"1× DVI, 1× HDMI 2.0, 3× DP 1.4",boost:1.34,cuda:2304,year:2017,legacy:true});
G("AMD","Radeon RX 590 8 GB",0,{chip:"Polaris 30",vram:8,vtype:"GDDR5",bus:256,tbp:175,len:241,slots:2,pcie:"3.0 ×16",power:"1× 8 pines + 1× 6 pines",conn8:1,conn6:1,psuMin:500,outs:"1× DVI, 1× HDMI 2.0, 3× DP 1.4",boost:1.545,cuda:2304,year:2018,legacy:true});
G("AMD","Radeon RX Vega 64 8 GB HBM2",0,{chip:"Vega 10 XT",vram:8,vtype:"HBM2",bus:2048,tbp:295,len:281,slots:2,pcie:"3.0 ×16",power:"2× 8 pines",conn8:2,psuMin:750,outs:"3× DP 1.4, 1× HDMI 2.0",boost:1.546,cuda:4096,year:2017,legacy:true});
// AMD · RDNA 1 y 2
G("AMD","Radeon RX 5500 XT 8 GB",0,{chip:"Navi 14",vram:8,vtype:"GDDR6",bus:128,tbp:130,len:241,slots:2,pcie:"4.0 ×8",power:"1× 8 pines",conn8:1,psuMin:450,outs:"3× DP 1.4, 1× HDMI 2.0b",boost:1.845,cuda:1408,year:2019,legacy:true});
G("AMD","Radeon RX 5700 XT 8 GB",0,{chip:"Navi 10",vram:8,vtype:"GDDR6",bus:256,tbp:225,len:272,slots:2,pcie:"4.0 ×16",power:"1× 8 pines + 1× 6 pines",conn8:1,conn6:1,psuMin:600,outs:"3× DP 1.4, 1× HDMI 2.0b",boost:1.905,cuda:2560,year:2019,legacy:true});
G("AMD","Radeon RX 6400 4 GB",129,{chip:"Navi 24",vram:4,vtype:"GDDR6",bus:64,tbp:53,len:167,slots:1,pcie:"4.0 ×4",power:"Sin conector adicional",psuMin:350,outs:"1× DP 1.4, 1× HDMI 2.1",boost:2.321,cuda:768,year:2022,seg:"Oficina"});
G("AMD","Radeon RX 6500 XT 4 GB",159,{chip:"Navi 24",vram:4,vtype:"GDDR6",bus:64,tbp:107,len:200,slots:2,pcie:"4.0 ×4",power:"1× 6 pines",conn6:1,psuMin:400,outs:"1× DP 1.4, 1× HDMI 2.1",boost:2.815,cuda:1024,year:2022});
G("AMD","Radeon RX 6650 XT 8 GB",0,{chip:"Navi 23",vram:8,vtype:"GDDR6",bus:128,tbp:180,len:241,slots:2,pcie:"4.0 ×8",power:"1× 8 pines",conn8:1,psuMin:500,outs:"3× DP 1.4, 1× HDMI 2.1",boost:2.635,cuda:2048,year:2022,legacy:true});
G("AMD","Radeon RX 6700 XT 12 GB",0,{chip:"Navi 22",vram:12,vtype:"GDDR6",bus:192,tbp:230,len:267,slots:2.5,pcie:"4.0 ×16",power:"1× 8 pines + 1× 6 pines",conn8:1,conn6:1,psuMin:650,outs:"3× DP 1.4, 1× HDMI 2.1",boost:2.581,cuda:2560,year:2021,legacy:true});
G("AMD","Radeon RX 6800 XT 16 GB",0,{chip:"Navi 21",vram:16,vtype:"GDDR6",bus:256,tbp:300,len:267,slots:2.5,pcie:"4.0 ×16",power:"2× 8 pines",conn8:2,psuMin:750,outs:"2× DP 1.4, 1× HDMI 2.1, 1× USB-C",boost:2.25,cuda:4608,year:2020,legacy:true});
G("AMD","Radeon RX 6950 XT 16 GB",0,{chip:"Navi 21",vram:16,vtype:"GDDR6",bus:256,tbp:335,len:267,slots:2.5,pcie:"4.0 ×16",power:"2× 8 pines",conn8:2,psuMin:850,outs:"2× DP 1.4, 1× HDMI 2.1, 1× USB-C",boost:2.31,cuda:5120,year:2022,legacy:true});
// AMD · RDNA 3 y 4
G("AMD","Radeon RX 7600 8 GB",249,{chip:"Navi 33",vram:8,vtype:"GDDR6",bus:128,tbp:165,len:204,slots:2,pcie:"4.0 ×8",power:"1× 8 pines",conn8:1,psuMin:550,outs:"3× DP 2.1, 1× HDMI 2.1",boost:2.655,cuda:2048,year:2023});
G("AMD","Radeon RX 7600 XT 16 GB",329,{chip:"Navi 33",vram:16,vtype:"GDDR6",bus:128,tbp:190,len:250,slots:2,pcie:"4.0 ×8",power:"2× 8 pines",conn8:2,psuMin:600,outs:"3× DP 2.1, 1× HDMI 2.1",boost:2.755,cuda:2048,year:2024});
G("AMD","Radeon RX 7700 XT 12 GB",399,{chip:"Navi 32",vram:12,vtype:"GDDR6",bus:192,tbp:245,len:267,slots:2.5,pcie:"4.0 ×16",power:"2× 8 pines",conn8:2,psuMin:700,outs:"2× DP 2.1, 1× HDMI 2.1, 1× USB-C",boost:2.544,cuda:3456,year:2023});
G("AMD","Radeon RX 7800 XT 16 GB",489,{chip:"Navi 32",vram:16,vtype:"GDDR6",bus:256,tbp:263,len:267,slots:2.5,pcie:"4.0 ×16",power:"2× 8 pines",conn8:2,psuMin:700,outs:"2× DP 2.1, 1× HDMI 2.1, 1× USB-C",boost:2.43,cuda:3840,year:2023});
G("AMD","Radeon RX 7900 GRE 16 GB",549,{chip:"Navi 31",vram:16,vtype:"GDDR6",bus:256,tbp:260,len:276,slots:2.5,pcie:"4.0 ×16",power:"2× 8 pines",conn8:2,psuMin:700,outs:"2× DP 2.1, 1× HDMI 2.1, 1× USB-C",boost:2.245,cuda:5120,year:2024});
G("AMD","Radeon RX 7900 XT 20 GB",679,{chip:"Navi 31",vram:20,vtype:"GDDR6",bus:320,tbp:315,len:276,slots:2.5,pcie:"4.0 ×16",power:"2× 8 pines",conn8:2,psuMin:750,outs:"2× DP 2.1, 1× HDMI 2.1, 1× USB-C",boost:2.4,cuda:5376,year:2022});
G("AMD","Radeon RX 9060 XT 16 GB",379,{chip:"Navi 44",vram:16,vtype:"GDDR6",bus:128,tbp:160,len:250,slots:2,pcie:"5.0 ×16",power:"1× 8 pines",conn8:1,psuMin:550,outs:"3× DP 2.1a, 1× HDMI 2.1b",boost:3.13,cuda:2048,year:2025});
G("AMD","Radeon RX 9070 16 GB",629,{chip:"Navi 48",vram:16,vtype:"GDDR6",bus:256,tbp:220,len:290,slots:2.5,pcie:"5.0 ×16",power:"2× 8 pines",conn8:2,psuMin:650,outs:"3× DP 2.1a, 1× HDMI 2.1b",boost:2.52,cuda:3584,year:2025});
// AMD · profesionales
G("AMD","Radeon Pro W6600 8 GB",0,{chip:"Navi 23",vram:8,vtype:"GDDR6 ECC",bus:128,tbp:100,len:203,slots:1,pcie:"4.0 ×8",power:"1× 6 pines",conn6:1,psuMin:450,outs:"4× DP 1.4",boost:2.58,cuda:1792,year:2021,seg:"Profesional",legacy:true});
G("AMD","Radeon Pro W7900 48 GB",3499,{chip:"Navi 31",vram:48,vtype:"GDDR6 ECC",bus:384,tbp:295,len:267,slots:3,pcie:"4.0 ×16",power:"2× 8 pines",conn8:2,psuMin:750,outs:"3× DP 2.1, 1× mDP 2.1",boost:2.495,cuda:6144,year:2023,seg:"Profesional"});
// Intel Arc
G("Intel","Arc A380 6 GB",129,{chip:"ACM-G11",vram:6,vtype:"GDDR6",bus:96,tbp:75,len:200,slots:2,pcie:"4.0 ×8",power:"1× 8 pines",conn8:1,psuMin:400,outs:"3× DP 2.0, 1× HDMI 2.0b",boost:2.0,cuda:1024,year:2022,seg:"Oficina"});
G("Intel","Arc A770 16 GB",289,{chip:"ACM-G10",vram:16,vtype:"GDDR6",bus:256,tbp:225,len:280,slots:2,pcie:"4.0 ×16",power:"1× 8 pines + 1× 6 pines",conn8:1,conn6:1,psuMin:650,outs:"3× DP 2.0, 1× HDMI 2.1",boost:2.1,cuda:4096,year:2022});
G("Intel","Arc B570 10 GB",229,{chip:"BMG-G21",vram:10,vtype:"GDDR6",bus:160,tbp:150,len:272,slots:2,pcie:"4.0 ×8",power:"1× 8 pines",conn8:1,psuMin:550,outs:"3× DP 2.1, 1× HDMI 2.1",boost:2.5,cuda:2304,year:2025});

export const GPU_ROWS = rows;
