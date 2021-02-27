import React from "react";
import { useDataArray } from "./DataContext";
import SizedSVG from "./SizedSVG";
import CoordinateContext from "./CoordinateContext";
import BinStats1d, { Bin1d } from "./BinStats1d";
import Title from "./Title";
import XAxis from "./XAxis";
import YAxis from "./YAxis";
import { NumericAttribute, Stats } from "./common";

function Rectangles<T>() {
  const bins = useDataArray<Bin1d<T>>();
  const { xScale, yScale, binWidth, height } = React.useContext(
    CoordinateContext
  );

  return (
    <g>
      {bins.map((bin) => (
        <rect
          key={bin.xBin}
          x={xScale(bin)}
          y={yScale(bin)}
          width={binWidth}
          height={height - yScale(bin)}
          fill="black"
          stroke="none"
        />
      ))}
    </g>
  );
}

export default function Histogram<T>({
  x,
  children,
  summaryStat,
  summaryDimension,
}: {
  x: NumericAttribute<T>;
  children?: React.ReactNode;
  summaryStat: NumericAttribute<Stats>;
  summaryDimension: NumericAttribute<T>;
}) {
  return (
    <SizedSVG>
      <BinStats1d<T>
        x={x}
        summaryDimension={summaryDimension}
        summaryStat={summaryStat}
      >
        <Title />
        <XAxis />
        <YAxis />
        <Rectangles />
        {children ? <g>{children}</g> : null}
      </BinStats1d>
    </SizedSVG>
  );
}
