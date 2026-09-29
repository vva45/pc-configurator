const ABSENT_LAN = /^(?:[-–—]+|n\/?a|none|sin(?:\s+.*)?|no(?:\s+.*)?)$/i;
const COUNT_NOTE = /^(?:[×x]\s*\d+|doble\s+puertos?|dual(?:[\s-]+(?:ports?|lan|ethernet))?)$/i;

/** Count declared Ethernet connectors without treating link speeds as quantities. */
export function ethernetPortCount(value: unknown): number {
  if (typeof value !== "string") return 0;
  const lan = value.trim();
  if (!lan || ABSENT_LAN.test(lan)) return 0;

  // Model/speed annotations are descriptive. Only standalone count annotations
  // such as (x2), (doble puerto) or (dual) contribute to the port count.
  const declared = lan.replace(/\(([^()]*)\)/g, (_note, content: string) => {
    const count = content.trim();
    return COUNT_NOTE.test(count) ? ` ${count} ` : " ";
  });
  // A slash describes alternative hardware, not additional installed ports.
  const primary = declared.replace(/\bn\/a\b/gi, "none").split("/")[0];
  const total = primary.split(/[+,;]/).reduce((sum, entry) => {
    const segment = entry.trim();
    if (!segment || ABSENT_LAN.test(segment)) return sum;
    const multiplier = segment.match(/[×x]\s*(\d+)\s*$/i);
    if (multiplier) return sum + Number(multiplier[1]);
    if (/\b(?:doble\s+puertos?|dual)\b/i.test(segment)) return sum + 2;
    return sum + 1;
  }, 0);
  return Math.min(24, total);
}
