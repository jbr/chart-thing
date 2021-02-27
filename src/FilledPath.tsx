import React from "react";
import CoordinateContext from "./CoordinateContext";
import { useDataArray } from "./DataContext";

export function FilledPath<T>(attributes?: React.SVGProps<SVGPathElement>) {
  const points = useDataArray<T>();
  const {
    width,
    height,
    xScale,
    yScale,
    colorStatScale,
    colorScale
  } = React.useContext(CoordinateContext);
  if (!xScale || !yScale) throw new Error();

  if (!colorScale) return null;
  if (!width) return null;

  const d = points.map(p => `${xScale(p)}, ${yScale(p)}`).join(" L ");

  const gradientId = "density";
  return (
    <g>
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          {new Array(101).fill(0).map((_ignored: unknown, stop: number) => (
            <stop
              key={stop}
              offset={`${stop}%`}
              stopColor={colorScale({
                effort: colorStatScale.min + colorStatScale.range * (stop / 100)
              })}
            />
          ))}
        </linearGradient>
      </defs>
      <path
        d={`m ${d} ${width}, ${height} L 0, ${height} L 0, ${yScale(
          points[0]
        )}`}
        fill={`url(#${gradientId})`}
        {...attributes}
      />
    </g>
  );
}

export default FilledPath;
