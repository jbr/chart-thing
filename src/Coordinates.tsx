import React from 'react';
import {
  attrScale,
  attributeValue,
  buildScale,
  NumericAttribute,
  attributeNumber,
  TypedAccessor,
} from './common';
import { useDataArray } from './DataContext';
import CoordinateContext, { CoordinateContextValue } from './CoordinateContext';
import { ColorScheme, DEFAULT_COLOR_SCHEME } from './colors';
import * as d3_ from 'd3-scale-chromatic';
import { getDimension } from './Dimensions';
const d3: { [index: string]: any } = { ...d3_ };

export function buildColorCoordinate<T>({
  colorScale,
  colorDimension,
  data,
  colorScheme,
  nullColor = 'black',
}: {
  colorScale?: (datum: T) => string;
  colorDimension?: TypedAccessor<T, number>;
  data: T[];
  colorScheme?: ColorScheme;
  nullColor?: string;
}) {
  if (colorScale) return { colorScale };
  else if (colorDimension) {
    const dimension = getDimension(colorDimension as string);

    const colorStatScale = attrScale(data, colorDimension, dimension.stats);
    const colorStatValue = (datum: T) => attributeNumber(datum, colorDimension);
    const colorScale = (d: T) =>
      typeof colorStatValue(d) === 'number' && colorScheme
        ? d3[
          `interpolate${colorScheme[0].toUpperCase()}${colorScheme.slice(1)}`
        ](colorStatScale(d))
        : nullColor;
    return {
      color: colorDimension,
      colorStatScale,
      colorScale,
      colorScheme,
      colorStatValue,
    };
  } else {
    return {
      colorScale(_d: T) {
        return nullColor;
      },
      colorStatValue() {
        return null;
      },
    };
  }
}

interface CoordinateProps<T> {
  x: TypedAccessor<T, number>;
  y: TypedAccessor<T, number>;
  children: ((c: CoordinateContextValue) => React.ReactNode) | React.ReactNode;
  color?: NumericAttribute<T>;
  colorScale?: (datum: T) => string;
  colorScheme?: ColorScheme;
  xDisplayLabel?: string;
  yDisplayLabel?: string;
}

export function Coordinates<T>({
  x,
  y,
  children,
  color,
  colorScale,
  colorScheme = DEFAULT_COLOR_SCHEME,
  xDisplayLabel,
  yDisplayLabel,
}: CoordinateProps<T>) {
  const data: T[] = useDataArray<T>();
  const coordinateContext = React.useContext(CoordinateContext);
  const { width, height } = coordinateContext;

  /*** x ***/

  const xCoordinate = React.useMemo(() => {
    if (!x) return {};
    const dimension = getDimension(x as string);
    const xStatScale = attrScale(data, x, dimension.stats);
    const xScale = buildScale(xStatScale, width);
    const xStatValue = (datum: T) => attributeValue(datum, x);
    return { x, xScale, xStatScale, xStatValue };
  }, [data, x, width]);

  const yCoordinate = React.useMemo(() => {
    if (!y) return {};
    const dimension = getDimension(y as string);
    const yStatScale = attrScale(data, y, dimension.stats);
    const yScale = buildScale(yStatScale, height, true);
    const yStatValue = (datum: T) => attributeValue(datum, y);
    return { y, yScale, yStatScale, yStatValue };
  }, [data, y, height]);

  const colorCoordinate = React.useMemo(
    () =>
      buildColorCoordinate({
        colorScale,
        colorDimension: color,
        data,
        colorScheme,
      }),
    [colorScale, color, data, colorScheme],
  );

  const coordinates = React.useMemo(
    () => ({
      ...coordinateContext,
      ...xCoordinate,
      ...yCoordinate,
      ...colorCoordinate,
      xDisplayLabel,
      yDisplayLabel,
    }),
    [
      coordinateContext,
      xCoordinate,
      yCoordinate,
      colorCoordinate,
      xDisplayLabel,
      yDisplayLabel,
    ],
  );

  return (
    <CoordinateContext.Provider value={coordinates}>
      {typeof children === 'function' ? children(coordinates) : children}
    </CoordinateContext.Provider>
  );
}

export default Coordinates;
