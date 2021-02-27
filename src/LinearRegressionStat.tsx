import React from "react";
import { useDataArray } from "./DataContext";
import CoordinateContext from "./CoordinateContext";
import regression from "regression";

interface LinearRegression<T> {
  m: number;
  b: number;
  fn: (x: T) => number;
}

export default function useLinearRegression<T>(): LinearRegression<T> {
  const { xStatValue, yStatValue } = React.useContext(CoordinateContext);
  const data = useDataArray<T>();

  const result = React.useMemo(() => {
    const dd: [number, number][] = data.map((d) => [
      xStatValue(d),
      yStatValue(d),
    ]);

    return regression.linear(dd, { precision: 10 });
  }, [xStatValue, yStatValue, data]);
  const [m, b] = result.equation;
  return { m, b, fn: (x: T) => m * xStatValue(x) + b };
}
