import React from "react";
import CoordinateContext from "./CoordinateContext";
import { useDataArray } from "./DataContext";

export function Path<T>() {
  const points = useDataArray<T>();
  const { xScale, yScale, colorScale } = React.useContext(CoordinateContext);
  if (!xScale || !yScale) throw new Error();
  const d = points.map(p => `${xScale(p)}, ${yScale(p)}`).join(" L ");
  return <path d={`m ${d}`} stroke={colorScale(points[0])} fill="none" />;
}

export default Path;
