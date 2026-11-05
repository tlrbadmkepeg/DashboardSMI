/** Garis tren kecil tanpa sumbu: nilai bulanan satu sasaran relatif terhadap target. */
export function Sparkline({ points, target, width = 88, height = 28, color = "#2563EB" }: { points: (number | null)[]; target: number | null; width?: number; height?: number; color?: string }) {
  const vals = points.filter((v): v is number => v !== null);
  if (vals.length < 2) return <span className="text-xs text-navy-300">—</span>;
  const all = target !== null ? [...vals, target] : vals;
  const min = Math.min(...all), max = Math.max(...all);
  const span = max - min || 1;
  const n = points.length;
  const x = (i: number) => (i / (n - 1)) * (width - 6) + 3;
  const y = (v: number) => height - 3 - ((v - min) / span) * (height - 6);
  let d = "";
  let started = false;
  points.forEach((v, i) => {
    if (v === null) return;
    d += `${started ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)} `;
    started = true;
  });
  const lastIdx = points.map((v, i) => (v === null ? -1 : i)).filter((i) => i >= 0).pop()!;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      {target !== null && <line x1={3} x2={width - 3} y1={y(target)} y2={y(target)} stroke="#94A3B8" strokeDasharray="2 2" strokeWidth={1} />}
      <path d={d} fill="none" stroke={color} strokeWidth={1.75} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={x(lastIdx)} cy={y(points[lastIdx] as number)} r={2.5} fill={color} />
    </svg>
  );
}
