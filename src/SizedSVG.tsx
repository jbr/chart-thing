import React from 'react';
import CoordinateContext from './CoordinateContext';
import useSize from './useSize';
import useMapGestures, { GestureHandlers } from './useMapGestures';

export type Pads = {
  topPad: number;
  bottomPad: number;
  leftPad: number;
  rightPad: number;
};

interface SizedSVGProps extends GestureHandlers {
  children?: React.ReactNode;
  className?: string;
  id?: string;
}

function padDefaults(
  width: number,
  height: number,
  props: Partial<Pads>,
): Pads {
  const leftPad =
    typeof props.leftPad === 'number'
      ? props.leftPad
      : width < 350
        ? 50
        : width < 700
          ? 75
          : 100;

  const rightPad =
    typeof props.rightPad === 'number'
      ? props.rightPad
      : width < 350
        ? 25
        : width < 700
          ? 50
          : 100;

  const topPad =
    typeof props.topPad === 'number'
      ? props.topPad
      : height < 350
        ? 50
        : height < 700
          ? 75
          : 100;

  const bottomPad =
    typeof props.bottomPad === 'number'
      ? props.bottomPad
      : height < 350
        ? 50
        : height < 700
          ? 75
          : 100;

  return { leftPad, rightPad, topPad, bottomPad };
}

const SizedSVG = (props: SizedSVGProps & Partial<Pads>) => {
  const { ref, width, height, resizing } = useSize<HTMLDivElement>();
  const { children, className, id } = props;

  const pads = padDefaults(width, height, props);
  const { leftPad, rightPad, topPad, bottomPad } = pads;

  const coordinateContext = React.useContext(CoordinateContext);

  useMapGestures(ref, props, { ...pads, width, height });

  if (coordinateContext.width && coordinateContext.height) {
    return <>children</>;
  } else {
    return (
      <div
        className={`resize-container ${resizing ? 'resizing' : ''}`}
        ref={ref}
      >
        {resizing ? null : (
          <svg
            shapeRendering="crispEdges"
            className={className}
            id={id}
            width={width}
            height={height}
          >
            <g transform={`translate(${leftPad} ${topPad})`}>
              <CoordinateContext.Provider
                value={{
                  ...coordinateContext,
                  width: width - (leftPad + rightPad),
                  height: height - (topPad + bottomPad),
                  topPad,
                  bottomPad,
                  leftPad,
                  rightPad,
                }}
              >
                <>{children}</>
              </CoordinateContext.Provider>
            </g>
          </svg>
        )}
      </div>
    );
  }
};

export default SizedSVG;
