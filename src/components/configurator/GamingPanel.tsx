"use client";

import { useId, useMemo, useState } from "react";
import Image from "next/image";
import { Gamepad2, Info, Monitor, SlidersHorizontal } from "lucide-react";
import { GAMES, type GamingGame } from "@/data/games";
import type { AppBuild } from "@/lib/compat";
import { estimateGamingFps, fpsTone, GAMING_RESOLUTIONS, getGamingHardware, type FpsRange, type GamingQuality, type GamingResolution } from "@/lib/gaming-estimate";
import styles from "./GamingPanel.module.css";

export interface GamingPreferences {
  games: readonly string[];
  resolution: GamingResolution;
  quality: GamingQuality;
}
interface GamingPanelProps {
  build: AppBuild;
  preferences: GamingPreferences;
  onPreferencesChange: (preferences: GamingPreferences) => void;
}
const SORTED_GAMES = [...GAMES].sort((a, b) => a.name.localeCompare(b.name, "es"));
const GAME_BY_ID = new Map(GAMES.map((game) => [game.id, game]));

function FpsNumbers({ range }: { range: FpsRange }) {
  return <><span className={styles.fpsNumber} data-tone={fpsTone(range.low)}>{range.low}</span>{range.low !== range.high && <>–<span className={styles.fpsNumber} data-tone={fpsTone(range.high)}>{range.high}</span></>}</>;
}

function GameCover({ game }: { game: GamingGame }) {
  const [failed, setFailed] = useState(false);
  return <div className={styles.cover}>
    <div className={styles.coverFallback} aria-hidden="true"><Gamepad2 size={38} /><span>{game.name}</span></div>
    {!failed && <Image src={game.image} alt="" width={460} height={215} unoptimized loading="lazy" onError={() => setFailed(true)} />}
    <span className={styles.genre}>{game.genre}</span>
  </div>;
}

export default function GamingPanel({ build, preferences, onPreferencesChange }: GamingPanelProps) {
  const prefix = useId();
  const { games: selectedGames, resolution, quality } = preferences;


  const hardware = useMemo(() => getGamingHardware(build), [build]);
  const resolutionLabel = GAMING_RESOLUTIONS.find((item) => item.id === resolution)!.label;

  return <section className={styles.panel} aria-labelledby={`${prefix}-title`}>
    <div className={styles.heading}>
      <div><span className={styles.eyebrow}><Gamepad2 size={15} /> NEXUS PLAY LAB</span><h2 id={`${prefix}-title`}>Tu PC, tus juegos.</h2><p>Explora cómo cambia la simulación con tu hardware y tus ajustes.</p></div>
      <span className={styles.simulation}><Info size={13} /> SIMULACIÓN ORIENTATIVA</span>
    </div>

    <div className={styles.controls}>
      <fieldset className={styles.resolutions}><legend><Monitor size={14} /> Resolución</legend><div>{GAMING_RESOLUTIONS.map((item) => <button type="button" key={item.id} aria-pressed={resolution === item.id} title={item.dimensions} onClick={() => onPreferencesChange({ ...preferences, resolution: item.id })}>{item.label}</button>)}</div></fieldset>
      <label className={styles.quality} htmlFor={`${prefix}-quality`}><span><SlidersHorizontal size={14} /> Calidad</span><select id={`${prefix}-quality`} value={quality} onChange={(event) => onPreferencesChange({ ...preferences, quality: event.target.value as GamingQuality })}><option>Medio</option><option>Alto</option><option>Ultra</option></select></label>
      <span className={styles.renderMode}>Resolución nativa · Sin RT · Sin generación de fotogramas</span>
    </div>

    <p className={`${styles.status} ${hardware.status === "conflict" ? styles.conflict : ""}`} role="status"><Info size={14} /><span>{hardware.message}</span></p>
    <div className={styles.games}>
      {selectedGames.map((id, slot) => {
        const game = GAME_BY_ID.get(id)!;
        const estimate = estimateGamingFps(game, hardware, resolution, quality);
        return <article className={styles.card} key={slot} aria-label={`Juego ${slot + 1}: ${game.name}`}>
          <GameCover key={game.id} game={game} />
          <div className={styles.cardBody}>
            <label className={styles.gameSelect} htmlFor={`${prefix}-game-${slot}`}><span>Juego {String(slot + 1).padStart(2, "0")}</span><select id={`${prefix}-game-${slot}`} aria-label={`Elegir juego ${slot + 1}`} value={id} onChange={(event) => onPreferencesChange({ ...preferences, games: selectedGames.map((value, index) => index === slot ? event.target.value : value) })}>{SORTED_GAMES.map((option) => <option key={option.id} value={option.id} disabled={selectedGames.includes(option.id) && id !== option.id}>{option.name}</option>)}</select></label>
            <div className={styles.result} aria-live="polite" aria-atomic="true">{estimate ? <><strong><FpsNumbers range={estimate} /></strong><span>FPS simulados</span></> : <><strong className={styles.unavailable}>—</strong><span>No disponible</span></>}</div>
            <dl className={styles.resolutionRows} aria-label="Simulación por resolución">{GAMING_RESOLUTIONS.map((item) => {
              const range = estimateGamingFps(game, hardware, item.id, quality);
              return <div key={item.id} data-selected={resolution === item.id}><dt>{item.label}</dt><dd>{range ? <><FpsNumbers range={range} /><small> FPS</small></> : <span className={styles.noRange}>No disponible</span>}</dd></div>;
            })}</dl>
            <div className={styles.cardFoot}><span>{resolutionLabel} · {quality}</span><span>{game.profile.specific ? "Perfil editorial" : "Perfil por género"}</span></div>
            {estimate?.cap && <p className={styles.cap}>Límite de {estimate.cap} FPS aplicado por el perfil.</p>}
          </div>
        </article>;
      })}
    </div>

    <div className={styles.disclosure}>
      <p>Rangos calculados, no benchmarks medidos. No garantizan FPS ni que el juego sea compatible con tu equipo.</p>
      <details><summary>Cómo se calcula y qué incluye</summary><div className={styles.method}>
        <p>Modelo editorial de NEXUS: combina un límite de CPU y uno de GPU. La referencia es Ryzen 5 7600 + RTX 4070 SUPER; los factores de resolución y calidad son ilustrativos. Se aplica un intervalo de ±17 % a perfiles de juegos concretos y ±27 % a perfiles genéricos por género. Estos intervalos no son márgenes de error estadísticos.</p>
        <p>La CPU se identifica por modelo exacto; la GPU, por familia y memoria. Se omiten variantes ambiguas o sin índice. El ajuste de fábrica de cada ensamblador, la RAM, los controladores, la temperatura y la versión del juego no se modelan. Sin ray tracing, reescalado ni fotogramas generados.</p>
        <p>Los {GAMES.length} títulos proceden de la biblioteca NEXUS. Un perfil por género no contiene mediciones específicas de ese título. El indicador de integridad FORGE se calcula por separado y no representa rendimiento en juegos.</p>
        {(hardware.cpuName || hardware.gpuName) && <p className={styles.hardware}><span>CPU: {hardware.cpuName ?? "Sin seleccionar"}</span><span>GPU: {hardware.gpuName ?? "Sin seleccionar"}</span></p>}
      </div></details>
    </div>
  </section>;
}


