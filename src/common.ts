/* import interpolate from "color-interpolate";
 * export const colorMap = interpolate(["blue", "red"]);
 * export const scaleColor = (value, min, max) =>
 *   typeof min === "undefined" || typeof max === "undefined"
 *     ? "black"
 *     : colorMap((value - min) / (max - min)); */
export const m2ft = (meters: number) =>
  meters ? 3.2808398950131 * meters : meters;
export const ft2mi = (ft: number) => ft / 5280.0;
export const m2mi = (m: number) => ft2mi(m2ft(m));
export const ft2m = (feet: number) => feet / 3.2808398950131;

export type KeysWithValueType<T, V> = {
  [K in keyof T]: T[K] extends V ? K : never;
}[keyof T];

export type Attribute<T> = keyof T;
export type NumericAttribute<T> = KeysWithValueType<T, number>;
export type ValuesOf<T> = T[keyof T];
export type AccessorFunction<T, V> = (d: T) => V;
export type TypedAccessor<T, V> =
  | KeysWithValueType<T, V>
  | AccessorFunction<T, V>;
export type Accessor<T> = Attribute<T> | AccessorFunction<T, any>;

export function attributeValue<T, V>(
  datum: T,
  attr: TypedAccessor<T, V>,
): null | V {
  if (typeof attr === 'function') return attr(datum);
  else if (
    typeof datum === 'object' &&
    typeof attr === 'string' &&
    attr in datum
  )
    return (datum[attr] as unknown) as V;
  else return null;
}

export function attributeNumber<T>(
  d: T,
  attribute: TypedAccessor<T, number>,
): number {
  const value = attributeValue(d, attribute);
  if (typeof value !== 'number') return NaN;
  else return value;
}

export interface Stats {
  count: number;
  naCount: number;
  min: number;
  max: number;
  range: number;
  sum: number;
  mean: number | null;
  variance: number | null;
  stdev: number | null;
  median: number | null;
}

export const attrStats = <T>(
  arr: T[],
  attr: TypedAccessor<T, number>,
): Stats => {
  const sortedValues = arr
    .map((d) => attributeNumber(d, attr))
    .filter((v) => Number.isFinite(v))
    .sort((a, b) => a - b);

  const count = sortedValues.length;
  const naCount = arr.length - count;
  const min = sortedValues[0] || 0;
  const max = sortedValues[count - 1] || 0;
  const range = max - min;
  const sum = sortedValues.reduce((s, v) => s + v, 0) || 0;
  const mean = count === 0 ? null : sum / count;
  const variance =
    count < 2 || mean === null
      ? null
      : sortedValues.reduce((s, v) => s + Math.pow(v - mean, 2), 0) /
      (count - 1);
  const stdev = variance ? Math.sqrt(variance) : null;
  const median =
    count === 1
      ? sortedValues[0]
      : count % 2 === 0
        ? sortedValues[count / 2]
        : (sortedValues[Math.floor(count / 2)] +
          sortedValues[Math.ceil(count / 2)]) /
        2;

  return {
    count,
    naCount,
    min,
    max,
    sum,
    mean,
    variance,
    stdev,
    range,
    median,
  };
};

export const padRange = (stats: Stats, padFraction: number): Stats => ({
  ...stats,
  min: stats.min - stats.range * padFraction,
  max: stats.max + stats.range * padFraction,
  range: stats.range * (1 + padFraction * 2),
});

export const scaleTo = (datum: number | null, range: Stats) =>
  datum === null
    ? null
    : range && range.max !== range.min
      ? (datum - range.min) / range.range
      : 0;

export interface Scale<T> extends Stats {
  (datum: T): null | number;
  scaleAttr: TypedAccessor<T, number>;
}
export const attrScale = <T>(
  arr: T[],
  scaleAttr: TypedAccessor<T, number>,
  override?: Partial<Stats>,
): Scale<T> => {
  const stats = Object.assign(attrStats(arr, scaleAttr), override);
  const fn = (datum: T) => {
    const value = attributeNumber(datum, scaleAttr);
    if (typeof value !== 'number') return null;
    else return scaleTo(value, stats);
  };

  return Object.assign(fn, stats, { scaleAttr });
};

export const buildScale = <T>(
  statScale: Scale<T>,
  scaleTo: number,
  invert: boolean = false,
): Scale<T> =>
  Object.assign(
    (datum: T) => {
      const scaled = statScale(datum);
      if (scaled === null) return null;
      return invert ? scaleTo - scaleTo * scaled : scaleTo * scaled;
    },
    statScale,
    {
      min: 0,
      max: scaleTo,
      sum: statScale.sum * scaleTo,
      range: scaleTo,
      mean:
        typeof statScale.mean === 'number' ? statScale.mean * scaleTo : null,
      variance: null,
      stdev: null,
      median:
        typeof statScale.median === 'number'
          ? statScale.median * scaleTo
          : null,
    },
  );
