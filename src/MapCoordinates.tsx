import * as React from "react";
import {
  attrStats,
  padRange,
  scaleTo,
  attributeNumber,
  Stats,
  TypedAccessor,
} from "./common";
import { useDataArray } from "./DataContext";
import CoordinateContext, { CoordinateContextValue } from "./CoordinateContext";
import { ColorScheme, DEFAULT_COLOR_SCHEME } from "./colors";
import { buildColorCoordinate } from "./Coordinates";

export interface MapCoordinatesProps<T> {
  color?: TypedAccessor<T, number>;
  colorScale?: (datum: T) => string;
  colorScheme?: ColorScheme;
  children?: React.ReactNode;
  wmpX: TypedAccessor<T, number>;
  wmpY: TypedAccessor<T, number>;
  zoom: number;
  offset: { x: number; y: number };
  coordinateTransform?: (
    coordinates: CoordinateContextValue
  ) => Partial<CoordinateContextValue>;
}

function applyZoom(zoom: number, offset: number, stats: Stats): Stats {
  if (zoom === 1 && offset === 0) return stats;
  const range = stats.range / zoom;
  const center = stats.min + stats.range / 2 - offset * stats.range;

  const min = center - range / 2;
  const max = center + range / 2;
  return { ...stats, range, min, max };
}

export interface MapCoordinatesRef {
  pan(x: number, y: number): void;
}

export function MapCoordinates<T>(props: MapCoordinatesProps<T>) {
  const {
    coordinateTransform,
    wmpX,
    wmpY,
    color,
    colorScale: explicitColorScale,
    colorScheme = DEFAULT_COLOR_SCHEME,
    children,
    zoom = 1,
    offset,
  } = props;
  const existingCoordinates = React.useContext(CoordinateContext);
  const { width, height } = existingCoordinates;
  const aspect = width / height;
  const points = useDataArray<T>();

  let [xRange, yRange] = React.useMemo(() => {
    let xr = attrStats(points, wmpX);
    let yr = attrStats(points, wmpY);

    if (xr.range / yr.range === aspect) {
      return [xr, yr];
    } else if (xr.range / yr.range < aspect) {
      yr = padRange(yr, 0.1);
      const centerX = (xr.min + xr.max) / 2;
      xr.range = aspect * yr.range;
      xr.min = centerX - xr.range / 2;
      xr.max = centerX + xr.range / 2;
      return [xr, yr];
    } else {
      xr = padRange(xr, 0.1);
      const centerY = (yr.min + yr.max) / 2;
      yr.range = xr.range / aspect;
      yr.min = centerY - yr.range / 2;
      yr.max = centerY + yr.range / 2;
      return [xr, yr];
    }
  }, [points, aspect, wmpX, wmpY]);

  xRange = React.useMemo(() => applyZoom(zoom, offset.x, xRange), [
    zoom,
    offset.x,
    xRange,
  ]);

  yRange = React.useMemo(() => applyZoom(zoom, offset.y, yRange), [
    zoom,
    offset.y,
    yRange,
  ]);

  const xScale = React.useMemo(
    () =>
      Object.assign(
        (point: T) => {
          const scaled = scaleTo(attributeNumber(point, wmpX), xRange);
          if (typeof scaled === "number") return scaled * width;
          else return 0;
        },
        xRange,
        { scaleAttr: wmpX }
      ),
    [xRange, width, wmpX]
  );

  const yScale = React.useMemo(
    () =>
      Object.assign(
        (point: T) => {
          const scaled = scaleTo(attributeNumber(point, wmpY), yRange);
          if (typeof scaled === "number") return scaled * height;
          else return 0;
        },
        yRange,
        { scaleAttr: wmpY }
      ),
    [yRange, height, wmpY]
  );

  const colorCoordinate = React.useMemo(
    () =>
      buildColorCoordinate({
        colorScale: explicitColorScale,
        colorDimension: color,
        colorScheme,
        data: points,
      }),
    [explicitColorScale, color, colorScheme, points]
  );

  const coordinates: CoordinateContextValue = React.useMemo(() => {
    const c = {
      ...existingCoordinates,
      ...colorCoordinate,
      xRange,
      yRange,
      xScale,
      yScale,
      zoom,
    };

    return coordinateTransform ? { ...c, ...coordinateTransform(c) } : c;
  }, [
    existingCoordinates,
    colorCoordinate,
    xRange,
    yRange,
    xScale,
    yScale,
    zoom,
    coordinateTransform,
  ]);

  return (
    <CoordinateContext.Provider value={coordinates}>
      {children}
    </CoordinateContext.Provider>
  );
}

export default MapCoordinates;
