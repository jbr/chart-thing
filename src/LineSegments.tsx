import React from "react";
import CoordinateContext from "./CoordinateContext";
import { useDataArray } from "./DataContext";
import { attributeValue, TypedAccessor } from "./common";
import chroma from "chroma-js";
import _ from "lodash";

const ANGLE_RESOLUTION = 5;

function last<T>(arr: T[]): T {
  return arr[arr.length - 1];
}

const dissimilarColors = (
  { color1, color2, distance }: SegmentPoint,
  colorResolution: number
) => {
  if (color1 === color2) {
    return false;
  } else if (color1 && color2) {
    const diff = Math.min(
      chroma.deltaE(color1, color2),
      chroma.distance(color1, color2)
    );
    const gradient = diff * distance;
    return gradient > colorResolution;
  } else return true;
};

const gradientName = ({ color1, color2 }: SegmentPoint) =>
  `gradient-${color1.replace(/[()#, ]+/g, "-")}-${color2.replace(
    /[()#, ]+/g,
    "-"
  )}`;

interface LineSegmentsProps<T> {
  continuity?: TypedAccessor<T, boolean>;
  resolution?: number;
  strokeWidth?: number;
  colorResolution?: number;
  outline?: boolean;
}

interface SegmentPoint {
  xComponent: number;
  yComponent: number;
  distance: number;
  x: number;
  y: number;
  index: number;
  angle: number;
  color1: string;
  color2: string;
  gradientAngle: number;
  flipGradient: boolean;
  continuous: boolean;
}

export default function LineSegments<T>(props: LineSegmentsProps<T>) {
  const {
    continuity,
    resolution = 0,
    strokeWidth = 5,
    colorResolution = 5,
    outline = false,
  } = props;
  const points = useDataArray<T>();
  const { xScale, yScale, colorScale, width, height } = React.useContext(
    CoordinateContext
  );

  if (!xScale || !yScale) throw new Error();

  const compressed: (SegmentPoint | SegmentPoint[])[] = React.useMemo(
    () =>
      points.reduce(
        (
          compressed: (SegmentPoint | SegmentPoint[])[],
          point: T,
          index: number
        ) => {
          const x = xScale(point);
          const y = yScale(point);

          if (
            typeof x !== "number" ||
            !Number.isFinite(x) ||
            typeof y !== "number" ||
            !Number.isFinite(y)
          )
            return compressed;
          const color = colorScale ? colorScale(point) : "black";
          if (compressed.length === 0)
            return [
              {
                x,
                y,
                index,
                color1: color,
                color2: color,
                continuous: false,
                flipGradient: false,
                xComponent: 0,
                yComponent: 0,
                distance: 0,
              } as SegmentPoint,
            ];

          const lastCompressed = last(compressed);
          const lastPoint = Array.isArray(lastCompressed)
            ? last(lastCompressed)
            : lastCompressed;

          const distance = Math.sqrt(
            Math.pow(x - lastPoint.x, 2) + Math.pow(y - lastPoint.y, 2)
          );

          const continuous = continuity
            ? !!attributeValue(point, continuity)
            : true;

          const angle =
            (Math.atan2(y - lastPoint.y, x - lastPoint.x) * 180) / Math.PI;

          const gradientAngle = angle;
          const flipGradient = false;

          const color2 = color;
          const color1 = lastPoint.color2;

          const xComponent = x - lastPoint.x;
          const yComponent = y - lastPoint.y;
          const newPoint: SegmentPoint = {
            xComponent,
            yComponent,
            distance,
            x,
            y,
            index,
            angle,
            color2,
            color1,
            gradientAngle,
            flipGradient,
            continuous,
          };

          const onScreen = _.inRange(x, 0, width) && _.inRange(y, 0, height);
          const resolutionForThisPoint = onScreen ? resolution : 50;
          const angleResolutionForThisPoint = onScreen ? ANGLE_RESOLUTION : 20;

          const keep =
            distance >= strokeWidth &&
            (dissimilarColors(newPoint, colorResolution) ||
              continuous !== lastPoint.continuous ||
              distance >= resolutionForThisPoint ||
              (lastPoint.angle &&
                Math.abs(lastPoint.angle - angle) >=
                  angleResolutionForThisPoint));

          if (keep) {
            if (
              !dissimilarColors(newPoint, colorResolution) &&
              !dissimilarColors(lastPoint, colorResolution)
            ) {
              if (Array.isArray(lastCompressed)) {
                lastCompressed.push(newPoint);
              } else {
                compressed[compressed.length] = [lastPoint, newPoint];
              }
            } else {
              compressed.push(newPoint);
            }
          }

          return compressed;
        },
        [] as SegmentPoint[]
      ),
    [
      points,
      xScale,
      yScale,
      width,
      height,
      resolution,
      colorScale,
      continuity,
      strokeWidth,
      colorResolution,
    ]
  );

  const gradients = React.useMemo(
    () =>
      _.uniqBy(
        compressed
          .filter(function (c): c is SegmentPoint {
            return !Array.isArray(c);
          })
          .map((c: SegmentPoint) => ({
            name: gradientName(c),
            color1: c.color1,
            color2: c.color2,
          }))
          .filter((g) => g.color1 !== g.color2),
        "name"
      ),
    [compressed]
  );

  return React.useMemo(
    () => (
      <g>
        {outline ? (
          <>
            <circle
              cx={xScale(points[0])}
              cy={yScale(points[0])}
              r={strokeWidth - 2}
              stroke="rgba(0,0,0,0.5)"
              strokeWidth="1.5"
              fill={colorScale(points[0])}
            />
            <path
              strokeLinejoin="round"
              d={`m ${compressed
                .flat()
                .map((p) => [p.x, p.y].join(","))
                .join(" L ")}`}
              fill="none"
              strokeWidth={strokeWidth + 3}
              stroke="rgba(0,0,0,0.5)"
            />
            <circle
              cx={xScale(points[points.length - 1])}
              cy={yScale(points[points.length - 1])}
              r={strokeWidth - 2}
              strokeWidth="1.5"
              stroke="rgba(0,0,0,0.5)"
              fill={colorScale(points[points.length - 1])}
            />
          </>
        ) : null}
        {gradients.length > 0 ? (
          <defs>
            {gradients.map((g) => (
              <linearGradient key={g.name} id={g.name}>
                <stop offset="0%" stopColor={g.color1} />
                <stop offset="100%" stopColor={g.color2} />
              </linearGradient>
            ))}
          </defs>
        ) : null}
        {compressed.map((point, i) => {
          if (Array.isArray(point)) {
            return (
              <path
                strokeLinejoin="round"
                key={point.map((p) => p.index).join("-")}
                d={`m ${point.map((p) => [p.x, p.y].join(",")).join(" L ")}`}
                fill="none"
                strokeWidth={strokeWidth}
                stroke={point[0].color1}
              />
            );
          } else {
            const previousCompressed = compressed[i - 1];
            const lastPoint = Array.isArray(previousCompressed)
              ? last(previousCompressed)
              : previousCompressed;

            const nextCompressed = compressed[i + 1];
            const nextPoint = Array.isArray(nextCompressed)
              ? nextCompressed[0]
              : nextCompressed || {};

            if (lastPoint) {
              const centerX = (lastPoint.x + point.x) / 2;
              const centerY = (lastPoint.y + point.y) / 2;
              const sharp = Math.abs(point.angle - lastPoint.angle) > 30;
              const pad = strokeWidth >= 2 ? (sharp ? 4 : 2) : 0;
              const radius =
                !sharp && lastPoint.continuous && nextPoint.continuous
                  ? pad
                  : strokeWidth / 2;

              return (
                <React.Fragment key={point.index}>
                  <rect
                    x={centerX - point.distance / 2 - pad / 2}
                    y={centerY - strokeWidth / 2}
                    rx={radius}
                    ry={radius}
                    width={point.distance + pad}
                    height={strokeWidth}
                    key={point.index}
                    fill={
                      point.color1 === point.color2
                        ? point.color1
                        : `url(#${gradientName(point)})`
                    }
                    transform={`rotate(${point.angle} ${centerX} ${centerY})`}
                  />
                </React.Fragment>
              );
            } else return null;
          }
        })}
      </g>
    ),
    [
      compressed,
      colorScale,
      points,
      xScale,
      yScale,
      strokeWidth,
      gradients,
      outline,
    ]
  );
}
