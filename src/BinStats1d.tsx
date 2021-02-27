import React from "react";
import { attrScale, attrStats, Scale, Stats, NumericAttribute } from "./common";
import DataContext, { useDataArray } from "./DataContext";
import _ from "lodash";
import CoordinateContext from "./CoordinateContext";
import { getDimension } from "./Dimensions";

interface BinStatsProps<T> {
  children: React.ReactNode;
  x: NumericAttribute<T>;
  summaryDimension: NumericAttribute<T>;
  summaryStat: NumericAttribute<Stats>;
}

export interface Bin1d<T> {
  xBin: number;
  data: T[];
}

export default function BinStats1d<T>({
  children,
  x,
  summaryDimension,
  summaryStat,
}: BinStatsProps<T>) {
  const coordinates = React.useContext(CoordinateContext);
  const { width, height } = coordinates;
  const points: T[] = useDataArray<T>();

  const xStatScale = React.useMemo(() => attrScale(points, x), [x, points]);
  const xBinWidth =
    typeof xStatScale.stdev === "number"
      ? (3.5 * xStatScale.stdev) / Math.pow(points.length, 1 / 3)
      : xStatScale.range / 20;

  const xBins = Math.floor(xStatScale.range / xBinWidth);

  const start: Bin1d<T>[] = React.useMemo(
    () => _.range(0, xBins).map((xBin) => ({ xBin, data: [] })),
    [xBins]
  );

  const dimension = getDimension(summaryDimension as string);

  const bins: Bin1d<T>[] = React.useMemo(
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

  const binStats: (Stats & Bin1d<T>)[] = React.useMemo(
    () =>
      bins.map((bin) => ({ ...bin, ...attrStats(bin.data, summaryDimension) })),
    [bins, summaryDimension]
  );

  const binWidth = Math.round(width / xBins);
  const actualWidth = binWidth * xBins;

  const xScale: Scale<T> = React.useCallback(
    Object.assign((d: T | Bin1d<T>) => {
      if (
        typeof d === "object" &&
        "xBin" in d &&
        typeof d["xBin"] === "number"
      ) {
        return d.xBin * binWidth;
      } else {
        const scaled = xStatScale(d as T);
        if (typeof scaled === "number") return scaled * actualWidth;
        else return 0;
      }
    }, xStatScale),
    [binWidth, xStatScale, actualWidth]
  );

  const yStatScale = React.useMemo(() => attrScale(binStats, summaryStat), [
    binStats,
    summaryStat,
  ]);

  const yScale = React.useCallback(
    Object.assign((d: Stats & Bin1d<T>) => {
      const scaled = yStatScale(d);
      if (typeof scaled === "number") return height - scaled * height;
      else return 0;
    }, yStatScale),
    [yStatScale, height]
  );

  return (
    <CoordinateContext.Provider
      value={{
        ...coordinates,
        x,
        y: summaryDimension,
        xScale,
        yScale,
        xStatScale,
        yStatScale,
        xBinWidth,
        xBins,
        binWidth,
        yDisplayLabel: `${summaryStat} of ${dimension.displayLabel}`,
        width: actualWidth,
      }}
    >
      <DataContext.Provider value={binStats}>{children}</DataContext.Provider>
    </CoordinateContext.Provider>
  );
}
