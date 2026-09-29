import type { Metadata } from "next";
import "./globals.css";
import "./cinematic.css";
import "./studio.css";

export const metadata: Metadata = {
  title: "FORGE × NEXUS — PC Build Studio",
  description: "Configura tu PC en 3D, compara componentes, explora sus especificaciones y estima el rendimiento de tus juegos.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
