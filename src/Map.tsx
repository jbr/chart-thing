import React from 'react';
import LineSegments from './LineSegments';
import Tiles, { TileProvider } from './Tiles';
import SizedSVG from './SizedSVG';
import ColorLegend from './ColorLegend';
import MapCoordinates, { MapCoordinatesProps } from './MapCoordinates';
import { TypedAccessor } from './common';
import Vector, * as vector from './vector';
import { GestureEvent } from './useMapGestures';
import CoordinateContext from './CoordinateContext';
import { Hover, HoverLabel } from './Hover';
import { ColorScheme } from './colors';

interface MapProps<T> {
  children?: React.ReactNode;
  width?: number;
  height?: number;
  strokeWidth?: number;
  tileProvider: TileProvider;
  continuity?: TypedAccessor<T, boolean>;
  zoomable?: boolean;
  hoverLabel?: HoverLabel<T>;
  outline?: boolean;
  legend?: boolean;
  coordinateTransform?: MapCoordinatesProps<T>['coordinateTransform'];
  wmpX: TypedAccessor<T, number>;
  wmpY: TypedAccessor<T, number>;
  color?: TypedAccessor<T, number>;
  colorScale?: (datum: T) => string;
  colorScheme?: ColorScheme;
}

export function ZoomButtons({ zoomBy }: { zoomBy(z: number): void }) {
  const zoomIn = React.useCallback(
    (evt) => {
      evt.stopPropagation();
      evt.preventDefault();
      zoomBy(1.2);
    },
    [zoomBy],
  );
  const zoomOut = React.useCallback(
    (evt) => {
      evt.stopPropagation();
      evt.preventDefault();
      zoomBy(1 / 1.2);
    },
    [zoomBy],
  );

  const cancel = React.useCallback(
    (evt: { stopPropagation(): void; preventDefault(): void }) => {
      evt.stopPropagation();
      evt.preventDefault();
    },
    [],
  );

  return (
    <g className="zoomButtons">
      <rect
        x={25}
        y={25}
        width={30}
        height={30}
        onClick={zoomIn}
        onTouchStart={zoomIn}
        onMouseDown={cancel}
        onMouseUp={cancel}
        fill="rgba(0,0,0,0.5)"
        rx={3}
        ry={3}
      />

      <text
        x={25 + 15}
        y={25 + 15}
        textAnchor="middle"
        onClick={zoomIn}
        onTouchStart={zoomIn}
        onMouseDown={cancel}
        onMouseUp={cancel}
        fill="white"
        fontSize="30px"
        dominantBaseline="middle"
      >
        +
      </text>

      <rect
        x={25}
        y={75}
        width={30}
        height={30}
        onTouchStart={zoomOut}
        onClick={zoomOut}
        onMouseDown={cancel}
        onMouseUp={cancel}
        fill="rgba(0,0,0,0.5)"
        rx={3}
        ry={3}
      />
      <text
        x={25 + 15}
        y={75 + 15}
        textAnchor="middle"
        onTouchStart={zoomOut}
        onClick={zoomOut}
        onMouseDown={cancel}
        onMouseUp={cancel}
        fill="white"
        fontSize="30px"
        dominantBaseline="middle"
      >
        -
      </text>
    </g>
  );
}

interface OffsetState {
  staticOffset: Vector;
  dynamicOffset: Vector;
  staticZoom: number;
  dynamicZoom: number;
}

type Action = Partial<OffsetState> | ((s: OffsetState) => Partial<OffsetState>);

function reducer(state: OffsetState, action: Action): OffsetState {
  const partialState: Partial<OffsetState> =
    typeof action === 'function' ? action(state) : action;
  return { ...state, ...partialState };
}

export function Map<T>(props: MapProps<T>) {
  const {
    children,
    strokeWidth,
    continuity,
    zoomable = false,
    hoverLabel,
    outline,
    legend = true,
    tileProvider,
  } = props;

  const [
    { staticZoom, dynamicZoom, staticOffset, dynamicOffset },
    dispatch,
  ] = React.useReducer(reducer, {
    staticOffset: { x: 0, y: 0 },
    dynamicOffset: { x: 0, y: 0 },
    dynamicZoom: 1,
    staticZoom: 1,
  });
  const timerRef = React.useRef<number | null>(null);
  const reconcile = React.useCallback(
    () =>
      dispatch(({ staticOffset, dynamicOffset, staticZoom, dynamicZoom }) => ({
        dynamicOffset: { x: 0, y: 0 },
        staticOffset: vector.add(
          staticOffset,
          vector.divide(dynamicOffset, dynamicZoom * staticZoom),
        ),
        dynamicZoom: 1,
        staticZoom: dynamicZoom * staticZoom,
      })),
    [dispatch],
  );

  const delayedReconciliation = React.useCallback(
    (n: number = 100) => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      timerRef.current = window.setTimeout(() => {
        timerRef.current = null;
        window.requestAnimationFrame(() => {
          reconcile();
        });
      }, n);
    },
    [reconcile],
  );

  const onDrag = React.useCallback(
    (event: GestureEvent | null) => {
      if (event) {
        dispatch({
          dynamicOffset: vector.divide(event, {
            x: event.width,
            y: event.height,
          }),
        });
      } else {
        delayedReconciliation(50);
      }
    },
    [dispatch, delayedReconciliation],
  );

  const onZoom = React.useCallback(
    (
      event: (GestureEvent & ({ zoom: number } | { zoomTo: number })) | null,
    ) => {
      if (event) {
        dispatch(({ dynamicZoom }) => ({
          dynamicZoom:
            'zoomTo' in event ? event.zoomTo : dynamicZoom * event.zoom,
        }));
        delayedReconciliation();
      }
    },
    [dispatch, delayedReconciliation],
  );

  const zoomBy = React.useCallback(
    (n: number) => {
      dispatch(({ dynamicZoom }) => ({
        dynamicZoom: dynamicZoom * n,
      }));
      delayedReconciliation();
    },
    [dispatch, delayedReconciliation],
  );
  const [hover, setHover] = React.useState<GestureEvent | null>(null);
  const onHover = React.useCallback(
    (evt: GestureEvent | null) => {
      setHover(evt);
    },
    [setHover],
  );
  const transform = ({ width, height }: { width: number; height: number }) =>
    [
      dynamicZoom !== 1
        ? `translate(${((1 - dynamicZoom) * width) / 2}, ${((1 - dynamicZoom) * height) / 2
        }) scale(${dynamicZoom},${dynamicZoom})`
        : '',
      dynamicOffset.x || dynamicOffset.y
        ? `translate(${dynamicOffset.x * width}, ${dynamicOffset.y * height})`
        : '',
    ]
      .filter(Boolean)
      .join(' ');

  const moving = dynamicZoom !== 1 || dynamicOffset.x || dynamicOffset.y;

  const showLegend = legend && !moving;
  return (
    <SizedSVG
      leftPad={0}
      rightPad={0}
      topPad={0}
      bottomPad={0}
      onDrag={zoomable ? onDrag : undefined}
      onZoom={zoomable ? onZoom : undefined}
      onHover={zoomable ? onHover : undefined}
    >
      <CoordinateContext.Consumer>
        {({ width, height }) => (
          <g transform={moving ? transform({ width, height }) : undefined}>
            <MapCoordinates
              offset={staticOffset}
              zoom={staticZoom}
              wmpX={props.wmpX}
              wmpY={props.wmpY}
              color={props.color}
              colorScale={props.colorScale}
              colorScheme={props.colorScheme}
              coordinateTransform={props.coordinateTransform}
            >
              <Tiles tileProvider={tileProvider} zoomable={zoomable} />
              <LineSegments
                strokeWidth={strokeWidth}
                resolution={5}
                continuity={continuity}
                outline={outline}
              />
              <Hover hover={hover} hoverLabel={hoverLabel} />
              {showLegend ? <ColorLegend top right background /> : null}
              <>{children}</>
              {zoomable && !moving ? <ZoomButtons zoomBy={zoomBy} /> : null}
            </MapCoordinates>
          </g>
        )}
      </CoordinateContext.Consumer>
    </SizedSVG>
  );
}
export default Map;
