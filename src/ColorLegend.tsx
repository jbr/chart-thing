import React from "react";
import CoordinateContext from "./CoordinateContext";
import { getDimension } from "./Dimensions";
import _ from "lodash";
import { NumericAttribute } from "./common";

interface ColorLegendProps<T> {
  top?: boolean;
  right?: boolean;
  left?: boolean;
  bottom?: boolean;
  label?: string;
  dimensionName?: NumericAttribute<T>;
  background?: boolean | string;
}

export default function ColorLegend<T>({
  top: t,
  right: r,
  left,
  bottom,
  dimensionName,
  background = false,
}: ColorLegendProps<T>) {
  const {
    width,
    height,
    topPad,
    bottomPad,
    rightPad,
    color,
    colorStatScale,
    colorScale,
  } = React.useContext(CoordinateContext);

  return React.useMemo(() => {
    if (!color) return null;

    const colorDimension = getDimension(
      (dimensionName as string) || (color as string)
    );
    const legendHeight = topPad ? topPad / 4 : height / 30;
    const legendWidth = width / 4;
    const stops =
      legendWidth <= 100
        ? [0, 1]
        : legendWidth < 200
        ? [0, 0.5, 1]
        : [0, 0.25, 0.5, 0.75, 1];
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
      <g className="color-legend">
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            {_.times(legendWidth).map((pct) => (
              <stop
                key={pct}
                offset={`${(100 * pct) / legendWidth}%`}
                stopColor={colorScale({
                  [colorStatScale.scaleAttr]:
                    colorStatScale.min +
                    (pct / legendWidth) * colorStatScale.range,
                })}
              />
            ))}
          </linearGradient>
        </defs>

        {bgColor ? (
          <rect
            width={legendWidth + 40}
            height={legendHeight + 30}
            fill={bgColor}
            x={x - 20}
            y={y - 15}
            rx="3"
            ry="3"
          />
        ) : null}

        <rect
          width={legendWidth}
          height={legendHeight}
          x={x}
          y={y}
          rx="3"
          ry="3"
          fill="url(#gradient)"
        />

        <text
          x={x + legendWidth / 2}
          y={y - 2}
          textAnchor="middle"
          className="alignment-baseline-bottom"
        >
          {dimensionName
            ? `${color} of ${colorDimension.displayLabel}`
            : colorDimension.displayLabel}
        </text>

        {stops.map((valueToLabel) => (
          <text
            key={valueToLabel}
            x={x + valueToLabel * legendWidth}
            y={y + legendHeight + 2}
            textAnchor="middle"
            dominantBaseline="hanging"
          >
            {colorDimension.labelValue(
              colorStatScale.min + colorStatScale.range * valueToLabel
            )}
          </text>
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
    colorStatScale,
    colorScale,
  ]);
}
