import _ from "lodash";
import React from "react";
import { attrScale, attrStats, NumericAttribute, Stats } from "./common";
import { ColorScheme } from "./colors";
import CoordinateContext from "./CoordinateContext";
import { buildColorCoordinate } from "./Coordinates";
import DataContext, { useDataArray } from "./DataContext";

interface BinStatsProps<T> {
  children?: React.ReactNode;
  x: NumericAttribute<T>;
  y: NumericAttribute<T>;
  summaryDimension: NumericAttribute<T>;
  summaryStat: NumericAttribute<Stats>;
  colorScheme: ColorScheme;
}

export interface Bin<T> {
  xBin: number;
  yBin: number;
  data: T[];
}

export default function BinStats<T>({
  children,
  x,
  y,
  summaryDimension,
  summaryStat,
  colorScheme,
}: BinStatsProps<T>) {
  const coordinates = React.useContext(CoordinateContext);
  const { width, height } = coordinates;
  const points = useDataArray<T>();

  const xStatScale = React.useMemo(() => attrScale(points, x), [x, points]);
  const yStatScale = React.useMemo(() => attrScale(points, y), [y, points]);
  const xBinWidth = Math.min(
    xStatScale.range / 20,
    Math.max(
      typeof xStatScale.stdev === "number"
        ? (3.5 * xStatScale.stdev) / Math.pow(points.length, 1 / 3)
        : xStatScale.range / 20,
      xStatScale.range / 100
    )
  );

  const yBinWidth = Math.max(
    typeof yStatScale.stdev === "number"
      ? (3.5 * yStatScale.stdev) / Math.pow(points.length, 1 / 3)
      : yStatScale.range / 20,
    yStatScale.range / 100
  );

  const xBins = Math.floor(xStatScale.range / xBinWidth);
  const yBins = Math.floor(yStatScale.range / yBinWidth);

  const start: { [index: string]: Bin<T> } = React.useMemo(
    () =>
      _.flatten(
        _.times(xBins, (xBin) => _.times(yBins, (yBin) => ({ xBin, yBin })))
      ).reduce(
        (o, { xBin, yBin }) => ({
          ...o,
          [`${xBin},${yBin}`]: { xBin, yBin, data: [] },
        }),
        {}
      ),
    [xBins, yBins]
  );

  const bins: Bin<T>[] = React.useMemo(
    () =>
      Object.values(
        points.reduce((bins, p) => {
          const xValue = xStatScale(p);
          const yValue = yStatScale(p);

          if (
            typeof xValue !== "number" ||
            !Number.isFinite(xValue) ||
            typeof yValue !== "number" ||
            !Number.isFinite(yValue)
          )
            return bins;

          const xBin = _.clamp(Math.floor(xValue * xBins), 0, xBins - 1);
          const yBin = _.clamp(Math.floor(yValue * yBins), 0, yBins - 1);
          bins[`${xBin},${yBin}`].data.push(p);
          return bins;
        }, start)
      ),
    [points, xBins, yBins, xStatScale, yStatScale, start]
  );

  const binStats = React.useMemo(
    () =>
      bins.map((bin) => ({
        ...bin,
        ...attrStats(bin.data, summaryDimension),
      })),
    [bins, summaryDimension]
  );

  const colorCoordinate = React.useMemo(
    () =>
      buildColorCoordinate({
        colorDimension: summaryStat,
        data: binStats,
        colorScheme,
        nullColor: "rgba(200,200,200,0.25)",
      }),
    [summaryStat, binStats, colorScheme]
  );

  const binWidth = Math.round(width / xBins);
  const binHeight = Math.round(height / yBins);

  const actualWidth = binWidth * xBins;
  const actualHeight = binHeight * yBins;

  const xScale = React.useCallback(
    Object.assign((d: Bin<T> | T) => {
      if (typeof d === "object" && d !== null && "xBin" in d && typeof d["xBin"] === "number")
        return d.xBin * binWidth;
      const scaled = xStatScale(d as T);
      if (typeof scaled === "number") return scaled * actualWidth;
      else return 0;
    }, xStatScale),
    [binWidth, xStatScale, actualWidth]
  );

  const yScale = React.useCallback(
    Object.assign((d: Bin<T> | T) => {
      if (typeof d === "object" && d !== null && "yBin" in d && typeof d["yBin"] === "number")
        return actualHeight - d.yBin * binHeight;
      const scaled = yStatScale(d as T);
      if (typeof scaled === "number")
        return actualHeight - scaled * actualHeight;
      else return 0;
    }, yStatScale),
    [yStatScale, binHeight, actualHeight]
  );

  return (
    <CoordinateContext.Provider
      value={{
        ...coordinates,
        ...colorCoordinate,
        x,
        y,
        xScale,
        yScale,
        xStatScale,
        yStatScale,
        xBinWidth,
        yBinWidth,
        xBins,
        yBins,
        binWidth,
        binHeight,
        summaryDimension,
        width: actualWidth,
        height: actualHeight,
      }}
    >
      <DataContext.Provider value={binStats}>{children}</DataContext.Provider>
    </CoordinateContext.Provider>
  );
}
