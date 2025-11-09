import React from "react";
import CoordinateContext from "./CoordinateContext";
import { getDimension } from "./Dimensions";
import { NumericAttribute, attributeValue } from "./common";
import { useDataArray } from "./DataContext";

interface ColorLegendProps<T> {
  top?: boolean;
  right?: boolean;
  left?: boolean;
  bottom?: boolean;
  label?: string;
  dimensionName?: NumericAttribute<T>;
  background?: boolean | string;
}

export default function CategoricalColorLegend<T>({
  top: t,
  right: r,
  left,
  bottom,
  dimensionName,
  background = false,
}: ColorLegendProps<T>) {
  const { width, height, topPad, bottomPad, rightPad, color, colorScale } =
    React.useContext(CoordinateContext);

  const data = useDataArray<T>();
  const uniqueValues = React.useMemo(() => {
    return data.reduce((values, d) => {
      if (values.size < 25) values.add(attributeValue(d, color));
      return values;
    }, new Set());
  }, [color, data]);

  return React.useMemo(() => {
    if (!color) return null;

    const colorDimension = getDimension(
      (dimensionName as string) || (color as string)
    );

    const lineHeight = 15;
    const legendPad = 10;

    const legendHeight = lineHeight * uniqueValues.size + legendPad * 2;
    const legendWidth =
      Math.max(
        ...[...uniqueValues].map(
          (v) => colorDimension.labelValue(v as number).length
        )
      ) * 13;
    let top = t;
    let right = r;

    if (bottom && top) throw new Error("legend cannot be both bottom and top");
    if (left && right) throw new Error("legend cannot be both left and right");
    if (!bottom && !top) top = true;
    if (!left && !right) right = true;

    const x = left
      ? 0
      : rightPad
      ? width - legendWidth
      : width - legendWidth - 25;

    const y = top
      ? topPad
        ? -((2 * topPad) / 3)
        : 15
      : height + (bottomPad > 0 ? bottomPad / 3 : -25) - legendHeight;

    const bgColor = background === true ? "rgba(255,255,255,0.8)" : background;

    return (
      <g className="categorical-color-legend">
        {bgColor ? (
          <rect
            width={legendWidth}
            height={legendHeight}
            fill={bgColor}
            x={x}
            y={y}
            rx="3"
            ry="3"
          />
        ) : null}

        {[...uniqueValues].map((v, i) => (
          <g key={i}>
            <rect
              width={lineHeight - 2}
              height={lineHeight - 2}
              x={x + legendPad + 1}
              y={y + legendPad + i * lineHeight + 2}
              fill={colorScale({ [color]: v })}
              rx="3"
              ry="3"
            />
            <text
              x={x + legendPad + 20}
              y={y + legendPad + (i + 1) * lineHeight}
              textAnchor="start"
            >
              {colorDimension.labelValue(v as number)}
            </text>
          </g>
        ))}
      </g>
    );
  }, [
    t,
    r,
    left,
    bottom,
    dimensionName,
    background,
    width,
    height,
    topPad,
    bottomPad,
    rightPad,
    color,
    colorScale,
    uniqueValues,
  ]);
}
