import React from 'react';
import DataContext, { useDataArray } from './DataContext';
import { attributeNumber, NumericAttribute } from './common';

export const functions: {
  gaussian: ConvolutionFunction;
  movingWindow: ConvolutionFunction;
  triangular: ConvolutionFunction;
} = {
  gaussian(x, sigma) {
    return (
      (1 / (sigma * Math.sqrt(2 * Math.PI))) *
      Math.pow(Math.E, -(1 / 2) * Math.pow(x / sigma, 2))
    );
  },

  movingWindow(x, halfWindow) {
    return Math.abs(x) <= Math.ceil(halfWindow)
      ? 1 / (Math.ceil(halfWindow) * 2 + 1)
      : 0;
  },

  triangular(x, halfWindow) {
    return Math.max(0, halfWindow - Math.abs(x)) / Math.pow(halfWindow, 2);
  },
};

type ConvolutionFunctionName = keyof typeof functions;

const pad = (padSize: number, data: Array<number>): Array<number> => [
  ...new Array(padSize).fill(data[0]),
  ...data,
  ...new Array(padSize).fill(data.slice(-1)[0]),
];

const cache = (fn: ConvolutionFunction, n: number, size: number) => {
  if (typeof fn.cache !== 'object') fn.cache = {};
  if (!(size in fn.cache)) fn.cache[size] = [];
  if (typeof fn.cache[size][n] === 'undefined') fn.cache[size][n] = fn(n, size);
  return fn.cache[size][n];
};

const convolve = (
  data: Array<number>,
  fn: ConvolutionFunction,
  size: number,
) => {
  const sums = new Array(data.length).fill(0);
  for (let i = 0; i < data.length; i++)
    for (let j = 0; j < data.length; j++)
      if (Number.isFinite(data[i]))
        sums[j] += data[i] * cache(fn, Math.abs(j - i), size);
  return sums;
};

interface ConvolutionFunction {
  (x: number, size: number): number;
  cache?: { [index: number]: number[] };
}

export function smooth<T>(
  data: T[],
  on: NumericAttribute<T>,
  as: NumericAttribute<T>,
  fnOrFnName: ConvolutionFunction | ConvolutionFunctionName,
  size: number,
) {
  const padSize = size * 3;
  const fn: ConvolutionFunction =
    typeof fnOrFnName === 'function' ? fnOrFnName : functions[fnOrFnName];

  if (size === 0) return [];
  const inputData = pad(
    padSize,
    data.map((datum) => attributeNumber(datum, on)),
  );

  const outputData = convolve(inputData, fn, size).slice(
    padSize,
    data.length + padSize,
  );

  return data.map((datum, i) => ({
    ...datum,
    [as]: outputData[i],
  }));
}

interface ConvolutionalSmootherProps<T> {
  children: React.ReactNode;
  on: NumericAttribute<T>;
  as?: NumericAttribute<T>;
  fn?: ConvolutionFunction | ConvolutionFunctionName;
  size: number;
}

export function ConvolutionalSmoother<T>({
  children,
  on,
  as = on,
  fn: fnOrFnName = 'gaussian',
  size,
}: ConvolutionalSmootherProps<T>) {
  const data = useDataArray<T>();

  /* if (segmentOn)
   *   return (
   *     <SplitData on={segmentOn}>
   *       <ConvolutionalSmoother fn={fnOrFnName} size={size} on={on}>
   *         {children}
   *       </ConvolutionalSmoother>
   *     </SplitData>
   *   ); */

  const mappedData: T[] = React.useMemo(
    () => smooth(data, on, as, fnOrFnName, size),
    [data, as, on, fnOrFnName, size],
  );

  if (size === 0) {
    return <>{children}</>;
  } else {
    return (
      <DataContext.Provider value={mappedData}>{children}</DataContext.Provider>
    );
  }
}

export default ConvolutionalSmoother;
