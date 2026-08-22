/* Adaptadores de red inalámbricos — categoría añadida tras la migración. */
import type { Row, SpecOf } from "./types";

const rows: Row<"netwireless">[] = [];
const ADD = (brand: string, name: string, price: number, o: SpecOf<"netwireless">) => { rows.push({ brand, name, price, ...o }); };

ADD("TP-Link", "Archer TXE75E (Wi-Fi 6E + BT 5.3)", 59, { wifi: "Wi-Fi 6E", bt: "5.3", speed: "AXE5400", antennas: 2, iface: "PCIe ×1", watt: 5, year: 2022 });
ADD("ASUS", "PCE-AXE58BT (Wi-Fi 6E + BT 5.2)", 69, { wifi: "Wi-Fi 6E", bt: "5.2", speed: "AXE5400", antennas: 2, iface: "PCIe ×1", watt: 5, year: 2021 });
ADD("TP-Link", "Archer TX50E (Wi-Fi 6 + BT 5.2)", 35, { wifi: "Wi-Fi 6", bt: "5.2", speed: "AX3000", antennas: 2, iface: "PCIe ×1", watt: 4, year: 2020 });
ADD("TP-Link", "Archer T3U Plus (USB)", 19, { wifi: "Wi-Fi 5", bt: null, speed: "AC1300", antennas: 1, iface: "USB 3.0", watt: 2.5, year: 2019 });

export const NETWIRELESS_ROWS = rows;
