import React from 'react';
import { getDimension } from './Dimensions';
import CoordinateContext from './CoordinateContext';

export default function Title() {
  const {
    x,
    y,
    width,
    topPad,
    leftPad,
    yDisplayLabel,
    xDisplayLabel,
  } = React.useContext(CoordinateContext);
  const xDimension = getDimension(x as string);
  const yDimension = getDimension(y as string);

  if (width < 350) {
    return (
      <text
        x={-leftPad / 2}
        y={-topPad / 2}
        textAnchor="start"
        className="chart-title"
      >
        {yDisplayLabel || yDimension.displayLabel} vs{' '}
        {xDisplayLabel || xDimension.displayLabel}
      </text>
    );
  } else {
    return (
      <text
        x={width / 2}
        y={-topPad / 2}
        textAnchor="middle"
        className="chart-title"
      >
        {yDisplayLabel || yDimension.displayLabel} vs{' '}
        {xDisplayLabel || xDimension.displayLabel}
      </text>
    );
  }
}
