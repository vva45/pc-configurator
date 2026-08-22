"use client";
/* ═══════════════════════════════════════════════════════════════════
   UI — FORGE, Configurador de PC
   Estado del montaje, catálogo filtrable y paneles. Antiguo App del
   monolito, partido en un componente por fichero (fase 1).
   ═══════════════════════════════════════════════════════════════════ */
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  CircuitBoard, ClipboardList, Globe, Search, ShoppingCart, SlidersHorizontal, Store,
} from "lucide-react";
import { buildFromParams, buildToParams } from "@/lib/share";
import { P } from "@/data/parts";
import type { CatId, Part } from "@/data/parts/types";
import { CAT, CATS, GROUPS } from "@/data/categories";
import { gate, one, runPost, type AppBuild, type Build, type Picked } from "@/lib/compat";
import { calcPower } from "@/lib/power";
import { matches, type ActiveFilters } from "@/lib/filters";
import { REGIONS, type RegionId } from "@/lib/regions";
import { eur } from "./format";
import FilterPanel from "./FilterPanel";
import PartCard from "./PartCard";
import PostLog from "./PostLog";
import PowerGauge from "./PowerGauge";
import ShoppingList from "./ShoppingList";
import Slot from "./Slot";
import StoreSheet from "./StoreSheet";
import BuildSummary from "./BuildSummary";

type SortKey = "rel" | "price" | "priceDesc" | "name";
type Tab = "build" | "catalog" | "status";
type Shown = { p: Part; blocked: boolean; reason?: string };

export default function Configurator() {
  const [region, setRegion] = useState<RegionId>("ES");
  /* ── Montaje en la URL (?cpu=…&mbo=…) ─────────────────────────────
     Al abrir un enlace compartido, el estado inicial sale de los query
     params (useSearchParams); el POST se revalida solo porque runPost
     deriva del estado. buildFromParams es determinista, así que el HTML
     del servidor y el primer render del cliente coinciden. */
  const searchParams = useSearchParams();
  const [build, setBuild] = useState<AppBuild>(() =>
    buildFromParams(new URLSearchParams(searchParams.toString())));
  const [cat, setCat] = useState<CatId>("cpu");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("rel");
  const [filters, setFilters] = useState<ActiveFilters>({});
  const [showBlocked, setShowBlocked] = useState(true);
  const [museum, setMuseum] = useState(false);
  const [buy, setBuy] = useState<Part | null>(null);
  const [shopping, setShopping] = useState(false);
  const [summary, setSummary] = useState(false);
  const [tab, setTab] = useState<Tab>("build");     // móvil
  const [showFilters, setShowFilters] = useState(false);

  const pending = useRef<ActiveFilters | null>(null);
  useEffect(() => { setFilters(pending.current || {}); pending.current = null; setQ(""); }, [cat]);

  /* Cada cambio del montaje queda reflejado en la URL con replaceState
     (sin recargas), lista para copiar y mandar por WhatsApp. */
  useEffect(() => {
    const qs = buildToParams(build).toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  }, [build]);

  const cur = REGIONS[region].cur;
  const power = useMemo(() => calcPower(build), [build]);
  const log = useMemo(() => runPost(build, power), [build, power]);
  const fails = log.filter((l) => l.lvl === "fail").length;
  const warns = log.filter((l) => l.lvl === "warn").length;
  const total = useMemo(() => (Object.values(build) as Picked[][]).flat()
    .reduce((a, p) => a + (p.price || 0) * (p.qty || 1), 0), [build]);

  const pool = useMemo(() => P.filter((p) => p.cat === cat && (museum || !(p.museum || p.legacy))), [cat, museum]);
  const shown = useMemo(() => {
    let r: Shown[];
    let base = pool.filter((p) => matches(p, filters, cat));
    if (q.trim()) {
      const t = q.toLowerCase();
      base = base.filter((p) => (p.brand + " " + p.name).toLowerCase().includes(t));
    }
    r = base.map((p) => ({ p, ...gate(p, build) }));
    if (!showBlocked) r = r.filter((x) => !x.blocked);
    const key: Record<SortKey, (x: Shown) => number | string> = {
      price: (x) => x.p.price || 1e9, priceDesc: (x) => -(x.p.price || 0),
      name: (x) => x.p.brand + x.p.name, rel: (x) => (x.blocked ? 1 : 0),
    };
    r.sort((a, b) => {
      const k = key[sort] || key.rel; const A = k(a), B = k(b);
      return typeof A === "string" ? A.localeCompare(B as string) : A - (B as number);
    });
    return r;
  }, [pool, filters, q, build, showBlocked, sort, cat]);

  function pick(part: Part) {
    const c = CAT[part.cat];
    const item: Picked = { ...part, _uid: `${part.id}-${Date.now()}`, qty: 1 };
    setBuild((b) => {
      if (c.multi) {
        const cur = (b[part.cat] || []) as Picked[];
        const dup = cur.find((x) => x.id === part.id);
        if (dup) return { ...b, [part.cat]: cur.map((x) => x.id === part.id ? { ...x, qty: (x.qty || 1) + 1 } : x) } as AppBuild;
        return { ...b, [part.cat]: [...cur, item] } as AppBuild;
      }
      return { ...b, [part.cat]: [item] } as AppBuild;
    });
    const order = CATS.filter((x) => x.group === "core").map((x) => x.id);
    const i = order.indexOf(part.cat);
    if (i >= 0 && i < order.length - 1 && !c.multi) setCat(order[i + 1]);
  }
  const remove = (c: CatId, uid: string) => setBuild((b) => {
    const n = ((b[c] || []) as Picked[]).filter((x) => x._uid !== uid);
    const o = { ...b } as Record<CatId, Picked[] | undefined>;
    if (n.length) o[c] = n; else delete o[c];
    return o as AppBuild;
  });
  const qty = (c: CatId, uid: string, d: number) => setBuild((b) => ({
    ...b,
    [c]: ((b[c] || []) as Picked[]).map((x) => x._uid === uid ? { ...x, qty: Math.max(1, (x.qty || 1) + d) } : x),
  }) as AppBuild);

  // ¿qué pieza concreta rompe el montaje? -> contactos en rojo en su ranura
  const conflicts = useMemo(() => {
    const set = new Set<string>();
    for (const [c, arr] of Object.entries(build) as [CatId, Picked[] | undefined][]) {
      for (const it of arr || []) {
        const rest = { ...build } as Record<CatId, Picked[] | undefined>;
        rest[c] = ((build[c] || []) as Picked[]).filter((x) => x._uid !== it._uid);
        if (!rest[c]?.length) delete rest[c];
        if (gate(it, rest as Build).blocked) set.add(it._uid);
      }
    }
    return set;
  }, [build]);

  const Bar = (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
      borderBottom: "1px solid var(--trace)", background: "var(--board-2)", position: "sticky", top: 0, zIndex: 30, flexWrap: "wrap" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        <div style={{ width: 26, height: 26, border: "1px solid var(--gold)", display: "grid", placeItems: "center" }}>
          <CircuitBoard size={14} color="var(--gold)" />
        </div>
        <div>
          <div className="dsp" style={{ fontSize: 17, letterSpacing: ".02em" }}>Forge</div>
          <div className="eyebrow" style={{ fontSize: 8.5, marginTop: -2 }}>Configurador de PC</div>
        </div>
      </div>
      <div style={{ flex: 1 }} />
      <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <Globe size={13} color="var(--silk-dim)" />
        <select value={region} onChange={(e) => setRegion(e.target.value as RegionId)} aria-label="Región"
          style={{ width: "auto", minWidth: 150 }}>
          {Object.entries(REGIONS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </label>
      <div style={{ minWidth: 190, display: "none" }} className="wide-gauge" />
      <button className="btn btn-gold" disabled={!Object.keys(build).length}
        onClick={() => setShopping(true)}
        style={{ display: "flex", alignItems: "center", gap: 6,
          opacity: Object.keys(build).length ? 1 : 0.35,
          cursor: Object.keys(build).length ? "pointer" : "not-allowed" }}>
        <ShoppingCart size={12} /> Dónde comprar
      </button>
      <div style={{ textAlign: "right" }}>
        <div className="eyebrow" style={{ fontSize: 8.5 }}>Total del montaje</div>
        <div className="mono" style={{ fontSize: 17, color: "var(--gold)", fontWeight: 600, lineHeight: 1.1 }}>
          {eur(total)} {cur}
        </div>
      </div>
    </div>
  );

  const BuildPane = (
    <div className="scroll" style={{ padding: 12, height: "100%" }}>
      {GROUPS.map((g) => (
        <div key={g.id} style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 7 }}>
            <div className="eyebrow" style={{ color: "var(--gold-dim)" }}>{g.label}</div>
            <div className="mono" style={{ fontSize: 9.5, color: "var(--silk-dim)" }}>{g.sub}</div>
          </div>
          {CATS.filter((c) => c.group === g.id).map((c) => (
            <Slot key={c.id} cat={c} items={(build[c.id] || []) as Picked[]} active={cat === c.id} conflicts={conflicts}
              onOpen={(id) => { setCat(id); setTab("catalog"); }} onRemove={remove} onQty={qty} cur={cur} />
          ))}
          {g.id === "core" && (() => {
            const done = CATS.filter((c) => c.group === "core" && c.req)
              .filter((c) => ((build[c.id] || []) as Picked[]).length).length;
            const need = CATS.filter((c) => c.group === "core" && c.req).length;
            return (
              <button className={done ? "btn btn-gold" : "btn"} onClick={() => setSummary(true)}
                disabled={!done} style={{ width: "100%", marginTop: 8, display: "flex",
                  alignItems: "center", justifyContent: "center", gap: 7, padding: "9px 12px",
                  opacity: done ? 1 : 0.4, cursor: done ? "pointer" : "not-allowed" }}>
                <ClipboardList size={13} /> Resumen de la torre
                <span className="mono" style={{ fontSize: 10, opacity: 0.75 }}>{done}/{need}</span>
              </button>
            );
          })()}
        </div>
      ))}
    </div>
  );

  const StatusPane = (
    <div className="scroll" style={{ padding: 12, height: "100%" }}>
      <PowerGauge power={power} psu={one(build, "psu")} />

      {power.total > 0 && (
        <div style={{ marginTop: 12, border: "1px solid var(--trace)", padding: "9px 10px" }}>
          <div className="eyebrow" style={{ marginBottom: 6 }}>Reparto del consumo</div>
          {Object.entries(power.detail).filter(([, v]) => v > 0).map(([k, v]) => (
            <div key={k} style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
              <span className="mono" style={{ fontSize: 10, width: 82, color: "var(--silk-dim)" }}>{k}</span>
              <div style={{ flex: 1, height: 5, background: "#0A1610" }}>
                <div style={{ height: "100%", width: `${(v / power.total) * 100}%`, background: "var(--gold-dim)" }} />
              </div>
              <span className="mono" style={{ fontSize: 10, width: 38, textAlign: "right" }}>{Math.round(v)} W</span>
            </div>
          ))}
          {power.desk > 0 && (
            <div className="mono" style={{ fontSize: 9.5, color: "var(--silk-dim)", marginTop: 7,
              borderTop: "1px solid var(--trace)", paddingTop: 6, lineHeight: 1.5 }}>
              + {power.desk} W de monitores y altavoces. Van al enchufe, no a la fuente: no cuentan para dimensionarla.
            </div>
          )}
        </div>
      )}

      {!one(build, "psu") && power.total > 0 && (
        <button className="btn btn-gold" style={{ width: "100%", marginTop: 10 }}
          onClick={() => { const f: ActiveFilters = { watt: [power.rec, 2000] };
            if (cat === "psu") setFilters(f); else pending.current = f;
            setCat("psu"); setTab("catalog"); }}>
          Ver fuentes de {power.rec} W o más
        </button>
      )}

      <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 8 }}>
        <span className="eyebrow">POST · verificación</span>
        <div style={{ flex: 1, height: 1, background: "var(--trace)" }} />
        <span className="mono" style={{ fontSize: 10, color: fails ? "var(--red)" : warns ? "var(--amber)" : "var(--cyan)" }}>
          {fails ? `${fails} fallo${fails > 1 ? "s" : ""}` : warns ? `${warns} aviso${warns > 1 ? "s" : ""}` : "todo correcto"}
        </span>
      </div>
      <div style={{ marginTop: 8 }}><PostLog log={log} /></div>

      {Object.keys(build).length > 0 && (
        <div style={{ display: "flex", gap: 6, marginTop: 14 }}>
          <button className="btn btn-gold" style={{ flex: 1, display: "flex", alignItems: "center",
            justifyContent: "center", gap: 6 }} onClick={() => setShopping(true)}>
            <Store size={12} /> Lista de compra
          </button>
          <button className="btn" onClick={() => setBuild({})}>Vaciar</button>
        </div>
      )}
    </div>
  );

  const CatalogPane = (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* barra de categoría */}
      <div style={{ padding: "10px 12px", borderBottom: "1px solid var(--trace)" }}>
        <div style={{ display: "flex", gap: 5, overflowX: "auto", paddingBottom: 7, marginBottom: 9 }}>
          {CATS.map((c) => {
            const n = ((build[c.id] || []) as Picked[]).length;
            return <button key={c.id} className={`chip ${cat === c.id ? "sel" : ""}`} onClick={() => setCat(c.id)}>
              {c.label}{n > 0 && ` ·${n}`}
            </button>;
          })}
        </div>
        <div style={{ display: "flex", gap: 7, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: "1 1 180px", minWidth: 150 }}>
            <Search size={13} color="var(--silk-dim)"
              style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)" }} />
            <input type="text" value={q} onChange={(e) => setQ(e.target.value)}
              placeholder={`Buscar en ${CAT[cat].label.toLowerCase()}…`}
              style={{ paddingLeft: 26 }} aria-label="Buscar" />
          </div>
          <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} aria-label="Ordenar"
            style={{ width: "auto", minWidth: 130 }}>
            <option value="rel">Compatibles primero</option>
            <option value="price">Precio ascendente</option>
            <option value="priceDesc">Precio descendente</option>
            <option value="name">Nombre</option>
          </select>
          <button className={`chip ${showBlocked ? "" : "sel"}`} onClick={() => setShowBlocked((v) => !v)}>
            {showBlocked ? "Ocultar incompatibles" : "Mostrando solo compatibles"}
          </button>
          {pool.some((p) => p.legacy || p.museum) || P.some((p) => p.cat === cat && (p.legacy || p.museum)) ? (
            <button className={`chip ${museum ? "sel" : ""}`} onClick={() => setMuseum((v) => !v)}>
              {museum ? "Ocultar descatalogadas" : "Mostrar descatalogadas"}
            </button>
          ) : null}
          <button className="chip filt-toggle" onClick={() => setShowFilters((v) => !v)}>
            <SlidersHorizontal size={10} style={{ display: "inline", verticalAlign: "-1px" }} /> Filtros
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        <div className={`filt-col ${showFilters ? "open" : ""}`}
          style={{ width: 224, flexShrink: 0, borderRight: "1px solid var(--trace)" }}>
          <FilterPanel cat={cat} pool={pool} filters={filters} setFilters={setFilters}
            onClear={() => setFilters({})} />
        </div>
        <div className="scroll" style={{ flex: 1, padding: 12 }}>
          <div className="mono" style={{ fontSize: 10.5, color: "var(--silk-dim)", marginBottom: 9 }}>
            {shown.filter((x) => !x.blocked).length} compatibles
            {shown.filter((x) => x.blocked).length > 0 && ` · ${shown.filter((x) => x.blocked).length} descartadas`}
            {" · "}{pool.length} en catálogo
          </div>
          {shown.length === 0 ? (
            <div className="panel" style={{ padding: 24, textAlign: "center" }}>
              <div className="dsp" style={{ fontSize: 15, marginBottom: 6 }}>Nada encaja</div>
              <div style={{ fontSize: 12.5, color: "var(--silk-dim)", marginBottom: 12 }}>
                Los filtros dejan fuera todo el catálogo de {CAT[cat].label.toLowerCase()}.
              </div>
              <button className="btn btn-gold" onClick={() => { setFilters({}); setQ(""); }}>Quitar filtros</button>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 9,
              gridTemplateColumns: "repeat(auto-fill,minmax(196px,1fr))" }}>
              {shown.map(({ p, blocked, reason }) =>
                <PartCard key={p.id} part={p} blocked={blocked} reason={reason} cur={cur}
                  chosen={((build[p.cat] || []) as Picked[]).some((x) => x.id === p.id)}
                  onPick={pick} onBuy={setBuy} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="fg">
      {Bar}

      <div className="mtabs">
        {([["build", "Montaje"], ["catalog", "Catálogo"], ["status", "Consumo y POST"]] as const).map(([k, l]) =>
          <button key={k} className={`chip ${tab === k ? "sel" : ""}`} style={{ border: "none" }}
            onClick={() => setTab(k)}>{l}{k === "status" && fails > 0 ? ` (${fails})` : ""}</button>)}
      </div>

      <div className="layout">
        <div className={`col-build ${tab === "build" ? "on" : ""}`}
          style={{ borderRight: "1px solid var(--trace)", minHeight: 0 }}>{BuildPane}</div>
        <div className={`col-catalog ${tab === "catalog" ? "on" : ""}`} style={{ minHeight: 0 }}>{CatalogPane}</div>
        <div className={`col-status ${tab === "status" ? "on" : ""}`}
          style={{ borderLeft: "1px solid var(--trace)", minHeight: 0 }}>{StatusPane}</div>
      </div>

      {buy && <StoreSheet part={buy} region={region} onClose={() => setBuy(null)} />}
      {shopping && <ShoppingList build={build} region={region} total={total}
        onClose={() => setShopping(false)} />}
      {summary && <BuildSummary build={build} region={region}
        onClose={() => setSummary(false)} onShop={() => setShopping(true)} />}
    </div>
  );
}
