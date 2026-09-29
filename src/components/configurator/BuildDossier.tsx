"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Check, ChevronDown, Download, Link2, Minus, Plus, ShieldCheck, ShoppingBag, Trash2, TriangleAlert, Zap } from "lucide-react";
import { CAT, GROUPS } from "@/data/categories";
import type { CatId } from "@/data/parts/types";
import type { AppBuild } from "@/lib/compat";
import { createBuildDossier, dossierText } from "@/lib/build-dossier";
import { keyspecsFor } from "@/lib/filters";
import { REGIONS, type RegionId } from "@/lib/regions";
import { buildToParams } from "@/lib/share";
import styles from "./BuildDossier.module.css";

export interface BuildDossierProps {
  build: AppBuild;
  region: RegionId;
  onEdit: (cat: CatId) => void;
  onRemove: (cat: CatId, uid: string) => void;
  onQty: (cat: CatId, uid: string, delta: number) => void;
  onShop: () => void;
}

export default function BuildDossier({ build, region, onEdit, onRemove, onQty, onShop }: BuildDossierProps) {
  const dossier = useMemo(() => createBuildDossier(build), [build]);
  const [notice, setNotice] = useState("");
  const [manualLink, setManualLink] = useState("");
  const { rows, metrics, connectivity, power, post, missing, required, psu, total, unknownPrices } = dossier;
  const failCount = post.filter((line) => line.lvl === "fail").length;
  const warnCount = post.filter((line) => line.lvl === "warn").length;
  const conflicts = rows.filter((row) => row.conflict.blocked);
  const hasConflict = failCount > 0 || conflicts.length > 0;
  const status = !rows.length ? "Pendiente de configurar" : hasConflict ? "Requiere revisión" : missing.length ? "Configuración en curso" : warnCount ? "Revisa los avisos" : "Sin conflictos detectados";
  const money = (value: number) => `${new Intl.NumberFormat("es-ES", { maximumFractionDigits: 0 }).format(value)} ${REGIONS[region].cur}`;
  const ready = required.length - missing.length;

  async function share() {
    const params = buildToParams(build).toString();
    const url = `${window.location.origin}${window.location.pathname}${params ? `?${params}` : ""}`;
    try {
      await navigator.clipboard.writeText(url);
      setManualLink("");
      setNotice("Enlace copiado. Incluye todos los componentes y sus cantidades.");
    } catch {
      setManualLink(url);
      setNotice("No se ha podido copiar automáticamente. Selecciona el enlace para copiarlo.");
    }
  }

  function download() {
    let url: string | undefined;
    try {
      url = URL.createObjectURL(new Blob([dossierText(build, region)], { type: "text/plain;charset=utf-8" }));
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "nexus-forge-ficha-tecnica.txt";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setNotice("Ficha preparada para descargar.");
    } catch {
      setNotice("No se ha podido descargar la ficha. Puedes compartir tu configuración con el enlace.");
    } finally {
      if (url) setTimeout(() => URL.revokeObjectURL(url!), 1000);
    }
  }

  return (
    <section className={styles.dossier} aria-labelledby="dossier-title">
      <div className={styles.inner}>
        <header className={styles.header}>
          <div>
            <span className={styles.eyebrow}>Tu configuración</span>
            <h2 id="dossier-title">Ficha técnica<span>.</span></h2>
            <p>Tu equipo, pieza a pieza. Especificaciones, conexiones y espacio para seguir creciendo.</p>
          </div>
          <div className={styles.actions}>
            <button type="button" onClick={share} disabled={!rows.length}><Link2 size={15} /> Compartir</button>
            <button type="button" onClick={download} disabled={!rows.length}><Download size={15} /> Descargar ficha</button>
          </div>
        </header>

        <div className={styles.notice} role="status" aria-live="polite">{notice}</div>
        {manualLink && <label className={styles.manualLink}>Enlace de tu configuración
          <input readOnly value={manualLink} onFocus={(event) => event.currentTarget.select()} />
        </label>}

        <div className={styles.overview}>
          <div className={styles.completion}>
            <span className={hasConflict ? styles.warningIcon : styles.statusIcon}>{hasConflict ? <TriangleAlert size={21} /> : <ShieldCheck size={21} />}</span>
            <div><strong>{status}</strong><span>{ready} de {required.length} categorías esenciales seleccionadas</span></div>
            <span className={styles.progress} aria-hidden="true"><span style={{ width: `${100 * ready / required.length}%` }} /></span>
          </div>
          <div className={styles.estimate}><span>Precio de referencia</span><strong>{rows.length ? money(total) : "—"}</strong><small>{unknownPrices ? `${unknownPrices} referencias sin precio` : "Según selección del catálogo"}</small></div>
        </div>

        <div className={styles.metrics}>
          {metrics.map((metric) => {
            const Icon = CAT[metric.category].icon;
            return <button type="button" className={styles.metric} key={metric.label} onClick={() => onEdit(metric.category)} aria-label={`${metric.label}: ${metric.value}. Editar`}>
              <span className={styles.metricLabel}><Icon size={17} /> {metric.label}<ArrowRight size={13} /></span>
              <strong>{metric.value}</strong><small>{metric.detail}</small>
            </button>;
          })}
        </div>

        <div className={styles.columns}>
          <div className={styles.parts}>
            <div className={styles.sectionTitle}><h3>Componentes del equipo</h3><span>{rows.length} referencias</span></div>
            {!rows.length && <div className={styles.empty}>
              <CAT.cpu.icon size={34} />
              <h3>Tu equipo empieza con una pieza.</h3>
              <p>Elige un procesador o una caja. Aquí aparecerán los modelos exactos y su ficha, junto con las comprobaciones del montaje.</p>
              <button type="button" className={styles.primary} onClick={() => onEdit("cpu")}>Elegir procesador <ArrowRight size={16} /></button>
            </div>}
            {GROUPS.map((group) => {
              const items = rows.filter((row) => row.category.group === group.id);
              if (!items.length) return null;
              return <section className={styles.group} key={group.id} aria-label={group.label}>
                <h4>{group.label}</h4>
                {items.map(({ part, category, specs, description, conflict }) => {
                  const Icon = category.icon;
                  return <details className={`${styles.part}${conflict.blocked ? ` ${styles.conflict}` : ""}`} key={part._uid}>
                    <summary>
                      <span className={styles.partIcon}><Icon size={21} /></span>
                      <span className={styles.partHeading}>
                        <span className={styles.category}>{category.label}{part.qty > 1 && <span> · {part.qty} unidades</span>}{conflict.blocked && <span className={styles.error}> · Revisar</span>}</span>
                        <strong>{part.brand} {part.name}</strong>
                        <small>{keyspecsFor(part).join(" · ")}</small>
                      </span>
                      <span className={styles.price}>{part.price ? money(part.price * (part.qty || 1)) : "Sin precio"}</span>
                      <ChevronDown className={styles.chevron} size={16} />
                    </summary>
                    <div className={styles.partBody}>
                      <p>{description}</p>
                      {(part.legacy || part.museum) && <p className={styles.caution}>Referencia histórica o descatalogada. Comprueba su disponibilidad.</p>}
                      {conflict.blocked && <p className={styles.error}><TriangleAlert size={14} /> {conflict.reason}</p>}
                      <dl className={styles.specs}>{specs.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value || "No indicado"}</dd></div>)}</dl>
                      <div className={styles.partActions}>
                        <button type="button" onClick={() => onEdit(category.id)}>Cambiar {category.label.toLowerCase()} <ArrowRight size={13} /></button>
                        {category.multi && <div className={styles.quantity} role="group" aria-label={`Cantidad de ${part.name}`}>
                          <button type="button" disabled={part.qty <= 1} onClick={() => onQty(category.id, part._uid, -1)} aria-label={`Reducir cantidad de ${part.name}`}><Minus size={13} /></button>
                          <output aria-label="Cantidad">{part.qty}</output>
                          <button type="button" disabled={part.qty >= 99} onClick={() => onQty(category.id, part._uid, 1)} aria-label={`Aumentar cantidad de ${part.name}`}><Plus size={13} /></button>
                        </div>}
                        <button type="button" className={styles.remove} onClick={() => onRemove(category.id, part._uid)} aria-label={`Quitar ${part.name}`}><Trash2 size={13} /> Quitar</button>
                      </div>
                    </div>
                  </details>;
                })}
              </section>;
            })}
            {missing.length > 0 && rows.length > 0 && <section className={styles.missing} aria-label="Componentes pendientes">
              <h4>Para completar el equipo</h4>
              <div>{missing.map((category) => <button type="button" key={category.id} onClick={() => onEdit(category.id)}><Plus size={14} /> {category.label}</button>)}</div>
            </section>}
          </div>

          <aside className={styles.sidebar}>
            <section className={styles.panel} aria-labelledby="dossier-power">
              <div className={styles.panelTitle}><Zap size={17} /><h3 id="dossier-power">Potencia estimada</h3></div>
              <div className={styles.powerValue}><strong>{power.total ? power.gaming : "—"}</strong><span>{power.total ? "W en juego" : "Añade componentes"}</span></div>
              <dl className={styles.powerStats}>
                <div><dt>Máximo sostenido</dt><dd>{power.total ? `${power.total} W` : "—"}</dd></div>
                <div><dt>Pico transitorio</dt><dd>{power.total ? `${power.spike} W` : "—"}</dd></div>
                <div><dt>Fuente sugerida</dt><dd>{power.total ? `${power.rec} W` : "—"}</dd></div>
              </dl>
              {psu && power.total > 0 && <div className={styles.load}>
                <div><span>Carga máxima estimada</span><b>{Math.round(power.total / psu.watt * 100)} %</b></div>
                <span className={power.total > psu.watt ? styles.overloaded : ""} aria-hidden="true"><span style={{ width: `${Math.min(100, power.total / psu.watt * 100)}%` }} /></span>
              </div>}
              <p className={styles.footnote}>Estimación para las piezas seleccionadas{missing.length ? "; el equipo aún está incompleto" : ""}. El consumo real depende de la carga y los ajustes.</p>
            </section>

            <section className={styles.panel} aria-labelledby="dossier-connectivity"><h3 id="dossier-connectivity">Conectividad</h3>
              <dl className={styles.connectionList}>{connectivity.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
            </section>

            <section className={styles.panel} aria-labelledby="dossier-checks">
              <div className={styles.panelTitle}><ShieldCheck size={17} /><h3 id="dossier-checks">Comprobaciones</h3></div>
              {!post.length ? <p className={styles.footnote}>Selecciona componentes para comprobar socket, memoria, espacio y alimentación.</p> : <>
                <div className={styles.checkCounts}><span><Check size={13} /> {post.filter((line) => line.lvl === "ok").length} correctas</span><span className={hasConflict ? styles.error : warnCount ? styles.caution : ""}>{failCount} conflictos · {warnCount} avisos</span></div>
                {post.filter((line) => line.lvl !== "ok").map((line, index) => <p className={`${styles.checkMessage} ${line.lvl === "fail" ? styles.error : styles.caution}`} key={`${line.id}-${index}`}><TriangleAlert size={14} /> {line.msg}</p>)}
                <details className={styles.checkDetails}><summary>Ver todas las comprobaciones <ChevronDown size={14} /></summary><ul>{post.map((line, index) => <li key={`${line.id}-${index}`}>{line.lvl === "ok" ? <Check size={13} /> : <TriangleAlert size={13} />}<span>{line.msg}</span></li>)}</ul></details>
              </>}
              <p className={styles.footnote}>La vista 3D es orientativa. Confirma medidas y anclajes con la documentación del fabricante.</p>
            </section>

            <section className={`${styles.panel} ${styles.purchase}`}>
              <span className={styles.eyebrow}>Prepara tu lista</span><h3>Todo tu equipo, en un lugar.</h3>
              <p>Busca los modelos seleccionados en las tiendas de {REGIONS[region].label}.</p>
              <button type="button" className={styles.primary} onClick={onShop} disabled={!rows.length}><ShoppingBag size={16} /> Ver dónde comprar</button>
              <small>Precios de referencia. Comprueba el precio y la disponibilidad en cada tienda.</small>
            </section>
          </aside>
        </div>
      </div>
    </section>
  );
}
