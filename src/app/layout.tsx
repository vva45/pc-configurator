import type { Metadata } from "next";
import "./globals.css";
import "./cinematic.css";

export const metadata: Metadata = {
  title: "Forge — Configurador de PC",
  description: "Motor de compatibilidad, cálculo de consumo, filtros por especificación y compra por región.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
