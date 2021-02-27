import React from "react";
import { getDimension } from "./Dimensions";
import CoordinateContext from "./CoordinateContext";

interface TitleProps {
  children?: React.ReactNode;
}

export function Title(props: TitleProps) {
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

  const text =
    props.children ||
    `${yDisplayLabel || yDimension.displayLabel} vs ${
      xDisplayLabel || xDimension.displayLabel
    }`;

  return width < 350 ? (
    <text
      x={-leftPad / 2}
      y={-topPad / 2}
      textAnchor="start"
      className="chart-title"
    >
      {text}
    </text>
  ) : (
    <text
      x={width / 2}
      y={-topPad / 2}
      textAnchor="middle"
      className="chart-title"
    >
      {text}
    </text>
  );
}
export default Title;
