export interface AioSchematicGeometry {
  radiatorMm: number;
  fanCount: number;
  fanDiameter: number;
  radiatorWidth: number;
  radiatorLength: number;
  fanCenters: number[];
  endTankMargin: number;
  fanGap: number;
}

const CANONICAL_AIO_FANS: Record<number, { fanCount: number; fanDiameter: number }> = {
  120: { fanCount: 1, fanDiameter: 120 },
  240: { fanCount: 2, fanDiameter: 120 },
  280: { fanCount: 2, fanDiameter: 140 },
  360: { fanCount: 3, fanDiameter: 120 },
  420: { fanCount: 3, fanDiameter: 140 },
};

function fallbackFans(radiatorMm: number) {
  const candidates = [120, 140].map((fanDiameter) => {
    const fanCount = Math.max(1, Math.round(radiatorMm / fanDiameter));
    return { fanCount, fanDiameter, error: Math.abs(radiatorMm - fanCount * fanDiameter) };
  });
  return candidates.sort((a, b) => a.error - b.error || a.fanDiameter - b.fanDiameter)[0];
}

/**
 * Physical, viewport-independent geometry for the AIO schematic. Dimensions and
 * fan centres are millimetre-equivalent units, measured along the radiator.
 */
export function getAioSchematicGeometry(radiatorMm: unknown): AioSchematicGeometry {
  const requested = typeof radiatorMm === "number" && Number.isFinite(radiatorMm)
    ? Math.max(80, Math.round(radiatorMm))
    : 240;
  const fanLayout = CANONICAL_AIO_FANS[requested] || fallbackFans(requested);
  const fanGap = 2;
  const endTankMargin = 14;
  const radiatorWidth = fanLayout.fanDiameter + 6;
  const radiatorLength = fanLayout.fanCount * fanLayout.fanDiameter
    + (fanLayout.fanCount - 1) * fanGap
    + endTankMargin * 2;
  const firstCenter = endTankMargin + fanLayout.fanDiameter / 2;
  const fanCenters = Array.from(
    { length: fanLayout.fanCount },
    (_, index) => firstCenter + index * (fanLayout.fanDiameter + fanGap),
  );

  return {
    radiatorMm: requested,
    fanCount: fanLayout.fanCount,
    fanDiameter: fanLayout.fanDiameter,
    radiatorWidth,
    radiatorLength,
    fanCenters,
    endTankMargin,
    fanGap,
  };
}
