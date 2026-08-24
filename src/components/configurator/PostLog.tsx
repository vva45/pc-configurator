/* Informe POST.
   El código hexadecimal de cada comprobación (0x01, 0x02…) existe en el
   modelo pero no se pinta: en pantalla parecía un código de error. */
import { AlertTriangle, Check, XCircle } from "lucide-react";
import type { PostLevel, PostLine } from "@/lib/compat";

export default function PostLog({ log }: { log: PostLine[] }) {
  const ico = (l: PostLevel) => l === "ok" ? <Check size={11} /> : l === "warn" ? <AlertTriangle size={11} /> : <XCircle size={11} />;
  const tag = (l: PostLevel) => l === "ok" ? "[ OK ]" : l === "warn" ? "[WARN]" : "[FALLO]";
  return (
    <div>
      {log.length === 0 && (
        <div className="mono" style={{ fontSize: 11, color: "var(--silk-dim)", padding: "14px 0", lineHeight: 1.7 }}>
          Sin comprobaciones todavía.<br />Elige una CPU o una placa base y el informe empieza a rellenarse.
        </div>
      )}
      {log.map((r, i) => (
        <div key={i} className={`log-row fade log-${r.lvl}`} style={{ animationDelay: `${i * 18}ms` }}>
          <span style={{ display: "flex", alignItems: "center", gap: 3, whiteSpace: "nowrap" }}>{ico(r.lvl)}{tag(r.lvl).slice(0, 6)}</span>
          <span style={{ color: "var(--silk)", opacity: 0.85, whiteSpace: "nowrap" }}>{r.id}</span>
          <span style={{ color: "var(--silk-dim)", lineHeight: 1.45 }}>{r.msg}</span>
        </div>
      ))}
    </div>
  );
}
