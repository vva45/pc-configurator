"use client";
/* Resumen de la torre: solo las piezas que forman la máquina, con consumo y
   POST recalculados sin periféricos. Casilla opcional para los auxiliares. */
import { useRef, useState } from "react";
import { Link2, Store, X } from "lucide-react";
import { CAT, CATS, type Category } from "@/data/categories";
import { list, one, runPost, type AppBuild, type Picked } from "@/lib/compat";
import { calcPower } from "@/lib/power";
import { keyspecsFor } from "@/lib/filters";
import { REGIONS, type RegionId } from "@/lib/regions";
import { buildToParams } from "@/lib/share";
import { eur, oneLiner } from "./format";
import Fingers from "./Fingers";
import type { CatId } from "@/data/parts/types";
import type { GroupId } from "@/data/categories";

export default function BuildSummary({ build, region, onClose, onShop }: {
  build: AppBuild;
  region: RegionId;
  onClose: () => void;
  onShop: () => void;
}) {
  const [aux, setAux] = useState(false);
  const R = REGIONS[region];
  /* Las tarjetas de expansión van físicamente dentro de la torre: entran
     con la misma casilla que los auxiliares del interior. */
  const groups: GroupId[] = aux ? ["core", "aux", "expansion"] : ["core"];
  const cats = CATS.filter((c) => groups.includes(c.group));
  const tower = Object.fromEntries(Object.entries(build)
    .filter(([k]) => groups.includes(CAT[k as CatId].group))) as AppBuild;
  const power = calcPower(tower);
  const post = runPost(tower, power);
  const fails = post.filter((l) => l.lvl === "fail").length;
  const warns = post.filter((l) => l.lvl === "warn").length;
  const rows = cats.flatMap((c) => ((build[c.id] || []) as Picked[]).map((p) => ({ ...p, _cat: c as Category })));
  const totalTower = rows.reduce((a, p) => a + (p.price || 0) * (p.qty || 1), 0);
  const rest = Object.entries(build).filter(([k]) => !groups.includes(CAT[k as CatId].group))
    .flatMap(([, v]) => v as Picked[]).reduce((a, p) => a + (p.price || 0) * (p.qty || 1), 0);
  const missing = CATS.filter((c) => c.group === "core" && c.req && !((build[c.id] || []) as Picked[]).length);

  const cpu = one(tower, "cpu"), gpu = one(tower, "gpu");
  const rams = list(tower, "ram"), st = list(tower, "storage");
  const tiles = [
    cpu && [`${cpu.cores}C / ${cpu.threads}T`, "Procesador"],
    rams.length && [`${rams.reduce((a, r) => a + r.capGB * (r.qty || 1), 0)} GB`,
      `${rams[0].memType} ${Math.max(...rams.map((r) => r.speed))}`],
    gpu && [`${gpu.vram} GB`, gpu.vtype],
    st.length && [(() => { const t = st.reduce((a, x) => a + x.capGB * (x.qty || 1), 0);
      return t >= 1000 ? `${+(t / 1000).toFixed(1)} TB` : `${t} GB`; })(), "Almacenamiento"],
    power.total > 0 && [`${power.total} W`, "Peor caso"],
  ].filter(Boolean) as [string, string][];

  const text = [
    oneLiner(tower), "",
    ...rows.map((p) => `${p._cat.label.padEnd(18)} ${p.brand} ${p.name}${(p.qty || 1) > 1 ? ` ×${p.qty}` : ""}`),
    "",
    `Consumo   peor caso ${power.total} W · en juego ${power.gaming} W · fuente sugerida ${power.rec} W`,
    `Total     ${eur(totalTower)} ${R.cur} (orientativo, ${R.label})`,
  ].join("\n");

  const [copied, setCopied] = useState(false);
  const ta = useRef<HTMLTextAreaElement>(null);
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); }
    catch { ta.current?.select(); document.execCommand?.("copy"); }
    setCopied(true); setTimeout(() => setCopied(false), 1800);
  };

  /* Enlace con el montaje serializado (?cpu=…&mbo=…), para compartir. */
  const [copiedLink, setCopiedLink] = useState(false);
  const copyLink = async () => {
    const qs = buildToParams(build).toString();
    const url = `${window.location.origin}${window.location.pathname}${qs ? `?${qs}` : ""}`;
    try { await navigator.clipboard.writeText(url); }
    catch {
      const el = document.createElement("textarea");
      el.value = url; document.body.appendChild(el); el.select();
      document.execCommand?.("copy"); el.remove();
    }
    setCopiedLink(true); setTimeout(() => setCopiedLink(false), 1800);
  };

  return (
    <div role="dialog" aria-modal="true" aria-label="Resumen de la torre" onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(4,10,7,.86)", zIndex: 60,
        display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div className="panel fade" onClick={(e) => e.stopPropagation()}
        style={{ width: "min(720px,100%)", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>

        <div style={{ padding: "16px 16px 14px", borderBottom: "1px solid var(--trace)",
          display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <div className="eyebrow">Resumen de la torre</div>
            <div className="dsp" style={{ fontSize: 22, marginTop: 6, lineHeight: 1.1 }}>{oneLiner(tower)}</div>
          </div>
          <button className="btn" onClick={onClose} aria-label="Cerrar"><X size={13} /></button>
        </div>

        {tiles.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(tiles.length, 5)},1fr)`,
            borderBottom: "1px solid var(--trace)" }}>
            {tiles.map(([v, l], i) => (
              <div key={i} style={{ padding: "11px 10px", textAlign: "center",
                borderRight: i < tiles.length - 1 ? "1px solid var(--trace)" : "none" }}>
                <div className="mono" style={{ fontSize: 15, color: "var(--gold)", fontWeight: 600 }}>{v}</div>
                <div className="eyebrow" style={{ fontSize: 8.5, marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        )}

        {missing.length > 0 && (
          <div className="mono" style={{ fontSize: 11, color: "var(--amber)", padding: "9px 16px",
            borderBottom: "1px solid var(--trace)", lineHeight: 1.5 }}>
            Falta por elegir: {missing.map((m) => m.label[0].toLowerCase() + m.label.slice(1)).join(", ")}.
          </div>
        )}
        {fails > 0 && (
          <div className="mono" style={{ fontSize: 11, color: "var(--red)", padding: "9px 16px",
            borderBottom: "1px solid var(--trace)", lineHeight: 1.5 }}>
            {fails} incompatibilidad{fails > 1 ? "es" : ""} sin resolver. Revisa el informe POST antes de comprar.
          </div>
        )}

        <div className="scroll" style={{ flex: 1, minHeight: 0, padding: "6px 16px" }}>
          {rows.length === 0 ? (
            <div style={{ padding: "30px 0", textAlign: "center", color: "var(--silk-dim)" }}>
              Todavía no hay nada montado.
            </div>
          ) : rows.map((p) => (
            <div key={p._uid} style={{ display: "flex", gap: 10, alignItems: "flex-start",
              padding: "9px 0", borderBottom: "1px solid rgba(30,69,52,.45)" }}>
              <Fingers on tone="" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="eyebrow">{p._cat.label}</div>
                <div style={{ fontSize: 13.5, fontWeight: 600, marginTop: 1 }}>
                  {p.brand} {p.name}
                  {(p.qty || 1) > 1 && <span className="mono" style={{ color: "var(--gold)", fontSize: 11 }}> ×{p.qty}</span>}
                </div>
                <div className="mono" style={{ fontSize: 10, color: "var(--silk-dim)", marginTop: 3 }}>
                  {keyspecsFor(p).join(" · ")}
                </div>
              </div>
              <span className="mono" style={{ fontSize: 12.5, whiteSpace: "nowrap",
                color: p.price ? "var(--silk)" : "var(--silk-dim)" }}>
                {p.price ? `${eur(p.price * (p.qty || 1))} ${R.cur}` : "—"}
              </span>
            </div>
          ))}
        </div>

        <div style={{ borderTop: "1px solid var(--trace)", padding: "12px 16px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 7, cursor: "pointer", marginBottom: 10 }}>
            <input type="checkbox" checked={aux} onChange={(e) => setAux(e.target.checked)}
              style={{ accentColor: "var(--gold)", width: "auto" }} />
            <span className="mono" style={{ fontSize: 11, color: "var(--silk-dim)" }}>
              Incluir auxiliares del interior (ventiladores, RGB, pasta, cables, tarjetas de expansión)
            </span>
          </label>

          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-end" }}>
            <div className="mono" style={{ fontSize: 10.5, color: "var(--silk-dim)", lineHeight: 1.7 }}>
              Consumo {power.total} W peor caso · {power.gaming} W en juego<br />
              Fuente sugerida <b style={{ color: "var(--gold)" }}>{power.rec} W</b> ·{" "}
              <span style={{ color: fails ? "var(--red)" : warns ? "var(--amber)" : "var(--cyan)" }}>
                POST {fails ? `${fails} fallo${fails > 1 ? "s" : ""}` : warns ? `${warns} aviso${warns > 1 ? "s" : ""}` : "correcto"}
              </span>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="eyebrow" style={{ fontSize: 8.5 }}>Total de la torre</div>
              <div className="mono" style={{ fontSize: 21, color: "var(--gold)", fontWeight: 600, lineHeight: 1.1 }}>
                {eur(totalTower)} {R.cur}
              </div>
              {rest > 0 && <div className="mono" style={{ fontSize: 9.5, color: "var(--silk-dim)", marginTop: 2 }}>
                + {eur(rest)} {R.cur} fuera de la torre
              </div>}
            </div>
          </div>

          <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
            <button className="btn" style={{ flex: 1 }} onClick={copy}>{copied ? "Copiado" : "Copiar resumen"}</button>
            <button className="btn" style={{ flex: 1, display: "flex", alignItems: "center",
              justifyContent: "center", gap: 6 }} onClick={copyLink}>
              <Link2 size={12} /> {copiedLink ? "Enlace copiado" : "Copiar enlace"}
            </button>
            <button className="btn btn-gold" style={{ flex: 1, display: "flex", alignItems: "center",
              justifyContent: "center", gap: 6 }} onClick={() => { onClose(); onShop(); }}>
              <Store size={12} /> Dónde comprar
            </button>
          </div>
          <textarea ref={ta} readOnly value={text} aria-hidden="true" tabIndex={-1}
            style={{ position: "absolute", left: -9999, width: 1, height: 1, opacity: 0 }} />
        </div>
      </div>
    </div>
  );
}
