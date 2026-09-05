/* Contactos (fingers): indicador de estado de cada ranura. Acero en reposo, azul con la pieza montada; ámbar o rojo según el tono. */
export default function Fingers({ on, tone = "" }: { on?: boolean; tone?: string }) {
  return (
    <div className={`fingers ${on ? "on" : ""} ${tone}`} aria-hidden="true">
      {[0, 1, 2, 3].map((i) => <i key={i} />)}
    </div>
  );
}
