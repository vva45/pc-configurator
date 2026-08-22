/* Contactos dorados: indicador de estado de cada ranura */
export default function Fingers({ on, tone = "" }: { on?: boolean; tone?: string }) {
  return (
    <div className={`fingers ${on ? "on" : ""} ${tone}`} aria-hidden="true">
      {[0, 1, 2, 3].map((i) => <i key={i} />)}
    </div>
  );
}
