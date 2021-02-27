import React from 'react';
import { Pads } from './SizedSVG';
import Vector, * as vector from './vector';

export type GestureEvent = Vector & { width: number; height: number };

export interface GestureHandlers {
  onZoom?: (
    vec: (GestureEvent & ({ zoom: number } | { zoomTo: number })) | null,
  ) => void;
  onDrag?: (vec: GestureEvent | null) => void;
  onHover?: (vec: GestureEvent | null) => void;
  onClick?: (vec: GestureEvent | null) => void;
}

interface GestureState {
  dragStart: Vector | null;
  initialZoomSize: number | null;
  firstClick: (Vector & { when: number }) | null;
}

type Action =
  | null
  | Partial<GestureState>
  | ((s: GestureState) => Partial<GestureState>);

const initialState = {
  dragStart: null,
  initialZoomSize: null,
  firstClick: null,
};

function reducer(state: GestureState, action: Action): GestureState {
  if (action === null) {
    return initialState;
  } else if (typeof action === 'function') {
    return { ...state, ...action(state) };
  } else {
    return { ...state, ...action };
  }
}

const useGestureReducer = () => React.useReducer(reducer, initialState);

function touchOffset(ref: React.RefObject<HTMLElement>, touch: Touch) {
  const element = ref.current;
  if (element) {
    const bbox = element.getBoundingClientRect();
    return { x: touch.pageX - bbox.left, y: touch.pageY - bbox.top };
  } else return { x: 0, y: 0 };
}

function useEventHandler<K extends keyof HTMLElementEventMap>(
  ref: React.RefObject<HTMLElement>,
  eventName: K,
  handler: ((event: HTMLElementEventMap[K]) => void) | null,
  options?: boolean | AddEventListenerOptions,
) {
  return React.useEffect(() => {
    const current = ref.current;
    if (current && handler) {
      current.addEventListener(eventName, handler, {});
    }
    return () => {
      if (current && handler) {
        current.removeEventListener(eventName, handler);
      }
    };
  }, [ref, eventName, handler, options]);
}

export default function useMapGestures(
  ref: React.RefObject<HTMLElement>,
  gestures: GestureHandlers,
  dimensions: Pads & { width: number; height: number },
): void {
  const { onHover, onDrag, onZoom, onClick } = gestures;
  const { leftPad, topPad, width, height } = dimensions;

  const [{ initialZoomSize }, dispatch] = useGestureReducer();

  const dragStartRef = React.useRef<Vector | null>(null);
  const dragStart = dragStartRef.current;

  const onMouseMove = React.useCallback(
    (evt: MouseEvent) => {
      evt.preventDefault();
      if (onHover && !dragStart) {
        onHover({
          x: evt.offsetX - leftPad,
          y: evt.offsetY - topPad,
          width,
          height,
        });
      }

      if (dragStart && onDrag) {
        onDrag({
          x: evt.offsetX - dragStart.x,
          y: evt.offsetY - dragStart.y,
          width,
          height,
        });
      }
    },
    [onHover, dragStart, onDrag, leftPad, topPad, width, height],
  );

  type LastClick = GestureEvent & { when: number; timer?: number };
  const lastClick = React.useRef<LastClick | null>(null);
  const DOUBLECLICK_TIMEOUT = 500;
  const clickHandler = React.useCallback(
    (evt) => {
      const newClick: LastClick = {
        when: Date.now(),
        x: evt.offsetX,
        y: evt.offsetY,
        width,
        height,
      };

      if (
        lastClick.current &&
        vector.distance(lastClick.current, newClick) < 50
      ) {
        lastClick.current.timer && window.clearTimeout(lastClick.current.timer);
        lastClick.current = null;
        onZoom && onZoom({ ...newClick, zoom: 1.2 });
      } else {
        newClick.timer = window.setTimeout(() => {
          onClick && onClick(newClick);
          lastClick.current = null;
        }, DOUBLECLICK_TIMEOUT);
        lastClick.current = newClick;
      }
    },
    [onZoom, width, height, onClick],
  );

  const onMouseDown = React.useCallback(
    (evt) => {
      evt.preventDefault();
      evt.stopPropagation();
      const ds = {
        x: evt.offsetX,
        y: evt.offsetY,
      };
      dragStartRef.current = ds;
      onHover && onHover(null);
      dispatch({ dragStart: ds });
      //          }
    },
    [dispatch, onHover],
  );

  const up = React.useCallback(
    (evt) => {
      //            if (evt.target === ref.current) {
      evt.preventDefault();
      evt.stopPropagation();
      dispatch(null);
      dragStartRef.current = null;

      if (
        dragStart &&
        vector.distance(dragStart, { x: evt.offsetX, y: evt.offsetY }) < 5
      ) {
        clickHandler(evt);
      } else {
        onDrag && onDrag(null);
      }
      //            onZoom && onZoom(null);
      //            }
    },
    [onDrag, dispatch, dragStart, clickHandler],
  );

  // const out = React.useCallback(
  //     evt => {
  //         evt.preventDefault();
  //         dispatch(null);
  //         dragStartRef.current = null;
  //         onDrag && onDrag(null);
  //         onHover && onHover(null);
  //         //            onZoom && onZoom(null);
  //     },
  //     [onHover, onDrag, dispatch]
  // );

  const onTouchStart = React.useCallback(
    (evt: TouchEvent) => {
      evt.preventDefault();
      if (evt.touches.length === 1) {
        const ds = touchOffset(ref, evt.touches[0]);
        dragStartRef.current = ds;
        dispatch({
          initialZoomSize: null,
          dragStart: ds,
        });
      } else if (evt.touches.length === 2) {
        const dragStart = vector.center(
          touchOffset(ref, evt.touches[0]),
          touchOffset(ref, evt.touches[1]),
        );

        const initialZoomSize = vector.distance(
          touchOffset(ref, evt.touches[0]),
          touchOffset(ref, evt.touches[1]),
        );

        dispatch({
          dragStart,
          initialZoomSize,
        });
      }
    },
    [dispatch, ref],
  );

  const touchMove = React.useCallback(
    (evt: TouchEvent) => {
      evt.preventDefault();
      if (evt.touches.length === 1 && dragStart && onDrag) {
        onDrag({
          ...vector.subtract(touchOffset(ref, evt.touches[0]), dragStart),
          width,
          height,
        });
      } else if (evt.touches.length === 2) {
        const offsets = [...evt.touches].map((x) => touchOffset(ref, x));
        if (dragStart && onDrag) {
          const c = vector.center(...offsets);
          onDrag({ ...vector.subtract(c, dragStart), width, height });
        }

        if (initialZoomSize && onZoom) {
          const currentZoomSize = vector.distance(offsets[0], offsets[1]);
          onZoom({
            ...vector.center(...offsets),
            width,
            height,
            zoomTo: currentZoomSize / initialZoomSize,
          });
        }
      }
    },
    [dragStart, onDrag, onZoom, initialZoomSize, width, height, ref],
  );

  const onWheel = React.useCallback(
    (evt: WheelEvent) => {
      evt.preventDefault();
      const mag = Math.log(Math.abs(evt.deltaY)) / 100;
      if (onZoom && Number.isFinite(mag)) {
        if (evt.deltaY < 0)
          onZoom({
            x: width / 2,
            y: height / 2,
            width,
            height,
            zoom: 1 + mag,
          });
        else if (evt.deltaY > 0)
          onZoom({
            x: width / 2,
            y: height / 2,
            width,
            height,
            zoom: 1 / (1 + mag),
          });
        //                delayZoom();
      }
    },
    [onZoom, width, height],
  );

  useEventHandler(ref, 'mousedown', onClick || onDrag ? onMouseDown : null);
  useEventHandler(ref, 'mouseup', onClick || onDrag ? up : null);
  //    useEventHandler(ref, "click", clickHandler);
  useEventHandler(ref, 'mousemove', onHover || onDrag ? onMouseMove : null);
  useEventHandler(
    ref,
    'touchstart',
    onZoom || onDrag || onClick ? onTouchStart : null,
  );
  useEventHandler(
    ref,
    'touchmove',
    onZoom || onDrag || onClick ? touchMove : null,
  );
  useEventHandler(ref, 'touchend', onZoom || onDrag || onClick ? up : null);
  useEventHandler(ref, 'wheel', onZoom ? onWheel : null);
}
