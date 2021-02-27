import React from 'react';
import { getDimension } from './Dimensions';
import CoordinateContext from './CoordinateContext';
import _ from 'lodash';

export default function XAxis() {
  const {
    x,
    xScale,
    xStatScale,
    height,
    width,
    bottomPad,
    rightPad,
    leftPad,
    xDisplayLabel,
  } = React.useContext(CoordinateContext);
  if (!xScale) return null;

  const dimension = getDimension(x as string);

  const lazyLongestLabel = 75;

  const majorDivisions =
    dimension.divisions.find((n) => {
      const divisions = xStatScale.range / n;
      const spaceBetween = width / divisions;
      return spaceBetween > lazyLongestLabel;
    }) || dimension.divisions[dimension.divisions.length - 1];

  const first = Math.ceil(xStatScale.min / majorDivisions) * majorDivisions;
  const last = Math.floor(xStatScale.max / majorDivisions) * majorDivisions;
  const full = _.uniq([first, ..._.range(first, last, majorDivisions), last]);

  const xScaleScalar = (n: number) => xScale({ [xStatScale.scaleAttr]: n });

  return (
    <g className="x-axis">
      <text
        x={xScaleScalar(xStatScale.min) || 0}
        y={height + bottomPad * 0.4}
        textAnchor={leftPad < 50 ? 'start' : 'middle'}
        dominantBaseline="hanging"
        className="axis-value"
      >
        {dimension.labelValue(xStatScale.min)}
      </text>

      <text
        x={xScaleScalar(xStatScale.max) || 0}
        y={height + bottomPad * 0.4}
        textAnchor={rightPad < 50 ? 'end' : 'middle'}
        dominantBaseline="hanging"
        className="axis-value"
      >
        {dimension.labelValue(xStatScale.max)}
      </text>

      <line
        y1={height}
        y2={height + bottomPad * 0.35}
        x1={xScaleScalar(xStatScale.min) || 0}
        x2={xScaleScalar(xStatScale.min) || 0}
        stroke="#777"
      />

      <line
        y1={height}
        y2={height + bottomPad * 0.35}
        x1={xScaleScalar(xStatScale.max) || 0}
        x2={xScaleScalar(xStatScale.max) || 0}
        stroke="#777"
      />
      <text
        x={xScaleScalar(xStatScale.min + xStatScale.range / 2) || 0}
        y={height + bottomPad * 0.75}
        textAnchor="middle"
        className="axis-label"
      >
        {xDisplayLabel || dimension.displayLabel}
        {dimension.units ? ` (${dimension.units})` : null}
      </text>
      <g>
        {full.map((tick) => (
          <React.Fragment key={tick}>
            <text
              x={xScaleScalar(tick) || 0}
              y={height + bottomPad * 0.2}
              className="axis-value"
              textAnchor="middle"
              dominantBaseline="hanging"
              fill="#777"
            >
              {dimension.labelValue(tick)}
            </text>
            <line
              y1={0}
              y2={height}
              x1={xScaleScalar(tick) || 0}
              x2={xScaleScalar(tick) || 0}
              stroke="rgba(0,0,0,0.15)"
            />
            <line
              y1={height - bottomPad * 0.1}
              y2={height + bottomPad * 0.1}
              x1={xScaleScalar(tick) || 0}
              x2={xScaleScalar(tick) || 0}
              stroke="rgba(0,0,0,0.5)"
            />
          </React.Fragment>
        ))}
      </g>
    </g>
  );
}
