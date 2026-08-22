/* Informe POST */
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
          <span style={{ display: "flex", alignItems: "center", gap: 3 }}>{ico(r.lvl)}{tag(r.lvl).slice(0, 6)}</span>
          <span style={{ color: "var(--silk-dim)" }}>{r.code}</span>
          <span style={{ color: "var(--silk)", opacity: 0.85 }}>{r.id}</span>
          <span style={{ color: "var(--silk-dim)" }}>{r.msg}</span>
        </div>
      ))}
    </div>
  );
}
