type SimpleLineChartProps = {
  ariaLabel: string;
  color?: string;
  height?: number;
  points: number[];
  showArea?: boolean;
};

export function SimpleLineChart({
  ariaLabel,
  color = "#fcd34d",
  height = 128,
  points,
  showArea = true,
}: SimpleLineChartProps) {
  const width = 320;
  const padding = 12;
  const cleanPoints = points.map((point) =>
    Number.isFinite(point) ? point : 0,
  );
  const min = Math.min(...cleanPoints, 0);
  const max = Math.max(...cleanPoints, 1);
  const spread = Math.max(1, max - min);
  const coordinates = cleanPoints.map((point, index) => {
    const x =
      cleanPoints.length <= 1
        ? width / 2
        : padding + (index / (cleanPoints.length - 1)) * (width - padding * 2);
    const y =
      height - padding - ((point - min) / spread) * (height - padding * 2);

    return `${x},${y}`;
  });
  const linePoints = coordinates.join(" ");
  const areaPoints = `${padding},${height - padding} ${linePoints} ${
    width - padding
  },${height - padding}`;

  return (
    <svg
      aria-label={ariaLabel}
      className="h-full min-h-28 w-full overflow-visible"
      preserveAspectRatio="none"
      role="img"
      viewBox={`0 0 ${width} ${height}`}
    >
      <line
        stroke="rgba(255,255,255,0.08)"
        strokeDasharray="4 5"
        x1={padding}
        x2={width - padding}
        y1={height - padding}
        y2={height - padding}
      />
      {showArea && cleanPoints.length > 1 ? (
        <polygon fill={color} opacity="0.12" points={areaPoints} />
      ) : null}
      {cleanPoints.length > 1 ? (
        <polyline
          fill="none"
          points={linePoints}
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3"
        />
      ) : (
        <circle
          cx={width / 2}
          cy={height / 2}
          fill={color}
          r="4"
        />
      )}
    </svg>
  );
}
