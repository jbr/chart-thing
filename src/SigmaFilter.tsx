import React from 'react';
import DataContext, { useDataArray } from './DataContext';
import { attrStats, attributeValue, NumericAttribute } from './common';

export function sigmaFilter<T>(
  data: T[],
  attribute: NumericAttribute<T>,
  threshold: number,
) {
  const stats = attrStats(data, attribute);
  return data.filter((d) => {
    const value = attributeValue(d, attribute);
    if (
      typeof value === 'number' &&
      typeof stats.stdev === 'number' &&
      typeof stats.mean === 'number'
    ) {
      return Math.abs(value - stats.mean) / stats.stdev <= threshold;
    } else return false;
  });
}

export function SigmaFilter<T>({
  attribute,
  threshold,
  children,
}: {
  attribute: NumericAttribute<T>;
  threshold: number;
  children?: React.ReactNode;
}) {
  const data = useDataArray<T>();
  const filtered = React.useMemo(
    () => sigmaFilter(data, attribute, threshold),
    [data, attribute, threshold],
  );

  return (
    <DataContext.Provider value={filtered}>{children}</DataContext.Provider>
  );
}
export default SigmaFilter;
