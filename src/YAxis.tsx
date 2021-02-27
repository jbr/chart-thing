import React from 'react';
import { getDimension } from './Dimensions';
import CoordinateContext from './CoordinateContext';
import _ from 'lodash';
interface YAxisProps {
  label?: boolean;
}
export default function YAxis(props: YAxisProps) {
  const {
    y,
    yScale,
    yStatScale,
    leftPad,
    height,
    width,
    yDisplayLabel,
  } = React.useContext(CoordinateContext);
  const dimension = getDimension(y as string);

  const lazyLongestLabel = 50;

  const majorDivisions =
    dimension.divisions.find((n) => {
      const divisions = yStatScale.range / n;
      const spaceBetween = height / divisions;
      return spaceBetween > lazyLongestLabel;
    }) || dimension.divisions[dimension.divisions.length - 1];

  const first = Math.ceil(yStatScale.min / majorDivisions) * majorDivisions;
  const last = Math.floor(yStatScale.max / majorDivisions) * majorDivisions;
  const full = _.uniq([
    yStatScale.min,
    ..._.range(first, last + 1, majorDivisions),
    yStatScale.max,
  ]);

  const labelX = leftPad <= 50 ? leftPad * -0.9 : leftPad * -0.6;

  const yScaleScalar = (n: number) => yScale({ [yStatScale.scaleAttr]: n });
  const label = props.label ?? true;

  return (
    <g className="y-axis">
      {label ? (
        <text
          x={labelX}
          y={yScaleScalar(yStatScale.min + yStatScale.range / 2)}
          textAnchor="middle"
          dominantBaseline="hanging"
          className="axis-label"
          transform={`rotate(-90 ${labelX} ${yScaleScalar(
            yStatScale.min + yStatScale.range / 2,
          )})`}
        >
          {yDisplayLabel || dimension.displayLabel}
          {dimension.units ? ` (${dimension.units})` : null}
        </text>
      ) : null}
      <g>
        {full.map((tick) => (
          <React.Fragment key={tick}>
            <text
              x={leftPad <= 50 ? -3 : -10}
              y={yScaleScalar(tick)}
              className="axis-value"
              textAnchor="end"
              dominantBaseline="hanging"
              transform={`rotate(-45 -10 ${yScaleScalar(tick)})`}
              fill="#777"
            >
              {dimension.labelValue(tick)}
            </text>
            <line
              x1={0}
              x2={width}
              y1={yScaleScalar(tick)}
              y2={yScaleScalar(tick)}
              stroke="rgba(0,0,0,0.15)"
            />
            <line
              x1={0}
              x2={10}
              y1={yScaleScalar(tick)}
              y2={yScaleScalar(tick)}
              stroke="rgba(0,0,0,0.5)"
            />
          </React.Fragment>
        ))}
      </g>
    </g>
  );
}
