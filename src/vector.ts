export default interface Vector {
  x: number;
  y: number;
}
let debugEnabled = false;
let indent = 0;

export function debug(s: string): void;
export function debug<T extends Vector | number>(s: () => T): T;
export function debug(
  s: string | (() => Vector | number)
): Vector | number | void {
  if (typeof s === "string") {
    if (debugEnabled) {
      indent += 1;
      console.log([...new Array(indent)].map(() => " ").join(""), s);
    }
  } else {
    const debugBefore = debugEnabled;
    debugEnabled = true;
    const returnValue = s();
    debugEnabled = debugBefore;
    if (debugBefore === false) indent = 0;
    return returnValue;
  }
}

export function format(...xs: (Vector | number)[]): string[] {
  return xs.map((x) =>
    typeof x === "number"
      ? x.toString()
      : `(${x.x.toFixed(3)},${x.y.toFixed(3)})`
  );
}

export function add(...vectors: Vector[]): Vector {
  return vectors.reduce(
    (sum, vec) => ({ x: sum.x + vec.x, y: sum.y + vec.y }),
    { x: 0, y: 0 }
  );
}

export function subtract(a: Vector, b: Vector): Vector {
  return { x: a.x - b.x, y: a.y - b.y };
}

export function multiply(a: Vector, n: number | Vector): Vector {
  return typeof n === "number"
    ? { x: a.x * n, y: a.y * n }
    : { x: a.x * n.x, y: a.y * n.y };
}

export function divide(a: Vector, n: number | Vector): Vector {
  return typeof n === "number"
    ? { x: a.x / n, y: a.y / n }
    : { x: a.x / n.x, y: a.y / n.y };
}

export function distance(a: Vector, b: Vector): number {
  return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
}

export function center(...vectors: Vector[]): Vector {
  return divide(add(...vectors), vectors.length);
}

export function angleDeg(a: Vector, b: Vector): number {
  return (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
}
