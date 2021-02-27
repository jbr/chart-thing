import React from 'react';
import _ from 'lodash';
import { Stats } from './common';

interface DimensionObject {
  [index: string]: Partial<DimensionDefinition>;
}

export const DimensionsContext = React.createContext<DimensionObject>({});
export const Dimensions = DimensionsContext.Provider;

export interface DimensionDefinition {
  displayLabel: string;
  units: string;
  labelValue(value: number): string;
  divisions: number[];
  stats?: Partial<Stats>;
}

function defaultDimension(dimensionName: string): DimensionDefinition {
  return {
    displayLabel: (dimensionName || '')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .toLowerCase(),
    units: '',
    labelValue(value: number) {
      return Math.round(value).toString();
    },
    divisions: [0.5, 1, 2, 5, 10, 25, 50, 100, 250, 500, 1000, 5000],
  };
}

export function getDimension<T>(
  dimensionName: Dimension<T> | Function,
): DimensionDefinition {
  const allDimensions = React.useContext(DimensionsContext);
  if (typeof dimensionName === 'string' && dimensionName in allDimensions) {
    return {
      ...defaultDimension(dimensionName as string),
      ...allDimensions[dimensionName as string],
    };
  } else {
    const name =
      typeof dimensionName === 'function'
        ? dimensionName.name
        : (dimensionName as string);
    return defaultDimension(name);
  }
}

export const dimensionsWithLabels = (...arr: string[]) =>
  _.flatten(arr).reduce(
    (o, k) => ({ ...o, [k]: getDimension(k).displayLabel }),
    {},
  );

export type Dimension<T> = keyof T;

export const SUMMARY_STATS = [
  'mean',
  'min',
  'max',
  'variance',
  'stdev',
  'range',
  'median',
  'count',
  'sum',
] as const;

export type SummaryStat = typeof SUMMARY_STATS[number];
