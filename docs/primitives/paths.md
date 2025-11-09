# Paths

Low-level path components for custom line visualizations.

## Overview

- **Path** - Simple SVG path connecting data points
- **FilledPath** - Area chart with gradient fill
- **LineSegments** - Advanced line rendering with gradients and breaks

```tsx
import { Path, FilledPath, LineSegments } from 'chart-thing'
```

## Path

Basic SVG path that connects data points with lines.

### Usage

```tsx
<Data value={data}>
  <Coordinates x="x" y="y">
    <Path />
  </Coordinates>
</Data>
```

### Features

- Connects all data points with straight lines
- Uses color from `colorScale` for stroke
- No fill (creates a line, not an area)
- Minimal implementation for custom use cases

### Implementation

```tsx
const d = points.map((p) => `${xScale(p)}, ${yScale(p)}`).join(" L ")
return <path d={`m ${d}`} stroke={colorScale(points[0])} fill="none" />
```

See src/Path.tsx.

### Props

Path accepts standard SVG path props:

```tsx
<Path stroke="red" strokeWidth={3} strokeDasharray="5,5" opacity={0.7} />
```

## FilledPath

Area chart with gradient fill from top to bottom.

### Usage

```tsx
<Data value={data}>
  <Coordinates x="x" y="y" color="value">
    <FilledPath fill="blue" opacity={0.3} />
  </Coordinates>
</Data>
```

### Features

- Fills area between line and bottom of chart
- Creates horizontal gradient using color scale
- Closes path at bottom-right and bottom-left corners
- Returns to starting point

### Implementation

Creates a polygon:
1. Traces the data path
2. Goes to bottom-right `(width, height)`
3. Goes to bottom-left `(0, height)`
4. Returns to start

With gradient fill along X-axis based on `colorScale`.

See src/FilledPath.tsx:20-43.

### Props

Accepts SVG path attributes:

```tsx
<FilledPath fill="rgba(0,0,255,0.3)" opacity={0.5} />
```

Note: If using a `colorScale`, the fill will be a gradient. Passing `fill` as a prop might be ignored in favor of the gradient.

## LineSegments

Advanced line rendering used by `LineChart`. Features:

- Smooth color gradients along the line
- Rounded corners
- Line breaks (continuity control)
- Point compression for performance

### Usage

```tsx
<Coordinates x="x" y="y" color="temperature">
  <LineSegments
    strokeWidth={3}
    resolution={5}
    continuity={(d) => d.valid}
    outline
  />
</Coordinates>
```

### Props

**resolution (optional)**
- Minimum pixel distance between points
- Higher = more compression
- **Type:** `number`
- **Default:** `0`

**strokeWidth (optional)**
- Line thickness in pixels
- **Type:** `number`
- **Default:** `5`

**continuity (optional)**
- Controls where line breaks
- **Type:** `TypedAccessor<T, boolean>`

**colorResolution (optional)**
- Minimum color difference for new gradient
- **Type:** `number`
- **Default:** `5`

**outline (optional)**
- Add dark outline around line
- **Type:** `boolean`
- **Default:** `false`

### How It Works

1. **Compression:** Removes points based on distance and angle
2. **Gradients:** Creates SVG linear gradients for color transitions
3. **Rectangles:** Uses rotated rectangles instead of paths
4. **Continuity:** Breaks line where `continuity` returns false

See src/LineSegments.tsx for full implementation.

### Color Gradients

When adjacent points have different colors:

```tsx
<Coordinates x="x" y="y" color="speed">
  <LineSegments strokeWidth={4} />
  {/* Line color transitions smoothly with speed changes */}
</Coordinates>
```

SVG gradients are automatically created and applied.

## Examples

### Simple Line

```tsx
<Data value={data}>
  <Coordinates x="x" y="y">
    <Path stroke="black" strokeWidth={2} />
  </Coordinates>
</Data>
```

### Area Chart

```tsx
<Data value={timeSeries}>
  <Coordinates x="timestamp" y="value" color="value">
    <FilledPath opacity={0.6} />
    <Path stroke="steelblue" strokeWidth={2} />
  </Coordinates>
</Data>
```

### Gradient Line

```tsx
<Data value={route}>
  <Coordinates x="longitude" y="latitude" color="elevation">
    <LineSegments strokeWidth={4} />
  </Coordinates>
</Data>
```

### Dashed Line

```tsx
<Data value={data}>
  <Coordinates x="x" y="y">
    <Path stroke="red" strokeWidth={2} strokeDasharray="10,5" />
  </Coordinates>
</Data>
```

### Line with Breaks

```tsx
<Data value={data}>
  <Coordinates x="x" y="y">
    <LineSegments
      strokeWidth={3}
      continuity={(d) => d.signalQuality > 0.5}
    />
  </Coordinates>
</Data>
```

Line breaks wherever signal quality drops.

### Regression Line

```tsx
function RegressionLine() {
  const data = useDataArray()
  const { m, b } = useLinearRegression()
  const { xStatValue } = useContext(CoordinateContext)

  const regressionData = data.map(d => ({
    ...d,
    yPredicted: m * xStatValue(d) + b,
  }))

  return (
    <Data value={regressionData}>
      <Coordinates x={x} y="yPredicted">
        <Path stroke="red" strokeWidth={2} strokeDasharray="8,4" />
      </Coordinates>
    </Data>
  )
}
```

## Performance

**Path / FilledPath:**
- Simple concatenation of points
- Fast for any dataset size
- No compression or optimization

**LineSegments:**
- Compression reduces points for performance
- Works well with 100,000+ points
- Gradient creation adds minimal overhead

## TypeScript

```tsx
interface DataPoint {
  x: number
  y: number
  value: number
}

<Data value={data}>
  <Coordinates<DataPoint> x="x" y="y">
    <Path />
  </Coordinates>
</Data>
```

## Related Components

- [LineChart](../charts/line-chart.md) - Uses LineSegments
- [SparkLine](../charts/sparkline.md) - Uses LineSegments
- [LinearRegressionStat](../statistical-layers/linear-regression.md) - Often rendered with Path
- [ConvolutionalSmoother](../statistical-layers/convolutional-smoother.md) - Smoothed lines
