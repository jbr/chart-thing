import React from 'react';
import SizedSVG from './SizedSVG';
import LineSegments from './LineSegments';
import Coordinates from './Coordinates';
import ColorLegend from './ColorLegend';
import Title from './Title';
import XAxis from './XAxis';
import YAxis from './YAxis';
import { ColorScheme } from './colors';
import { NumericAttribute, TypedAccessor } from './common';
import { HoverLabel, Hover } from './Hover';
import { GestureEvent } from './useMapGestures';

interface LineChartProps<T> {
  x: NumericAttribute<T>;
  y: NumericAttribute<T>;
  color?: NumericAttribute<T>;
  colorScheme?: ColorScheme;
  children?: React.ReactNode;
  xLabel?: string;
  yLabel?: string;
  invertY?: boolean;
  continuity?: TypedAccessor<T, boolean>;
  hoverLabel?: HoverLabel<T>;
  strokeWidth?: number;
}

function LineChart<T>({
  x,
  y,
  children,
  color,
  colorScheme,
  xLabel,
  yLabel,
  invertY = false,
  continuity,
  hoverLabel,
  strokeWidth,
}: LineChartProps<T>) {
  const [hover, setHover] = React.useState<GestureEvent | null>(null);
  return (
    <SizedSVG onHover={setHover} className="line-chart">
      <Coordinates<T>
        {...{
          x,
          y,
          color,
          colorScheme,
          invertY,
          xDisplayLabel: xLabel,
          yDisplayLabel: yLabel,
        }}
      >
        <Title />
        <XAxis />
        <YAxis />
        <ColorLegend top right />
        <LineSegments
          resolution={1}
          continuity={continuity}
          strokeWidth={strokeWidth}
        />
        {children}
        <Hover hover={hover} hoverLabel={hoverLabel} />
      </Coordinates>
    </SizedSVG>
  );
}

export default LineChart;
