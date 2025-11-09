import React from "react";
import ResizeObserver from "resize-observer-polyfill";

export default function useSize<T extends Element>(): {
  ref: React.RefObject<T | null>;
  width: number;
  height: number;
  resizing: boolean;
} {
  const mounted = React.useRef<boolean>(false);
  const ref = React.useRef<T>(null);
  const [width, setWidth] = React.useState<number>(0);
  const [height, setHeight] = React.useState<number>(0);

  React.useLayoutEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const currentBBox: { width: number; height: number } = ref.current
    ? ref.current.getBoundingClientRect()
    : { width: 0, height: 0 };

  if (currentBBox.width !== width) setWidth(currentBBox.width);
  if (currentBBox.height !== height) setHeight(currentBBox.height);

  const resizeObserver = React.useMemo(
    () =>
      new ResizeObserver((entries: ResizeObserverEntry[]) => {
        const { width: w, height: h } = entries[0].contentRect;
        setWidth(w);
        setHeight(h);
      }),
    [setWidth, setHeight]
  );

  React.useEffect(() => {
    const observedElement = ref.current;
    if (!observedElement) return;
    resizeObserver.observe(observedElement);
    return () => {
      resizeObserver.unobserve(observedElement);
    };
  }, [resizeObserver]);

  const resizing =
    width === 0 ||
    height === 0 ||
    width !== currentBBox.width ||
    height !== currentBBox.height;

  return { resizing, width, height, ref };
}
