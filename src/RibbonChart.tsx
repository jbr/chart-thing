import * as color from "d3-scale-chromatic";
import _ from "lodash";
import React from "react";
import { attributeNumber, attrScale, NumericAttribute, Scale } from "./common";
import CoordinateContext from "./CoordinateContext";
import { buildScale } from "./common";
import DataContext, { useDataArray } from "./DataContext";
import SizedSVG from "./SizedSVG";
import Title from "./Title";
import XAxis from "./XAxis";
import YAxis from "./YAxis";
import { smooth } from "./ConvolutionalSmoother";

interface RibbonChartProps<T> {
  x: NumericAttribute<T>;
  y: NumericAttribute<T>;
  weightBy: NumericAttribute<T>;
  children?: React.ReactNode;
}

interface PercentilesProps<T> {
  x: NumericAttribute<T>;
  y: NumericAttribute<T>;
  weightBy: NumericAttribute<T>;
  children: React.ReactNode;
}

interface Bin<T> {
  data: T[];
  xBin: number;
}

const colorForPercentile = (n: number) => {
  return color.interpolateInferno(n / 100);
  /* const m = 100 - Math.abs(50 - n) * 2;
   * return `rgba(4,51,104,${m}%)`; */
};
const opacityForPercentile = (n: number) => {
  return (100 - Math.abs(50 - n) * 2) / 100;
};

const percentiles = _.range(1, 100, 2);

function chooseBinWidth<T>(xStatScale: Scale<T>) {
  if (xStatScale.scaleAttr === "gradePerMi") {
    return 50;
  } else if (xStatScale.scaleAttr === "angle") {
    return 0.5;
  } else if (typeof xStatScale.stdev === "number") {
    return (3.5 * xStatScale.stdev) / Math.pow(xStatScale.count, 1 / 3);
  }
  return xStatScale.range / 20;
}

function weightedPercentile<T>(
  arr: T[],
  percent: number,
  attribute: NumericAttribute<T>,
  weightAttribute: NumericAttribute<T>
) {
  const sorted = _.sortBy(
    arr.map((d) => ({
      ...d,
      weightForPercentile: attributeNumber(d, weightAttribute),
    })),
    (d) => attributeNumber(d, attribute)
  );

  const total = _.sumBy(sorted, "weightForPercentile");
  const fractional = (total * percent) / 100;
  let sum = 0;
  for (let i = 0; i < sorted.length; i++) {
    sum += sorted[i].weightForPercentile;
    if (sum >= fractional) return attributeNumber(sorted[i], attribute);
  }
}

interface BinWithPercentile {
  x: number;
  y: number;
  bin: number;
  percentile: number;
}

export function Percentiles<T>({
  x,
  y,
  weightBy,
  children,
}: PercentilesProps<T>) {
  const coordinates = React.useContext(CoordinateContext);
  const { width, height } = coordinates;
  const points = useDataArray<T>();

  const xStatScale = React.useMemo(() => attrScale(points, x), [x, points]);
  const xBinWidth = chooseBinWidth(xStatScale);

  const xBins = Math.floor(xStatScale.range / xBinWidth);

  const start: Bin<T>[] = React.useMemo(
    () => _.range(0, xBins).map((xBin) => ({ xBin, data: [] })),
    [xBins]
  );

  const bins: Bin<T>[] = React.useMemo(
    () =>
      Object.values(
        points.reduce((bins, p) => {
          const xValue = xStatScale(p);

          if (typeof xValue !== "number" || !Number.isFinite(xValue))
            return bins;

          const xBin = _.clamp(Math.floor(xValue * xBins), 0, xBins - 1);
          bins[xBin].data.push(p);
          return bins;
        }, start)
      ),
    [points, xBins, xStatScale, start]
  );

  const data: BinWithPercentile[] = bins.flatMap((bin) => {
    //    if (bin.data.length > 5)
    return percentiles.map((p) => ({
      bin: bin.xBin,
      percentile: p,
      x: xStatScale.min + xBinWidth * (Number(bin.xBin) + 0.5),
      y: weightedPercentile(bin.data, p, y, weightBy) || NaN,
    }));
    //    else return [];
  });

  const actualXStatScale = attrScale<BinWithPercentile>(data, "x");

  const xScale = buildScale(actualXStatScale, width);
  const yStatScale = attrScale<BinWithPercentile>(data, "y");
  const yScale = buildScale(yStatScale, height, true);

  const colorScale = (d: BinWithPercentile) =>
    colorForPercentile(attributeNumber(d, "percentile"));

  const groupedByPercentile = _.mapValues(
    _.groupBy(data, "percentile"),
    (sequence) => smooth<BinWithPercentile>(sequence, "y", "y", "gaussian", 1)
  );

  return (
    <CoordinateContext.Provider
      value={{
        ...coordinates,
        xScale,
        yScale,
        xStatScale: actualXStatScale,
        yStatScale,
        colorScale,
        x,
        y,
      }}
    >
      <DataContext.Provider value={data}>
        {children}

        {percentiles.slice(0, -1).map((p, i) => {
          const nextPercentile = percentiles[i + 1];
          const percentileGroup = _.sortBy(groupedByPercentile[p], xScale);
          const nextPercentileGroup = _.sortBy(
            groupedByPercentile[nextPercentile],
            xScale
          ).reverse();
          return (
            <polygon
              shapeRendering="crispEdges"
              key={`${p}-${nextPercentile}`}
              points={[...percentileGroup, ...nextPercentileGroup]
                .map((p) => `${xScale(p)}, ${yScale(p)}`)
                .join(" ")}
              fill={colorForPercentile((p + nextPercentile) / 2)}
              opacity={opacityForPercentile((p + nextPercentile) / 2)}
              stroke="none"
            />
          );
        })}
      </DataContext.Provider>
    </CoordinateContext.Provider>
  );
}

export function RibbonChart<T>({ x, y, weightBy }: RibbonChartProps<T>) {
  return (
    <SizedSVG className="ribbonchart">
      <Percentiles x={x} y={y} weightBy={weightBy}>
        <XAxis />
        <YAxis />
        <Title />
      </Percentiles>
    </SizedSVG>
  );
}

export default RibbonChart;
