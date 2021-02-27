import React from 'react';
import SizedSVG from './SizedSVG';
import LineSegments from './LineSegments';
import Coordinates from './Coordinates';
import YAxis from './YAxis';
import { ColorScheme } from './colors';
import { NumericAttribute, TypedAccessor } from './common';
import { HoverLabel, Hover } from './Hover';
import { GestureEvent } from './useMapGestures';

interface SparkLineChartProps<T> {
  x: NumericAttribute<T>;
  y: NumericAttribute<T>;
  color?: NumericAttribute<T>;
  colorScheme?: ColorScheme;
  children?: React.ReactNode;
  yLabel?: string;
  invertY?: boolean;
  continuity?: TypedAccessor<T, boolean>;
  hoverLabel?: HoverLabel<T>;
  strokeWidth?: number;
}

export function SparkLineChart<T>({
  x,
  y,
  children,
  color,
  colorScheme,
  invertY = false,
  continuity,
  hoverLabel,
  strokeWidth = 1,
}: SparkLineChartProps<T>) {
  const [hover, setHover] = React.useState<GestureEvent | null>(null);
  return (
    <SizedSVG
      onHover={setHover}
      className="sparkline-chart"
      bottomPad={10}
      topPad={10}
      leftPad={15}
    >
      <Coordinates<T>
        {...{
          x,
          y,
          color,
          colorScheme,
          invertY,
        }}
      >
        <YAxis label={false} />
        <LineSegments
          resolution={0}
          continuity={continuity}
          strokeWidth={strokeWidth}
        />
        {children}
        <Hover hover={hover} hoverLabel={hoverLabel} />
      </Coordinates>
    </SizedSVG>
  );
}

export default SparkLineChart;
