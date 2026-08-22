/* Almacenamiento — datos extraídos línea a línea de forge-configurador.jsx (fase 1).
   ADD replica el add("storage", …) original, sin valores por defecto;
   D replica el ayudante original con sus defaults. */
import type { Row, SpecOf, WithDefaults } from "./types";

const rows: Row<"storage">[] = [];
const ADD = (brand: string, name: string, price: number, o: SpecOf<"storage">) => { rows.push({ brand, name, price, ...o }); };
const D = (brand: string, name: string, price: number, o: WithDefaults<SpecOf<"storage">, "heatsink" | "dram">) =>
  ADD(brand, name, price, { heatsink: false, dram: true, ...o });

ADD("Samsung","990 PRO 2 TB",159,{iface:"M.2 2280 NVMe",gen:"PCIe 4.0 ×4",capGB:2000,read:7450,write:6900,tbw:1200,dram:true,nand:"TLC V-NAND 176L",watt:8.5,heatsink:false});
ADD("Crucial","T705 2 TB",249,{iface:"M.2 2280 NVMe",gen:"PCIe 5.0 ×4",capGB:2000,read:14500,write:12700,tbw:1200,dram:true,nand:"TLC Micron 232L",watt:11.5,heatsink:true});
ADD("WD","Black SN850X 1 TB",99,{iface:"M.2 2280 NVMe",gen:"PCIe 4.0 ×4",capGB:1000,read:7300,write:6300,tbw:600,dram:true,nand:"TLC BiCS5",watt:7.5,heatsink:false});
ADD("Kingston","NV3 500 GB",39,{iface:"M.2 2280 NVMe",gen:"PCIe 4.0 ×4",capGB:500,read:6000,write:4000,tbw:160,dram:false,nand:"TLC",watt:5,heatsink:false});
ADD("Samsung","870 EVO 1 TB",79,{iface:"SATA 2.5\"",gen:"SATA III 6 Gb/s",capGB:1000,read:560,write:530,tbw:600,dram:true,nand:"TLC V-NAND",watt:3,heatsink:false});
ADD("Seagate","BarraCuda 4 TB 3.5\"",89,{iface:"SATA 3.5\"",gen:"SATA III 6 Gb/s",capGB:4000,read:190,write:190,tbw:null,dram:false,nand:"HDD 5400 rpm",watt:8,heatsink:false});
ADD("Seagate","IronWolf Pro 12 TB",289,{iface:"SATA 3.5\"",gen:"SATA III 6 Gb/s",capGB:12000,read:250,write:250,tbw:null,dram:false,nand:"HDD 7200 rpm CMR",watt:10,heatsink:false});
// M.2 NVMe · PCIe 5.0
D("Samsung","9100 PRO 2 TB con disipador",259,{iface:"M.2 2280 NVMe",gen:"PCIe 5.0 ×4",capGB:2000,read:14800,write:13400,tbw:1200,nand:"TLC V-NAND",watt:11,heatsink:true,seg:"Doméstico"});
D("Corsair","MP700 PRO 2 TB",219,{iface:"M.2 2280 NVMe",gen:"PCIe 5.0 ×4",capGB:2000,read:12400,write:11800,tbw:1200,nand:"TLC Micron",watt:10.5,heatsink:false,seg:"Doméstico"});
D("MSI","SPATIUM M580 FROZR 2 TB",239,{iface:"M.2 2280 NVMe",gen:"PCIe 5.0 ×4",capGB:2000,read:14600,write:12700,tbw:1200,nand:"TLC Micron 232L",watt:11.5,heatsink:true,seg:"Doméstico"});
// M.2 NVMe · PCIe 4.0
D("Samsung","990 EVO Plus 1 TB",79,{iface:"M.2 2280 NVMe",gen:"PCIe 4.0 ×4",capGB:1000,read:7150,write:6300,tbw:600,nand:"TLC V-NAND",watt:7,seg:"Doméstico"});
D("Samsung","980 PRO 500 GB",59,{iface:"M.2 2280 NVMe",gen:"PCIe 4.0 ×4",capGB:500,read:6900,write:5000,tbw:300,nand:"TLC V-NAND",watt:6.2,seg:"Doméstico"});
D("Samsung","970 EVO Plus 250 GB",39,{iface:"M.2 2280 NVMe",gen:"PCIe 3.0 ×4",capGB:250,read:3500,write:2300,tbw:150,nand:"TLC V-NAND",watt:5.5,seg:"Doméstico"});
D("WD","Black SN850X 4 TB con disipador",329,{iface:"M.2 2280 NVMe",gen:"PCIe 4.0 ×4",capGB:4000,read:7300,write:6600,tbw:2400,nand:"TLC BiCS5",watt:8.5,heatsink:true,seg:"Doméstico"});
D("WD","Blue SN5000 2 TB",119,{iface:"M.2 2280 NVMe",gen:"PCIe 4.0 ×4",capGB:2000,read:5500,write:5000,tbw:900,nand:"QLC BiCS6",watt:6,dram:false,seg:"Doméstico"});
D("Crucial","P310 1 TB",69,{iface:"M.2 2280 NVMe",gen:"PCIe 4.0 ×4",capGB:1000,read:7100,write:6000,tbw:220,nand:"QLC Micron",watt:5.5,dram:false,seg:"Doméstico"});
D("Crucial","P3 Plus 500 GB",39,{iface:"M.2 2280 NVMe",gen:"PCIe 4.0 ×4",capGB:500,read:4700,write:1900,tbw:110,nand:"QLC Micron",watt:5,dram:false,seg:"Doméstico"});
D("Kingston","KC3000 2 TB",149,{iface:"M.2 2280 NVMe",gen:"PCIe 4.0 ×4",capGB:2000,read:7000,write:7000,tbw:1600,nand:"TLC Micron 176L",watt:9.9,seg:"Doméstico"});
D("Kingston","NV3 1 TB",59,{iface:"M.2 2280 NVMe",gen:"PCIe 4.0 ×4",capGB:1000,read:6000,write:5000,tbw:320,nand:"TLC",watt:5,dram:false,seg:"Doméstico"});
D("Corsair","MP600 PRO LPX 1 TB",89,{iface:"M.2 2280 NVMe",gen:"PCIe 4.0 ×4",capGB:1000,read:7100,write:5800,tbw:700,nand:"TLC Micron",watt:8,heatsink:true,seg:"Doméstico"});
D("Corsair","MP600 CORE XT 2 TB",129,{iface:"M.2 2280 NVMe",gen:"PCIe 4.0 ×4",capGB:2000,read:5000,write:4400,tbw:450,nand:"QLC",watt:6.5,dram:false,seg:"Doméstico"});
D("PNY","CS2241 1 TB",59,{iface:"M.2 2280 NVMe",gen:"PCIe 4.0 ×4",capGB:1000,read:5150,write:4900,tbw:500,nand:"TLC",watt:5.5,dram:false,seg:"Doméstico"});
D("PNY","XLR8 CS3140 2 TB con disipador",149,{iface:"M.2 2280 NVMe",gen:"PCIe 4.0 ×4",capGB:2000,read:7500,write:6850,tbw:1400,nand:"TLC",watt:9,heatsink:true,seg:"Doméstico"});
D("SK hynix","Platinum P41 1 TB",99,{iface:"M.2 2280 NVMe",gen:"PCIe 4.0 ×4",capGB:1000,read:7000,write:6500,tbw:750,nand:"TLC 176L",watt:7.5,seg:"Doméstico"});
D("Kioxia","EXCERIA PLUS G3 1 TB",69,{iface:"M.2 2280 NVMe",gen:"PCIe 4.0 ×4",capGB:1000,read:5000,write:3900,tbw:600,nand:"TLC BiCS5",watt:6,seg:"Doméstico"});
D("Lexar","NM790 4 TB",239,{iface:"M.2 2280 NVMe",gen:"PCIe 4.0 ×4",capGB:4000,read:7400,write:6500,tbw:3000,nand:"TLC YMTC",watt:7,dram:false,seg:"Doméstico"});
D("TeamGroup","MP44L 500 GB",39,{iface:"M.2 2280 NVMe",gen:"PCIe 4.0 ×4",capGB:500,read:4800,write:3200,tbw:300,nand:"TLC",watt:5,dram:false,seg:"Doméstico"});
D("ADATA","LEGEND 800 250 GB",29,{iface:"M.2 2280 NVMe",gen:"PCIe 4.0 ×4",capGB:250,read:3500,write:2200,tbw:150,nand:"TLC",watt:4.5,dram:false,seg:"Doméstico"});
D("Seagate","FireCuda 530R 2 TB con disipador",189,{iface:"M.2 2280 NVMe",gen:"PCIe 4.0 ×4",capGB:2000,read:7400,write:6900,tbw:2550,nand:"TLC Micron 176L",watt:9,heatsink:true,seg:"Doméstico"});
// SSD SATA 2,5"
D("Samsung","870 QVO 4 TB",249,{iface:"SATA 2.5\"",gen:"SATA III 6 Gb/s",capGB:4000,read:560,write:530,tbw:1440,nand:"QLC V-NAND",watt:3,seg:"Doméstico"});
D("Crucial","BX500 500 GB",34,{iface:"SATA 2.5\"",gen:"SATA III 6 Gb/s",capGB:500,read:540,write:500,tbw:120,nand:"TLC Micron",watt:2.5,dram:false,seg:"Doméstico"});
D("Crucial","MX500 1 TB",69,{iface:"SATA 2.5\"",gen:"SATA III 6 Gb/s",capGB:1000,read:560,write:510,tbw:360,nand:"TLC Micron",watt:3,seg:"Doméstico"});
D("Kingston","A400 240 GB",22,{iface:"SATA 2.5\"",gen:"SATA III 6 Gb/s",capGB:240,read:500,write:350,tbw:80,nand:"TLC",watt:2,dram:false,seg:"Doméstico"});
D("WD","Red SA500 NAS 2 TB",169,{iface:"SATA 2.5\"",gen:"SATA III 6 Gb/s",capGB:2000,read:560,write:530,tbw:1300,nand:"TLC",watt:3.5,seg:"NAS"});
D("Kingston","DC600M 1.92 TB",289,{iface:"SATA 2.5\"",gen:"SATA III 6 Gb/s",capGB:1920,read:560,write:530,tbw:3504,nand:"3D TLC",watt:4.5,seg:"Servidor"});
// Discos duros 3,5"
D("WD","Blue 2 TB 7200 rpm",59,{iface:"SATA 3.5\"",gen:"SATA III 6 Gb/s",capGB:2000,read:180,write:180,tbw:null,nand:"HDD 7200 rpm CMR",watt:6.5,dram:false,seg:"Doméstico"});
D("WD","Red Plus 8 TB NAS",199,{iface:"SATA 3.5\"",gen:"SATA III 6 Gb/s",capGB:8000,read:215,write:215,tbw:null,nand:"HDD 5640 rpm CMR",watt:8.8,dram:false,seg:"NAS"});
D("Seagate","SkyHawk 4 TB videovigilancia",109,{iface:"SATA 3.5\"",gen:"SATA III 6 Gb/s",capGB:4000,read:190,write:190,tbw:null,nand:"HDD 5400 rpm CMR",watt:7,dram:false,seg:"Videovigilancia"});
D("Seagate","Exos X20 20 TB",379,{iface:"SATA 3.5\"",gen:"SATA III 6 Gb/s",capGB:20000,read:285,write:285,tbw:null,nand:"HDD 7200 rpm CMR",watt:9.4,dram:false,seg:"Servidor"});
D("Toshiba","MG09 18 TB",349,{iface:"SATA 3.5\"",gen:"SATA III 6 Gb/s",capGB:18000,read:268,write:268,tbw:null,nand:"HDD 7200 rpm CMR",watt:8.9,dram:false,seg:"Servidor"});
D("Toshiba","P300 1 TB",45,{iface:"SATA 3.5\"",gen:"SATA III 6 Gb/s",capGB:1000,read:160,write:160,tbw:null,nand:"HDD 7200 rpm",watt:6,dram:false,seg:"Doméstico"});
D("WD","Purple 6 TB",149,{iface:"SATA 3.5\"",gen:"SATA III 6 Gb/s",capGB:6000,read:175,write:175,tbw:null,nand:"HDD 5400 rpm",watt:5.3,dram:false,seg:"Videovigilancia"});

export const STORAGE_ROWS = rows;
