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
  const lo = min ?? Math.min(...data) * 0.9;
  const hi = max ?? Math.max(...data) * 1.1;
  const range = hi - lo || 1;
  const w = 280;
  const h = 56;
  const pad = 2;

  const points = data
    .map((v, i) => {
      const x = pad + (i / Math.max(data.length - 1, 1)) * (w - pad * 2);
      const y = pad + (1 - (v - lo) / range) * (h - pad * 2);
      return `${x},${y}`;
    })
    .join(" ");

  const area = `${pad},${h - pad} ${points} ${w - pad},${h - pad}`;

  return (
    <div className="panel flex flex-col rounded p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="label-caps">{label}</p>
        <p className="metric-value text-right text-lg font-semibold text-text">
          {value}
          {unit && (
            <span className="ml-1 text-[10px] font-normal text-text-muted">{unit}</span>
          )}
        </p>
      </div>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="mt-3 h-14 w-full"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`grad-${label}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={area} fill={`url(#grad-${label})`} />
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}
