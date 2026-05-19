"use client";

type LinePoint = { date: string; count: number };
type BarPoint = { label: string; value: number };

const W = 600;
const H = 120;
const PAD = { top: 8, right: 8, bottom: 20, left: 28 };

function norm(
  value: number,
  min: number,
  max: number,
  outMin: number,
  outMax: number,
) {
  if (max === min) return (outMin + outMax) / 2;
  return outMin + ((value - min) / (max - min)) * (outMax - outMin);
}

export function LineChart({ data }: { data: LinePoint[] }) {
  if (data.length === 0) return null;

  const counts = data.map((d) => d.count);
  const maxY = Math.max(...counts, 1);

  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  const points = data.map((d, i) => {
    const x = PAD.left + (i / (data.length - 1)) * plotW;
    const y = PAD.top + norm(d.count, 0, maxY, plotH, 0);
    return `${x},${y}`;
  });

  const xLabels = [
    data[0],
    data[Math.floor(data.length / 2)],
    data[data.length - 1],
  ];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" aria-hidden="true">
      {/* Y gridlines */}
      {[0, 0.5, 1].map((frac) => {
        const y = PAD.top + frac * plotH;
        const val = Math.round(maxY * (1 - frac));
        return (
          <g key={frac}>
            <line
              x1={PAD.left}
              y1={y}
              x2={W - PAD.right}
              y2={y}
              stroke="rgba(255,255,255,0.07)"
              strokeWidth="1"
            />
            <text
              x={PAD.left - 4}
              y={y + 4}
              textAnchor="end"
              fontSize="9"
              fill="rgba(255,255,255,0.3)"
            >
              {val}
            </text>
          </g>
        );
      })}
      {/* Line */}
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke="rgba(255,255,255,0.8)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Dots */}
      {data.map((d, i) => {
        const x = PAD.left + (i / (data.length - 1)) * plotW;
        const y = PAD.top + norm(d.count, 0, maxY, plotH, 0);
        return d.count > 0 ? (
          <circle key={i} cx={x} cy={y} r="2.5" fill="white" />
        ) : null;
      })}
      {/* X labels */}
      {xLabels.map((d, i) => {
        const idx = data.indexOf(d);
        const x = PAD.left + (idx / (data.length - 1)) * plotW;
        const label = new Date(d.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
        return (
          <text
            key={i}
            x={x}
            y={H - 4}
            textAnchor="middle"
            fontSize="9"
            fill="rgba(255,255,255,0.3)"
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
}

export function BarChart({ data }: { data: BarPoint[] }) {
  if (data.length === 0) return null;

  const maxY = 100;
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const barW = Math.floor(plotW / data.length) - 6;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" aria-hidden="true">
      {[0, 0.5, 1].map((frac) => {
        const y = PAD.top + frac * plotH;
        const val = Math.round(maxY * (1 - frac));
        return (
          <g key={frac}>
            <line
              x1={PAD.left}
              y1={y}
              x2={W - PAD.right}
              y2={y}
              stroke="rgba(255,255,255,0.07)"
              strokeWidth="1"
            />
            <text
              x={PAD.left - 4}
              y={y + 4}
              textAnchor="end"
              fontSize="9"
              fill="rgba(255,255,255,0.3)"
            >
              {val}
            </text>
          </g>
        );
      })}

      {data.map((d, i) => {
        const slotW = plotW / data.length;
        const x = PAD.left + i * slotW + (slotW - barW) / 2;
        const barH = norm(d.value, 0, maxY, 0, plotH);
        const y = PAD.top + plotH - barH;
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={barH}
              fill="rgba(255,255,255,0.15)"
            />
            <text
              x={x + barW / 2}
              y={H - 4}
              textAnchor="middle"
              fontSize="9"
              fill="rgba(255,255,255,0.4)"
            >
              {d.label.slice(0, 5)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
