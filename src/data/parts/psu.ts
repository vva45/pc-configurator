/* Fuentes — datos extraídos línea a línea de forge-configurador.jsx (fase 1).
   ADD replica el add("psu", …) original, sin valores por defecto;
   U replica el ayudante original con sus defaults. */
import type { Row, SpecOf, WithDefaults } from "./types";

const rows: Row<"psu">[] = [];
const ADD = (brand: string, name: string, price: number, o: SpecOf<"psu">) => { rows.push({ brand, name, price, ...o }); };
const U = (brand: string, name: string, price: number, o: WithDefaults<SpecOf<"psu">, "zero" | "warranty" | "pcie5" | "molex">) =>
  ADD(brand, name, price, { zero: false, warranty: 5, pcie5: 0, molex: 2, ...o });

ADD("Corsair","RM1000x SHIFT",199,{watt:1000,eff:"80+ Gold",cert:"Cybenetics Gold",atx:"ATX 3.1",form:"ATX",len:160,modular:"Full",pcie5:1,pcie8:6,eps:2,sata:12,molex:4,fan:"140 mm FDB",zero:true,warranty:10});
ADD("Seasonic","VERTEX GX-1200",229,{watt:1200,eff:"80+ Gold",cert:"Cybenetics Platinum",atx:"ATX 3.0",form:"ATX",len:150,modular:"Full",pcie5:1,pcie8:6,eps:2,sata:12,molex:4,fan:"135 mm FDB",zero:true,warranty:12});
ADD("be quiet!","Pure Power 12 M 750W",109,{watt:750,eff:"80+ Gold",cert:"Cybenetics Gold",atx:"ATX 3.1",form:"ATX",len:150,modular:"Full",pcie5:1,pcie8:4,eps:2,sata:8,molex:4,fan:"120 mm rifle",zero:false,warranty:10});
ADD("Corsair","SF750 (2024)",169,{watt:750,eff:"80+ Platinum",cert:"Cybenetics Platinum",atx:"ATX 3.1",form:"SFX",len:100,modular:"Full",pcie5:1,pcie8:3,eps:1,sata:6,molex:4,fan:"92 mm FDB",zero:true,warranty:10});
ADD("MSI","MAG A650BN",59,{watt:650,eff:"80+ Bronze",cert:"—",atx:"ATX 2.4",form:"ATX",len:140,modular:"No",pcie5:0,pcie8:2,eps:1,sata:6,molex:3,fan:"120 mm sleeve",zero:false,warranty:5});
ADD("Corsair","AX1600i",579,{watt:1600,eff:"80+ Titanium",cert:"Cybenetics Titanium",atx:"ATX 2.4",form:"ATX",len:200,modular:"Full",pcie5:0,pcie8:10,eps:2,sata:14,molex:8,fan:"140 mm FDB",zero:true,warranty:10});
U("Corsair","CX550",59,{watt:550,eff:"80+ Bronze",cert:"Cybenetics Bronze",atx:"ATX 2.4",form:"ATX",len:140,modular:"No",pcie8:2,eps:1,sata:6,fan:"120 mm rifle",warranty:5});
U("Corsair","RM750e (2025)",99,{watt:750,eff:"80+ Gold",cert:"Cybenetics Gold",atx:"ATX 3.1",form:"ATX",len:140,modular:"Full",pcie5:1,pcie8:4,eps:2,sata:8,fan:"120 mm rifle",zero:true,warranty:7});
U("Corsair","HX1000i (2023)",249,{watt:1000,eff:"80+ Platinum",cert:"Cybenetics Platinum",atx:"ATX 3.0",form:"ATX",len:180,modular:"Full",pcie5:1,pcie8:6,eps:2,sata:12,fan:"140 mm FDB",zero:true,warranty:12});
U("Seasonic","FOCUS GX-650 (2024)",99,{watt:650,eff:"80+ Gold",cert:"Cybenetics Gold",atx:"ATX 3.0",form:"ATX",len:140,modular:"Full",pcie5:1,pcie8:2,eps:2,sata:8,fan:"120 mm FDB",zero:true,warranty:10});
U("Seasonic","PRIME TX-850",219,{watt:850,eff:"80+ Titanium",cert:"Cybenetics Titanium",atx:"ATX 3.0",form:"ATX",len:170,modular:"Full",pcie5:1,pcie8:6,eps:2,sata:12,fan:"135 mm FDB",zero:true,warranty:12});
U("be quiet!","Straight Power 12 1000W",209,{watt:1000,eff:"80+ Platinum",cert:"Cybenetics Platinum",atx:"ATX 3.0",form:"ATX",len:160,modular:"Full",pcie5:1,pcie8:6,eps:2,sata:12,fan:"135 mm FDB",zero:true,warranty:10});
U("be quiet!","System Power 11 550W",55,{watt:550,eff:"80+ Bronze",cert:"Cybenetics Bronze",atx:"ATX 2.4",form:"ATX",len:150,modular:"No",pcie8:2,eps:1,sata:6,fan:"120 mm rifle",warranty:3});
U("Cooler Master","MWE Gold 750 V2",89,{watt:750,eff:"80+ Gold",cert:"Cybenetics Gold",atx:"ATX 3.0",form:"ATX",len:140,modular:"Full",pcie5:1,pcie8:4,eps:2,sata:8,fan:"120 mm HDB",zero:true,warranty:10});
U("Cooler Master","Elite NEX 500W",45,{watt:500,eff:"80+ White",cert:"—",atx:"ATX 2.4",form:"ATX",len:140,modular:"No",pcie8:1,eps:1,sata:4,fan:"120 mm sleeve",warranty:3});
U("MSI","MPG A850G PCIE5",129,{watt:850,eff:"80+ Gold",cert:"Cybenetics Gold",atx:"ATX 3.0",form:"ATX",len:150,modular:"Full",pcie5:1,pcie8:4,eps:2,sata:9,fan:"135 mm FDB",zero:true,warranty:10});
U("MSI","MAG A750BN PCIE5",79,{watt:750,eff:"80+ Bronze",cert:"Cybenetics Bronze",atx:"ATX 3.0",form:"ATX",len:150,modular:"No",pcie5:1,pcie8:2,eps:1,sata:6,fan:"120 mm sleeve",warranty:5});
U("EVGA","SuperNOVA 850 G7",139,{watt:850,eff:"80+ Gold",cert:"Cybenetics Gold",atx:"ATX 2.52",form:"ATX",len:130,modular:"Full",pcie8:6,eps:2,sata:9,fan:"135 mm FDB",zero:true,warranty:10});
U("Thermaltake","Toughpower GF3 1200W",219,{watt:1200,eff:"80+ Gold",cert:"Cybenetics Gold",atx:"ATX 3.0",form:"ATX",len:160,modular:"Full",pcie5:1,pcie8:6,eps:2,sata:12,fan:"140 mm FDB",zero:true,warranty:10});
U("Gigabyte","UD1000GM PG5",149,{watt:1000,eff:"80+ Gold",cert:"Cybenetics Gold",atx:"ATX 3.0",form:"ATX",len:150,modular:"Full",pcie5:1,pcie8:4,eps:2,sata:12,fan:"120 mm FDB",zero:true,warranty:10});
U("NZXT","C1200 Gold ATX 3.1",179,{watt:1200,eff:"80+ Gold",cert:"Cybenetics Gold",atx:"ATX 3.1",form:"ATX",len:150,modular:"Full",pcie5:2,pcie8:6,eps:2,sata:10,fan:"120 mm FDB",zero:true,warranty:10});
U("ASUS","ROG Thor 1000P2 Gaming",349,{watt:1000,eff:"80+ Platinum",cert:"Cybenetics Platinum",atx:"ATX 3.0",form:"ATX",len:190,modular:"Full",pcie5:1,pcie8:6,eps:2,sata:12,fan:"135 mm axial",zero:true,warranty:10});
U("Antec","NeoECO Gold 650W",79,{watt:650,eff:"80+ Gold",cert:"Cybenetics Gold",atx:"ATX 2.52",form:"ATX",len:140,modular:"Full",pcie8:2,eps:2,sata:6,fan:"120 mm FDB",zero:true,warranty:10});
U("Tempest","PSU 600W 80+ Bronze",49,{watt:600,eff:"80+ Bronze",cert:"—",atx:"ATX 2.4",form:"ATX",len:140,modular:"No",pcie8:2,eps:1,sata:5,fan:"120 mm sleeve",warranty:3});
U("Seasonic","FOCUS SGX-500",99,{watt:500,eff:"80+ Gold",cert:"Cybenetics Gold",atx:"ATX 2.4",form:"SFX-L",len:130,modular:"Full",pcie8:2,eps:1,sata:5,fan:"120 mm FDB",zero:true,warranty:10});
U("Cooler Master","V850 SFX Gold",169,{watt:850,eff:"80+ Gold",cert:"Cybenetics Gold",atx:"ATX 3.0",form:"SFX",len:100,modular:"Full",pcie5:1,pcie8:4,eps:1,sata:6,fan:"92 mm FDB",zero:true,warranty:10});
U("FSP","Hydro PTM PRO 1200W",229,{watt:1200,eff:"80+ Platinum",cert:"Cybenetics Platinum",atx:"ATX 3.0",form:"ATX",len:170,modular:"Full",pcie5:1,pcie8:6,eps:2,sata:12,fan:"135 mm FDB",zero:true,warranty:10});
U("XPG","Core Reactor II 750W",109,{watt:750,eff:"80+ Gold",cert:"Cybenetics Gold",atx:"ATX 3.0",form:"ATX",len:140,modular:"Full",pcie5:1,pcie8:4,eps:2,sata:8,fan:"120 mm FDB",zero:true,warranty:10});
U("Corsair","RM450x",79,{watt:450,eff:"80+ Gold",cert:"Cybenetics Gold",atx:"ATX 2.4",form:"ATX",len:160,modular:"Full",pcie8:2,eps:1,sata:8,fan:"135 mm FDB",zero:true,warranty:10});
U("Silverstone","ST45SF-G v2.0",89,{watt:450,eff:"80+ Gold",cert:"—",atx:"ATX 2.4",form:"SFX",len:100,modular:"Full",pcie8:2,eps:1,sata:4,fan:"92 mm",warranty:3});
U("Seasonic","S12III 500",49,{watt:500,eff:"80+ Bronze",cert:"—",atx:"ATX 2.4",form:"ATX",len:140,modular:"No",pcie8:2,eps:1,sata:4,fan:"120 mm sleeve",warranty:5});
U("Chieftec","Polaris 750W",89,{watt:750,eff:"80+ Silver",cert:"Cybenetics Silver",atx:"ATX 2.4",form:"ATX",len:150,modular:"Full",pcie8:4,eps:2,sata:8,fan:"120 mm",warranty:5});
U("Enermax","Revolution D.F. 12 850W",149,{watt:850,eff:"80+ Gold",cert:"Cybenetics Gold",atx:"ATX 3.1",form:"ATX",len:150,modular:"Full",pcie5:1,pcie8:4,eps:2,sata:8,fan:"120 mm FDB",zero:true,warranty:10});

export const PSU_ROWS = rows;
