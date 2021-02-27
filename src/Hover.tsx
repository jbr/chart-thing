import React from 'react';
import TextWithBackground, {
  TextWithBackgroundRef,
} from './TextWithBackground';
import { getDimension } from './Dimensions';
import _ from 'lodash';
import { useDataArray } from './DataContext';
import CoordinateContext from './CoordinateContext';
import * as vector from './vector';
import { GestureEvent } from './useMapGestures';

export type HoverLabel<T> = (d: T) => string | string[];
export function Hover<T>({
  hover,
  hoverLabel,
}: {
  hover: GestureEvent | null;
  hoverLabel?: HoverLabel<T>;
}) {
  const data = useDataArray<T>();
  const {
    xScale,
    yScale,
    color: colorStat,
    colorStatValue,
    colorScale,
    width,
    height,
  } = React.useContext(CoordinateContext);
  const twbRef = React.useRef<TextWithBackgroundRef | null>(null);
  if (hover === null) return null;
  const colorDimension = getDimension(colorStat as string);

  const closest = _.minBy(data, (point) =>
    vector.distance({ x: xScale(point), y: yScale(point) }, hover),
  );

  if (!closest) return null;

  const closestLoc = { x: xScale(closest), y: yScale(closest) };
  if (vector.distance(closestLoc, hover) >= 50) return null;

  const labelLocation = {
    x: closestLoc.x,
    y: closestLoc.y,
  };

  if (twbRef && twbRef.current) {
    const text = twbRef.current;
    const xOver = width - (closestLoc.x + text.x + text.width + 18);
    const yOver = height - (closestLoc.y + text.y + text.height + 18);

    if (yOver < 0) labelLocation.y += yOver;
    if (xOver < 0) labelLocation.x -= text.width + text.x * 2;
  }

  return (
    <>
      <g transform={`translate(${labelLocation.x}, ${labelLocation.y})`}>
        <TextWithBackground
          ref={twbRef}
          x={18}
          y={18}
          padding={10}
          stroke={colorScale(closest)}
          fill="rgba(255,255,255,0.9)"
        >
          {' '}
          {hoverLabel ? (
            [hoverLabel(closest)].flat().map((l, i) => (
              <tspan key={i} y={i * 20} x={25}>
                {l}
              </tspan>
            ))
          ) : (
            <>
              {colorDimension.displayLabel}:{' '}
              {colorDimension.labelValue(colorStatValue(closest))}
            </>
          )}
        </TextWithBackground>
      </g>

      <g transform={`translate(${closestLoc.x} ${closestLoc.y})`}>
        <circle
          fill="rgba(255,255,255,0.25)"
          stroke="rgba(0, 0, 0, 0.5)"
          cx={0}
          cy={0}
          r={11.5}
          strokeWidth="1"
        />
        <circle fill={colorScale(closest)} cx={0} cy={0} r={6} />
        <circle
          fill="none"
          stroke={colorScale(closest)}
          cx={0}
          cy={0}
          r={10}
          strokeWidth="2"
        />
      </g>
    </>
  );
}
