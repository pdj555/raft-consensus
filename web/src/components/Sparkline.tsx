type SparklineProps = {
  data: number[];
  color: string;
  label: string;
  value: string;
  unit?: string;
  min?: number;
  max?: number;
};

export function Sparkline({
  data,
  color,
  label,
  value,
  unit,
  min,
  max,
}: SparklineProps) {
  const lo = min ?? Math.min(...data) * 0.92;
  const hi = max ?? Math.max(...data) * 1.08;
  const range = hi - lo || 1;
  const w = 320;
  const h = 48;
  const pad = 1;
  const id = label.replace(/\s+/g, "-").toLowerCase();

  const points = data
    .map((v, i) => {
      const x = pad + (i / Math.max(data.length - 1, 1)) * (w - pad * 2);
      const y = pad + (1 - (v - lo) / range) * (h - pad * 2);
      return `${x},${y}`;
    })
    .join(" ");

  const area = `${pad},${h} ${points} ${w - pad},${h}`;

  return (
    <div className="px-4 py-3.5">
      <div className="flex items-baseline justify-between gap-3">
        <p className="label-caps">{label}</p>
        <p className="metric-value text-lg font-medium text-text">
          {value}
          {unit && <span className="ml-1 text-[10px] text-text-muted">{unit}</span>}
        </p>
      </div>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="mt-3 h-11 w-full opacity-75"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`spark-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.18" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={area} fill={`url(#spark-${id})`} />
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="1.25"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}
