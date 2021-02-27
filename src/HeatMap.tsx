import React from "react";
import { useDataArray } from "./DataContext";
import SizedSVG from "./SizedSVG";
import CoordinateContext from "./CoordinateContext";
import ColorLegend from "./ColorLegend";
import BinStats2d, { Bin } from "./BinStats2d";
import Title from "./Title";
import XAxis from "./XAxis";
import YAxis from "./YAxis";
import { ColorScheme } from "./colors";
import { attributeValue, NumericAttribute, Stats } from "./common";

function Squares<T>() {
  const bins = useDataArray<Bin<T>>();
  const { xScale, yScale, binWidth, binHeight, colorScale } = React.useContext(
    CoordinateContext
  );

  if (
    typeof xScale === "function" &&
    typeof yScale === "function" &&
    Array.isArray(bins)
  ) {
    return (
      <g>
        {bins.map((bin) => {
          const x = xScale(bin);
          const y = yScale(bin);
          const key = [
            attributeValue(bin, "xBin"),
            attributeValue(bin, "yBin"),
          ].join(",");
          if (typeof x === "number" && typeof y === "number") {
            return (
              <rect
                stroke="none"
                key={key}
                x={Math.floor(x - 0.5)}
                y={Math.floor(y - binHeight - 0.5)}
                width={Math.ceil(binWidth + 1)}
                height={Math.ceil(binHeight + 1)}
                fill={colorScale(bin)}
              />
            );
          } else return null;
        })}
      </g>
    );
  } else return null;
}

interface HeatMapProps<T> {
  x: NumericAttribute<T>;
  y: NumericAttribute<T>;
  color: NumericAttribute<T>;
  stat: NumericAttribute<Stats>;
  colorScheme: ColorScheme;
  children?: React.ReactNode;
}

function HeatMap<T>({
  x,
  y,
  color,
  stat = "count",
  colorScheme = "plasma",
  children,
}: HeatMapProps<T>) {
  return (
    <SizedSVG className="heatmap">
      <BinStats2d
        x={x}
        y={y}
        summaryDimension={color}
        summaryStat={stat}
        colorScheme={colorScheme}
      >
        <XAxis />
        <YAxis />
        <ColorLegend top right dimensionName={color} />
        <Title />
        <Squares />
        <g>{children}</g>
      </BinStats2d>
    </SizedSVG>
  );
}

export default HeatMap;
