import React from "react";

interface GradientBarProps {
  x: number;
  y: number;
  width: number;
  height: number;
  min: number;
  max: number;
  colorScale: (n: number) => string;
}

export default function GradientBar({
  x,
  y,
  width,
  height,
  min = 0,
  max = 1,
  colorScale,
}: GradientBarProps) {
  const gradientId = React.useMemo(
    () => [min, max, Math.random().toString().slice(2)].join("-"),
    [min, max]
  );
  if (!colorScale) return null;
  if (!width) return null;

  return (
    <g className="color-legend">
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          {new Array(101).fill(0).map((_ignored: unknown, stop: number) => (
            <stop
              key={stop}
              offset={`${stop}%`}
              stopColor={colorScale(min + (max - min) * (stop / 100))}
            />
          ))}
        </linearGradient>
      </defs>
      <rect
        width={width}
        height={height}
        x={x}
        y={y}
        rx="3"
        ry="3"
        fill={`url(#${gradientId})`}
      />
    </g>
  );
}
