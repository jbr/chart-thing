import React from 'react';
import { useDataArray } from './DataContext';
import SizedSVG from './SizedSVG';
import CoordinateContext from './CoordinateContext';
import Coordinates from './Coordinates';
import ColorLegend from './ColorLegend';
import Title from './Title';
import XAxis from './XAxis';
import YAxis from './YAxis';
import { NumericAttribute, TypedAccessor } from './common';
import { ColorScheme } from './colors';
import { HoverLabel, Hover } from './Hover';
import { GestureEvent } from './useMapGestures';

function opacityForSize(size: number) {
  if (size < 1000) {
    return 1;
  } else if (size < 5000) {
    return 0.75;
  } else if (size < 50000) {
    return 0.5;
  } else {
    return 0.25;
  }
}

function radiusForSize(size: number) {
  if (size < 5000) {
    return 2;
  } else if (size < 10000) {
    return 1.5;
  } else {
    return 1;
  }
}

export function PointCircles<T>() {
  const { xScale, yScale, colorScale } = React.useContext(CoordinateContext);
  const points = useDataArray<T>();

  if (!xScale || !yScale)
    throw new Error('scatter cannot be called without x and y scales');

  return (
    <>
      {points.map((p, i) => (
        <circle
          key={i}
          cx={xScale(p) as number}
          cy={yScale(p) as number}
          opacity={opacityForSize(points.length)}
          fill={colorScale ? colorScale(p) : 'black'}
          r={radiusForSize(points.length)}
          stroke="none"
        />
      ))}
    </>
  );
}

interface ScatterProps<T> {
  x: TypedAccessor<T, number>;
  y: TypedAccessor<T, number>;
  color?: NumericAttribute<T>;
  colorScheme?: ColorScheme;
  children?: React.ReactNode;
  hoverLabel?: HoverLabel<T>;
}

export function Scatter<T>({
  x,
  y,
  color,
  colorScheme,
  children,
  hoverLabel,
}: ScatterProps<T>) {
  const [hover, setHover] = React.useState<GestureEvent | null>(null);
  return (
    <SizedSVG onHover={setHover}>
      <Coordinates x={x} y={y} color={color} colorScheme={colorScheme}>
        <ColorLegend top right />
        <Title />
        <XAxis />
        <YAxis />
        <g>{children}</g>
        <g>
          <PointCircles />
        </g>
        <Hover hover={hover} hoverLabel={hoverLabel} />
      </Coordinates>
    </SizedSVG>
  );
}
export default Scatter;
