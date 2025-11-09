import React from "react";

interface TextWithBackgroundProps {
  fill?: string;
  rx?: number;
  ry?: number;
  children?: React.ReactNode;
  fontSize?: number;
  className?: string;
  x: number | string;
  y: number | string;
  maxX?: number | string;
  maxY?: number | string;
  margin?: number | string;
  padding?: number | string;
  stroke?: string;
  strokeWidth?: number | string;
}

function asFloat(n: number | string) {
  if (typeof n === "string") return parseFloat(n);
  else return n;
}

export type TextWithBackgroundBBox = {
  width: number;
  height: number;
  x: number;
  y: number;
};

export type TextWithBackgroundRef = TextWithBackgroundBBox | null;

export const TextWithBackground = React.forwardRef<TextWithBackgroundBBox, TextWithBackgroundProps>(
  (props, ref) => {
    const {
      fill = "rgba(255,255,255,0.75)",
      rx = 5,
      ry = 5,
      children,
      fontSize,
      className,
      stroke = "none",
      strokeWidth = 1,
    } = props;
    const margin = asFloat(props.margin || 0);
    const maxX = props.maxX ? asFloat(props.maxX) : null;
    const maxY = props.maxY ? asFloat(props.maxY) : null;
    const padding = asFloat(props.padding || 0);
    const x = asFloat(props.x);
    const y = asFloat(props.y);
    const [bbox, setBBox] = React.useState<DOMRect | undefined>();
    const textRef = React.useRef<SVGTextElement | null>(null);

    React.useImperativeHandle(
      ref,
      () => ({
        x: bbox ? bbox.x - padding : 0,
        y: bbox ? bbox.y - padding / 2 : 0,
        width: bbox ? bbox.width + padding * 2 : 0,
        height: bbox ? bbox.height + padding : 0,
      }),
      [bbox, padding]
    );

    React.useEffect(() => {
      if (textRef && textRef.current) setBBox(textRef.current.getBBox());
    }, [x, y]);

    const { width, height } = bbox || { width: null, height: null };

    const xTransform =
      width && maxX && x + margin + width > maxX
        ? -(x + margin + width - maxX)
        : margin;

    const yTransform =
      height && maxY ? Math.min(maxY - (y + height), margin) : margin;

    return (
      <g
        transform={`translate(${xTransform}, ${yTransform})`}
        className={`text-with-background ${className || ""}`}
      >
        {bbox ? (
          <rect
            {...{ fill, rx, ry, stroke, strokeWidth }}
            x={bbox.x - padding}
            y={bbox.y - padding / 2.0}
            width={bbox.width + padding * 2}
            height={bbox.height + padding}
          />
        ) : null}

        <text ref={textRef} {...{ y, fontSize, x }}>
          {children}
        </text>
      </g>
    );
  }
);

export default TextWithBackground;
