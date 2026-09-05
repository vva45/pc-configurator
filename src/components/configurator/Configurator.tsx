"use client";
/* ═══════════════════════════════════════════════════════════════════
   UI — FORGE, Configurador de PC
   Estado del montaje y paneles. Desde la fase 4 el catálogo no viaja al
   cliente: /api/parts sirve páginas filtradas, ordenadas y con el gate
   calculado, y /api/build resuelve los enlaces compartidos.
   ═══════════════════════════════════════════════════════════════════ */
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight, Box, Check, CircuitBoard, ClipboardList, Globe, Search, ShoppingCart, SlidersHorizontal, Store,
} from "lucide-react";
import { buildToParams, hasBuildParams } from "@/lib/share";
import type { CatalogResponse } from "@/lib/catalog-server";
import type { CatId, Part } from "@/data/parts/types";
import { CAT, CATS, GROUPS } from "@/data/categories";
import { gate, one, runPost, type AppBuild, type Build, type Picked } from "@/lib/compat";
import { calcPower } from "@/lib/power";
import { analyzeForgeBuild, type ForgeConflict } from "@/lib/forge-intelligence";
import { type ActiveFilters } from "@/lib/filters";
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
import ForgeIntelligence from "./ForgeIntelligence";
import VisualBuild from "./VisualBuild";
import { createVisualBuildModel } from "@/lib/visual-build";
import { getTabSwipeGestureOwner, isIntentionalTabSwipe, type TabSwipeGestureOwner } from "@/lib/tab-swipe";

type SortKey = "rel" | "price" | "priceDesc" | "name";
type Tab = "build" | "catalog" | "status";

const PAGE_SIZE = 48;

/* Orden de montaje: cada pieza elegida lleva a la siguiente ranura. */
const CORE = CATS.filter((x) => x.group === "core").map((x) => x.id);
const siguiente = (c: CatId): CatId | null => {
  const i = CORE.indexOf(c);
  return i >= 0 && i < CORE.length - 1 ? CORE[i + 1] : null;
};

export default function Configurator() {
  const [region, setRegion] = useState<RegionId>("ES");
  const [build, setBuild] = useState<AppBuild>({});
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
  const [experience, setExperience] = useState<"visual" | "technical">("visual");
  const uid = useRef(0);
  const catalogScroll = useRef<HTMLDivElement>(null);
  const continueButton = useRef<HTMLButtonElement>(null);
  const [showFloatingNext, setShowFloatingNext] = useState(false);
  const touchStart = useRef<{ x: number; y: number; owner: TabSwipeGestureOwner } | undefined>(undefined);

  const pending = useRef<ActiveFilters | null>(null);
  useEffect(() => { setFilters(pending.current || {}); pending.current = null; setQ(""); }, [cat]);

  /* ── Montaje en la URL (?cpu=…&mbo=…) ─────────────────────────────
     Al abrir un enlace compartido, /api/build resuelve los índices a
     piezas completas (el catálogo ya no está en el cliente); el POST se
     revalida solo porque runPost deriva del estado. Después, cada cambio
     del montaje se refleja en la URL con replaceState, sin recargas. */
  const searchParams = useSearchParams();
  const booted = useRef(false);
  const initialBuildParams = useRef(searchParams.toString());
  const restoreController = useRef<AbortController | null>(null);
  useEffect(() => {
    const sp = new URLSearchParams(initialBuildParams.current);
    if (!hasBuildParams(sp)) { booted.current = true; return; }
    const controller = new AbortController();
    restoreController.current = controller;
    fetch(`/api/build?${sp.toString()}`, { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : {}))
      .then((restored: AppBuild) => {
        if (controller.signal.aborted) return;
        if (Object.keys(restored).length)
          setBuild((prev) => (Object.keys(prev).length ? prev : restored));
      })
      .catch(() => { /* enlace irrecuperable: se parte de cero */ })
      .finally(() => { if (!controller.signal.aborted) booted.current = true; });
    return () => controller.abort();
  }, []);
  useEffect(() => {
    if (!booted.current) return;
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
  const requiredCore = useMemo(() => CATS.filter((c) => c.group === "core" && c.req), []);
  const coreDone = requiredCore.filter((c) => ((build[c.id] || []) as Picked[]).length > 0).length;

  /* ── Catálogo servido por /api/parts, paginado ──────────────────── */
  const buildQs = useMemo(() => buildToParams(build).toString(), [build]);
  const queryKey = useMemo(
    () => JSON.stringify([cat, museum, q, sort, showBlocked, filters, buildQs]),
    [cat, museum, q, sort, showBlocked, filters, buildQs]);
  const [page, setPage] = useState(0);
  const [prevKey, setPrevKey] = useState(queryKey);
  if (prevKey !== queryKey) { setPrevKey(queryKey); setPage(0); }
  const [catalogResponse, setCatalog] = useState<CatalogResponse | null>(null);
  const [catalogKey, setCatalogKey] = useState("");
  const catalog = catalogKey === queryKey ? catalogResponse : null;
  const [items, setItems] = useState<CatalogResponse["items"]>([]);
  const reqId = useRef(0);
  useEffect(() => {
    const id = ++reqId.current;
    const sp = new URLSearchParams({
      cat, museum: museum ? "1" : "0", q, sort,
      showBlocked: showBlocked ? "1" : "0",
      page: String(page), size: String(PAGE_SIZE),
    });
    const clean = Object.fromEntries(Object.entries(filters)
      .filter(([, v]) => v !== undefined && v !== null && !(Array.isArray(v) && !v.length)));
    if (Object.keys(clean).length) sp.set("filters", JSON.stringify(clean));
    const url = `/api/parts?${sp.toString()}${buildQs ? "&" + buildQs : ""}`;
    const t = setTimeout(() => {
      fetch(url)
        .then((r) => (r.ok ? r.json() : null))
        .then((data: CatalogResponse | null) => {
          if (!data || reqId.current !== id) return;
          setCatalog(data);
          setCatalogKey(queryKey);
          setItems((prev) => (data.page === 0 ? data.items : [...prev, ...data.items]));
        })
        .catch(() => { /* red caída: se mantiene la última página */ });
    }, q ? 150 : 0); // pequeña espera solo al teclear en el buscador
    return () => clearTimeout(t);
  }, [queryKey, page, cat, museum, q, sort, showBlocked, filters, buildQs]);

  function pick(part: Part) {
    const c = CAT[part.cat];
    const item: Picked = { ...part, _uid: `${part.id}-${++uid.current}`, qty: 1 };
    const previas = (build[part.cat] || []) as Picked[];
    const dup = c.multi ? previas.find((x) => x.id === part.id) : undefined;
    const ahora: Picked[] = !c.multi ? [item]
      : dup ? previas.map((x) => x.id === part.id ? { ...x, qty: (x.qty || 1) + 1 } : x)
      : [...previas, item];
    setBuild((b) => ({ ...b, [part.cat]: ahora }) as AppBuild);

    const next = siguiente(part.cat);
    if (!next) return;
    /* De una sola pieza: elegirla ya cierra el paso. */
    if (!c.multi) { setCat(next); return; }
    /* La memoria salta sola cuando no queda ningún zócalo libre: no hay
       nada más que elegir ahí. Con ranuras libres se ofrece el botón, por
       si alguien quiere seguir llenándolas. */
    if (part.cat === "ram") {
      const mbo = (build.mbo || [])[0];
      const modulos = ahora.reduce((a, r) => a + ((r as Picked & { kit?: number }).kit || 1) * (r.qty || 1), 0);
      if (mbo && modulos >= (mbo as Picked & { dimm?: number }).dimm!) setCat(next);
    }
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

  /* El botón de seguir solo tiene sentido en las categorías de varias piezas
     (las demás saltan solas) y cuando ya hay al menos una elegida. */
  const continuar = useMemo(() => {
    if (!CAT[cat].multi) return null;
    if (!((build[cat] || []) as Picked[]).length) return null;
    return siguiente(cat);
  }, [cat, build]);
  useEffect(() => {
    const button = continueButton.current;
    if (!button || !continuar) { setShowFloatingNext(false); return; }
    const root = catalogScroll.current;
    let visible = true;
    const update = () => setShowFloatingNext(!visible || Boolean(root && window.matchMedia("(max-width: 900px)").matches && root.scrollTop > 120));
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update(); }, { threshold: .9 });
    observer.observe(button);
    root?.addEventListener("scroll", update, { passive: true });
    update();
    return () => { observer.disconnect(); root?.removeEventListener("scroll", update); };
  }, [continuar, cat]);

  const resetHome = () => {
    restoreController.current?.abort(); booted.current = true;
    setBuild({}); setCat("cpu"); setTab("catalog"); setQ(""); setFilters({});
    setSort("rel"); setMuseum(false); setShowFilters(false); setBuy(null);
    setShopping(false); setSummary(false);
    window.history.replaceState(null, "", window.location.pathname);
  };

  const tabs: Tab[] = ["build", "catalog", "status"];
  const swipeEnd = (event: React.TouchEvent) => {
    const start = touchStart.current; touchStart.current = undefined;
    if (!start || start.owner !== "tabs" || event.changedTouches.length !== 1) return;
    const dx = event.changedTouches[0].clientX - start.x;
    const dy = event.changedTouches[0].clientY - start.y;
    if (!isIntentionalTabSwipe(dx, dy)) return;
    const current = tabs.indexOf(tab);
    setTab(tabs[Math.max(0, Math.min(tabs.length - 1, current + (dx < 0 ? 1 : -1)))]);
  };

  // ¿qué pieza concreta rompe el montaje? -> contactos en rojo en su ranura
  const conflictDetails = useMemo(() => {
    const found: ForgeConflict[] = [];
    for (const [c, arr] of Object.entries(build) as [CatId, Picked[] | undefined][]) {
      for (const it of arr || []) {
        const rest = { ...build } as Record<CatId, Picked[] | undefined>;
        rest[c] = ((build[c] || []) as Picked[]).filter((x) => x._uid !== it._uid);
        if (!rest[c]?.length) delete rest[c];
        const result = gate(it, rest as Build);
        if (result.blocked) found.push({ uid: it._uid, name: `${it.brand} ${it.name}`, reason: result.reason || "Conflicto detectado por el motor de compatibilidad.", cat: c });
      }
    }
    return found;
  }, [build]);
  const conflicts = useMemo(() => new Set(conflictDetails.map((item) => item.uid)), [conflictDetails]);
  const selectedCategories = useMemo(() => new Set((Object.entries(build) as [CatId, Picked[] | undefined][])
    .filter(([, items]) => Boolean(items?.length)).map(([id]) => id)), [build]);
  const selectedCount = useMemo(() => (Object.values(build) as Picked[][]).flat().length, [build]);
  const intelligence = useMemo(() => analyzeForgeBuild({
    selectedCount, requiredCore: requiredCore.map((item) => item.id), selectedCategories,
    conflicts: conflictDetails, post: log, power, psuWatt: one(build, "psu")?.watt,
    nextCategory: cat, categoryLabel: (id) => CAT[id].label,
  }), [selectedCount, requiredCore, selectedCategories, conflictDetails, log, power, build, cat]);
  const visualBuild = useMemo(() => createVisualBuildModel(build, {
    conflicts: conflictDetails.map(({ cat: conflictCat, reason }) => ({ cat: conflictCat, reason })),
    nextCategory: cat,
  }), [build, conflictDetails, cat]);

  const openGuidance = (target: CatId, minWatt?: number) => {
    if (target === "psu" && minWatt) {
      const f: ActiveFilters = { watt: [minWatt, 2000] };
      if (cat === "psu") setFilters(f); else pending.current = f;
    }
    setCat(target); setTab("catalog");
  };

  const Bar = (
    <div className="forge-topbar" style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
      borderBottom: "1px solid var(--border)", background: "var(--bg-panel)", position: "sticky", top: 0, zIndex: 30, flexWrap: "wrap" }}>
      <button type="button" onClick={resetHome} aria-label="Reiniciar montaje y volver a CPU" className="forge-home">
        <div style={{ width: 26, height: 26, border: "1px solid var(--accent)", display: "grid", placeItems: "center" }}>
          <CircuitBoard size={14} color="var(--accent)" />
        </div>
        <div>
          <div className="dsp" style={{ fontSize: 17, letterSpacing: ".02em" }}>Forge</div>
          <div className="eyebrow" style={{ fontSize: 8.5, marginTop: -2 }}>Configurador de PC</div>
        </div>
      </button>
      <div className="experience-switch" role="group" aria-label="Experiencia del configurador">
        <button aria-pressed={experience === "visual"} onClick={() => setExperience("visual")}><Box size={14} /> Visual</button>
        <button aria-pressed={experience === "technical"} onClick={() => { setExperience("technical"); setTab("catalog"); }}><SlidersHorizontal size={14} /> Técnico</button>
      </div>
      <div style={{ flex: 1 }} />
      <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <Globe size={13} color="var(--text-secondary)" />
        <select value={region} onChange={(e) => setRegion(e.target.value as RegionId)} aria-label="Región"
          style={{ width: "auto", minWidth: 150 }}>
          {Object.entries(REGIONS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </label>
      <div style={{ minWidth: 190, display: "none" }} className="wide-gauge" />
      <button className="btn btn-gold" disabled={!Object.keys(build).length}
        onClick={() => setShopping(true)}
        style={{ display: "flex", alignItems: "center", gap: 6,
          cursor: Object.keys(build).length ? "pointer" : "not-allowed" }}>
        <ShoppingCart size={12} /> Dónde comprar
      </button>
      <div style={{ textAlign: "right" }}>
        <div className="eyebrow" style={{ fontSize: 8.5 }}>Total orientativo</div>
        <div className="mono" style={{ fontSize: 17, color: "var(--accent)", fontWeight: 600, lineHeight: 1.1 }}>
          {total > 0 ? `${eur(total)} ${cur}` : "—"}
        </div>
      </div>
    </div>
  );

  const BuildPane = (
    <div className="scroll" style={{ padding: 12, height: "100%" }}>
      <VisualBuild model={visualBuild} onOpenCategory={(id) => { setCat(id); setTab("catalog"); }} />
      {GROUPS.map((g) => (
        <div key={g.id} className={`build-group build-group-${g.id}`} style={{ marginBottom: 16 }}>
          <div className="build-group-heading" style={{ marginBottom: 7 }}>
            <div className="build-group-title"><div className="eyebrow" style={{ color: "var(--text-secondary)" }}>{g.label}</div>
            <div className="mono" style={{ fontSize: 9.5, color: "var(--text-secondary)" }}>{g.sub}</div>
            </div>
            {g.id === "core" && <div className="core-progress" aria-label={`${coreDone} de ${requiredCore.length} componentes requeridos seleccionados`}>
              <div className="core-progress-copy"><span>Core build</span><strong>{coreDone} / {requiredCore.length}</strong></div>
              <div className="core-progress-track" aria-hidden="true"
                style={{ gridTemplateColumns: `repeat(${requiredCore.length}, minmax(0, 1fr))` }}>
                {requiredCore.map((c) => <i key={c.id} className={((build[c.id] || []) as Picked[]).length ? "done" : ""} />)}
              </div>
            </div>}
          </div>
          {CATS.filter((c) => c.group === g.id).map((c) => (
            <Slot key={c.id} cat={c} items={(build[c.id] || []) as Picked[]} active={cat === c.id} conflicts={conflicts}
              onOpen={(id) => { setCat(id); setTab("catalog"); }} onRemove={remove} onQty={qty} cur={cur} />
          ))}
          {g.id === "core" && (() => {
            return (
              <button className={coreDone ? "btn btn-gold" : "btn"} onClick={() => setSummary(true)}
                disabled={!coreDone} style={{ width: "100%", marginTop: 8, display: "flex",
                  alignItems: "center", justifyContent: "center", gap: 7, padding: "9px 12px",
                  cursor: coreDone ? "pointer" : "not-allowed" }}>
                <ClipboardList size={13} /> Resumen de la torre
                <span className="mono" style={{ fontSize: 10, opacity: 0.75 }}>{coreDone}/{requiredCore.length}</span>
              </button>
            );
          })()}
        </div>
      ))}
    </div>
  );

  const StatusPane = (
    <div className="scroll" style={{ padding: 12, height: "100%" }}>
      <ForgeIntelligence analysis={intelligence} onAction={openGuidance} />
      <PowerGauge power={power} psu={one(build, "psu")} />

      {power.total > 0 && (
        <div style={{ marginTop: 12, border: "1px solid var(--border)", padding: "9px 10px" }}>
          <div className="eyebrow" style={{ marginBottom: 6 }}>Reparto del consumo</div>
          {Object.entries(power.detail).filter(([, v]) => v > 0).map(([k, v]) => (
            <div key={k} style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
              <span className="mono" style={{ fontSize: 10, width: 82, color: "var(--text-secondary)" }}>{k}</span>
              <div style={{ flex: 1, height: 5, background: "#090D12" }}>
                <div style={{ height: "100%", width: `${(v / power.total) * 100}%`, background: "rgba(140,165,195,.5)" }} />
              </div>
              <span className="mono" style={{ fontSize: 10, width: 38, textAlign: "right" }}>{Math.round(v)} W</span>
            </div>
          ))}
          {power.desk > 0 && (
            <div className="mono" style={{ fontSize: 9.5, color: "var(--text-secondary)", marginTop: 7,
              borderTop: "1px solid var(--border)", paddingTop: 6, lineHeight: 1.5 }}>
              + {power.desk} W de monitores y altavoces. Van al enchufe, no a la fuente: no cuentan para dimensionarla.
            </div>
          )}
        </div>
      )}

      {!one(build, "psu") && power.total > 0 && (
        <button className="btn btn-gold" style={{ width: "100%", marginTop: 10 }}
          onClick={() => openGuidance("psu", power.rec)}>
          Ver fuentes de {power.rec} W o más
        </button>
      )}

      <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 8 }}>
        <span className="eyebrow">POST · verificación</span>
        <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
        <span className="mono" style={{ fontSize: 10, color: !log.length ? "var(--text-secondary)" : fails ? "var(--danger)" : warns ? "var(--warning)" : "var(--success)" }}>
          {!log.length ? "pendiente" : fails ? `${fails} fallo${fails > 1 ? "s" : ""}` : warns ? `${warns} aviso${warns > 1 ? "s" : ""}` : "todo correcto"}
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

  const shownBlocked = catalog ? catalog.nBlocked : 0;
  const CatalogPane = (
    <div className="catalog-content" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* La categoría se elige en el panel de montaje de la izquierda;
          aquí solo buscador, orden y conmutadores. */}
      <div className="catalog-toolbar" style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>
        <nav className="category-jump" aria-label="Categorías del montaje" data-horizontal-scroll-zone>
          {CATS.map((category) => { const Icon = category.icon; const selected = ((build[category.id] || []) as Picked[]).length > 0; return <button key={category.id} className={cat === category.id ? "is-active" : selected ? "is-selected" : ""} aria-current={cat === category.id ? "step" : undefined} onClick={() => setCat(category.id)}><Icon size={13}/><span>{category.label}</span>{selected && <i aria-label="seleccionada" />}</button>; })}
        </nav>
        <div style={{ display: "flex", gap: 7, alignItems: "center", flexWrap: "wrap" }}>
          <span className="eyebrow" style={{ whiteSpace: "nowrap" }}>{CAT[cat].label}</span>
          <div style={{ position: "relative", flex: "1 1 180px", minWidth: 150 }}>
            <Search size={13} color="var(--text-secondary)"
              style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)" }} />
            <input type="text" value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por marca, modelo o especificación…"
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
          {catalog?.hasLegacy ? (
            <button className={`chip ${museum ? "sel" : ""}`} onClick={() => setMuseum((v) => !v)}>
              {museum ? "Ocultar descatalogadas" : "Mostrar descatalogadas"}
            </button>
          ) : null}
          <button className="chip filt-toggle" aria-expanded={showFilters} onClick={() => setShowFilters((v) => !v)}>
            <SlidersHorizontal size={10} style={{ display: "inline", verticalAlign: "-1px" }} /> Filtros
          </button>
          {/* En memoria y almacenamiento se eligen varias piezas, así que no
              hay salto automático mientras queden ranuras: este botón lo
              ofrece en cuanto hay algo elegido, sin obligar a llenarlas. */}
          {continuar && (
            <button ref={continueButton} className="btn btn-gold" style={{ marginLeft: "auto", whiteSpace: "nowrap" }}
              onClick={() => { setCat(continuar); setTab("catalog"); }}>
              Continuar a {CAT[continuar].label} →
            </button>
          )}
        </div>
      </div>

      <div className="catalog-results" style={{ display: "flex", flex: 1, minHeight: 0 }}>
        <div className={`filt-col ${showFilters ? "open" : ""}`}
          style={{ width: 224, flexShrink: 0, borderRight: "1px solid var(--border)" }}>
          <FilterPanel cat={cat} facets={catalog?.facets || []} filters={filters} setFilters={setFilters}
            onClear={() => setFilters({})} />
        </div>
        <div ref={catalogScroll} className="scroll" style={{ flex: 1, padding: 12 }}>
          <div className="mono" style={{ fontSize: 10.5, color: "var(--text-secondary)", marginBottom: 9 }}>
            {catalog ? <>
              {catalog.nCompat} compatibles
              {shownBlocked > 0 && ` · ${shownBlocked} descartadas`}
              {" · "}{catalog.poolSize} en catálogo
            </> : "Cargando catálogo…"}
          </div>
          {catalog && catalog.total === 0 ? (
            <div className="panel" style={{ padding: 24, textAlign: "center" }}>
              <div className="dsp" style={{ fontSize: 15, marginBottom: 6 }}>Nada encaja</div>
              <div style={{ fontSize: 12.5, color: "var(--text-secondary)", marginBottom: 12 }}>
                Los filtros dejan fuera todo el catálogo de {CAT[cat].label.toLowerCase()}.
              </div>
              <button className="btn btn-gold" onClick={() => { setFilters({}); setQ(""); }}>Quitar filtros</button>
            </div>
          ) : (
            <>
              <div className="part-grid" style={{ display: "grid", gap: 9,
                gridTemplateColumns: "repeat(auto-fill,minmax(196px,1fr))" }}>
                {(catalog ? items : []).map(({ p, blocked, reason }) =>
                  <PartCard key={p.id} part={p} blocked={blocked} reason={reason} cur={cur}
                    chosen={((build[p.cat] || []) as Picked[]).some((x) => x.id === p.id)}
                    onPick={pick} onBuy={setBuy} />)}
              </div>
              {catalog && items.length < catalog.total && (
                <button className="btn" style={{ width: "100%", marginTop: 12 }}
                  onClick={() => setPage((p) => p + 1)}>
                  Cargar más ({items.length}/{catalog.total})
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className={`fg experience-${experience}`}>
      {Bar}

      {experience === "visual" ? <main className="cinematic-workspace">
        <div className="cinematic-hero">
          <nav className="component-rail" aria-label="Configurar componentes" data-horizontal-scroll-zone>
            <div className="rail-heading"><span className="eyebrow">Tu configuración</span><strong>{coreDone}<span> / {requiredCore.length}</span></strong></div>
            {GROUPS.map((group) => <div className="rail-group" key={group.id}>
              <span className="rail-group-label">{group.label}</span>
              {CATS.filter((category) => category.group === group.id).map((category) => {
                const Icon = category.icon;
                const selected = (build[category.id] || []) as Picked[];
                const conflict = selected.some((part) => conflicts.has(part._uid));
                return <button key={category.id} className={`rail-category${cat === category.id ? " is-active" : ""}${conflict ? " has-conflict" : ""}`} aria-current={cat === category.id ? "step" : undefined} onClick={() => setCat(category.id)}>
                  <span className="rail-icon"><Icon size={17} /></span>
                  <span className="rail-category-copy"><strong>{category.label}</strong><small>{selected.length ? `${selected[0].brand} ${selected[0].name}` : category.req ? "Por elegir" : "Opcional"}</small></span>
                  {selected.length > 0 && <span className="rail-check" aria-label={conflict ? "Conflicto" : "Seleccionado"}>{conflict ? "!" : <Check size={12} />}</span>}
                </button>;
              })}
            </div>)}
          </nav>
          <div className="cinematic-stage"><VisualBuild presentation model={visualBuild} onOpenCategory={(id) => setCat(id)} /></div>
        </div>
        <div className="build-telemetry" aria-label="Estado de tu configuración">
          <div><span>Montaje</span><strong>{coreDone} de {requiredCore.length} esenciales</strong></div>
          <div><span>Consumo en juego estimado</span><strong>{power.total > 0 ? `${Math.round(power.gaming)} W` : "Pendiente"}</strong></div>
          <div><span>Compatibilidad</span><strong className={fails ? "telemetry-error" : warns ? "telemetry-warning" : ""}>{!selectedCount ? "Elige tu primera pieza" : fails ? `${fails} conflicto${fails === 1 ? "" : "s"}` : warns ? `${warns} aviso${warns === 1 ? "" : "s"}` : "Sin conflictos detectados"}</strong></div>
          <button onClick={() => { setExperience("technical"); setTab("build"); }}><ClipboardList size={15} /><span>Revisar montaje</span><ArrowRight size={14} /></button>
        </div>
        <section className="cinematic-deck" aria-labelledby="deck-title">
          <header className="deck-heading"><div><span className="eyebrow">El siguiente paso lo eliges tú</span><h1 id="deck-title">{CAT[cat].label === "CPU" ? "Procesador" : CAT[cat].label}</h1></div><p>Elige una pieza y observa cómo toma forma tu PC.</p></header>
          <div className="cinematic-catalog">{CatalogPane}</div>
        </section>
      </main> : <>
      <div className="mtabs">
        {([["build", "Montaje"], ["catalog", "Catálogo"], ["status", "Consumo y POST"]] as const).map(([k, l]) =>
          <button key={k} className={`chip ${tab === k ? "sel" : ""}`} style={{ border: "none" }}
            onClick={() => setTab(k)}>{l}{k === "status" && fails > 0 ? ` (${fails})` : ""}</button>)}
      </div>

      <div className="layout" onTouchStart={(event) => { if (event.touches.length === 1) touchStart.current = { x: event.touches[0].clientX, y: event.touches[0].clientY, owner: getTabSwipeGestureOwner(event.target) }; else touchStart.current = undefined; }} onTouchEnd={swipeEnd} onTouchCancel={() => { touchStart.current = undefined; }}>
        <div className={`col-build ${tab === "build" ? "on" : ""}`}
          style={{ borderRight: "1px solid var(--border)", minHeight: 0 }}>{BuildPane}</div>
        <div className={`col-catalog ${tab === "catalog" ? "on" : ""}`} style={{ minHeight: 0 }}>{CatalogPane}</div>
        <div className={`col-status ${tab === "status" ? "on" : ""}`}
          style={{ borderLeft: "1px solid var(--border)", minHeight: 0 }}>{StatusPane}</div>
      </div>

      </>}

      {experience === "technical" && continuar && showFloatingNext && <button className="floating-next" onClick={() => { setCat(continuar); setTab("catalog"); }} aria-label={`Continuar a ${CAT[continuar].label}`}>{(() => { const Icon = CAT[continuar].icon; return <Icon size={16}/>; })()}<span>{CAT[continuar].label}</span><ArrowRight size={17}/></button>}

      {buy && <StoreSheet part={buy} region={region} onClose={() => setBuy(null)} />}
      {shopping && <ShoppingList build={build} region={region} total={total}
        onClose={() => setShopping(false)} />}
      {summary && <BuildSummary build={build} region={region}
        onClose={() => setSummary(false)} onShop={() => setShopping(true)} />}
    </div>
  );
}
