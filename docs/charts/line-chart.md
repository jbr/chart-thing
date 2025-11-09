# Line Chart

Line charts visualize continuous data by connecting points with lines, commonly used for time series and ordered data.

## Overview

The `LineChart` component combines:
- SizedSVG (responsive container)
- Coordinates (scale creation)
- XAxis, YAxis, Title (visual elements)
- ColorLegend (when using color)
- LineSegments (the actual lines)
- Hover support (optional)

```tsx
import { LineChart, Data } from 'chart-thing'

<Data value={timeSeries}>
  <LineChart x="timestamp" y="value" />
</Data>
```

## Basic Usage

### Simple Line Chart

```tsx
const data = [
  { x: 0, y: 1 },
  { x: 1, y: 3 },
  { x: 2, y: 2 },
  { x: 3, y: 5 },
  { x: 4, y: 4 },
]

<div style={{ width: '800px', height: '600px' }}>
  <Data value={data}>
    <LineChart x="x" y="y" />
  </Data>
</div>
```

### Time Series

```tsx
const timeSeries = [
  { timestamp: 1609459200, value: 100 },
  { timestamp: 1609545600, value: 105 },
  { timestamp: 1609632000, value: 103 },
  { timestamp: 1609718400, value: 110 },
]

<Data value={timeSeries}>
  <LineChart
    x={(d) => new Date(d.timestamp * 1000).getTime()}
    y="value"
  />
</Data>
```

### With Color Encoding

```tsx
<Data value={data}>
  <LineChart x="x" y="y" color="temperature" colorScheme="viridis" />
</Data>
```

The line color changes along its length based on the `temperature` value.

## Props

### x (required)

X-axis data accessor:

```tsx
// Using object key
<LineChart x="timestamp" y="value" />

// Using function for dates
<LineChart x={(d) => new Date(d.date).getTime()} y="value" />
```

**Type:** `NumericAttribute<T>` (string key or function that returns number)

### y (required)

Y-axis data accessor:

```tsx
<LineChart x="x" y="y" />
```

**Type:** `NumericAttribute<T>`

### color (optional)

Color dimension - creates a gradient along the line:

```tsx
<LineChart x="time" y="temperature" color="humidity" />
```

The line will transition from one color to another based on humidity values.

**Type:** `NumericAttribute<T>`

### colorScheme (optional)

D3 color scale for the gradient:

```tsx
<LineChart x="x" y="y" color="z" colorScheme="turbo" />
```

**Default:** `"turbo"`

### strokeWidth (optional)

Line thickness in pixels:

```tsx
<LineChart x="x" y="y" strokeWidth={3} />
```

**Type:** `number`
**Default:** `5`

### continuity (optional)

Controls whether the line is continuous or broken at certain points:

```tsx
<LineChart
  x="x"
  y="y"
  continuity={(d) => d.valid}
/>
```

When `continuity` returns `false`, the line breaks at that point.

**Type:** `TypedAccessor<T, boolean>`

**Use cases:**
- Break lines where data is missing or invalid
- Show discontinuities in data
- Separate distinct segments

### invertY (optional)

Inverts the Y-axis scale:

```tsx
<LineChart x="x" y="depth" invertY />
```

**Type:** `boolean`
**Default:** `false`

**Use case:** Depth, altitude, or other values where larger numbers should appear lower.

### xLabel / yLabel (optional)

Custom axis labels:

```tsx
<LineChart
  x="timestamp"
  y="temperature"
  xLabel="Time (UTC)"
  yLabel="Temperature (°C)"
/>
```

**Type:** `string`

### hoverLabel (optional)

Function to generate hover label text:

```tsx
<LineChart
  x="timestamp"
  y="value"
  hoverLabel={(d) => `${new Date(d.timestamp).toLocaleDateString()}: ${d.value}`}
/>
```

**Type:** `HoverLabel<T>` - `(datum: T) => string`

### children (optional)

Additional components to render inside the chart:

```tsx
<LineChart x="x" y="y">
  <Path stroke="red" strokeDasharray="5,5" />  {/* Overlay */}
</LineChart>
```

**Type:** `React.ReactNode`

## Line Rendering

### How LineSegments Works

The underlying `LineSegments` component uses a sophisticated rendering approach (src/LineSegments.tsx):

1. **Compression:** Reduces points based on distance and angle changes for performance
2. **Gradients:** Creates SVG linear gradients for color transitions
3. **Rectangles:** Uses rotated rectangles instead of paths for smoother rendering
4. **Continuity:** Handles breaks in the line

This approach provides:
- Smooth color gradients along the line
- Better performance for large datasets
- Rounded corners at sharp angles
- Clean discontinuities

### Resolution

Points are filtered based on distance and angle:

- **On-screen points:** Kept if distance ≥ `resolution` or angle change ≥ 5°
- **Off-screen points:** More aggressive filtering (resolution = 50px, angle = 20°)

This dramatically improves performance for dense data while maintaining visual quality.

### Color Gradients

When adjacent points have different colors, SVG gradients are created automatically:

```tsx
<LineChart x="x" y="y" color="temperature" colorScheme="viridis" />
```

The line smoothly transitions from color to color based on temperature values.

## Examples

### Multiple Series with Grouped

```tsx
<Data value={data}>
  <Grouped by="category">
    <LineChart x="x" y="y" />
  </Grouped>
</Data>
```

Each category gets its own line with a different color.

### Stock Price Chart

```tsx
<Data value={stockData}>
  <LineChart
    x={(d) => new Date(d.date).getTime()}
    y="close"
    color="volume"
    colorScheme="RdYlGn"
    strokeWidth={2}
    hoverLabel={(d) => `${d.date}: $${d.close.toFixed(2)} (Vol: ${d.volume})`}
  />
</Data>
```

### With Confidence Band

```tsx
<LineChart x="x" y="y">
  <ConvolutionalSmoother x="x" y="y" bandwidth={0.2}>
    <FilledPath fill="blue" opacity={0.2} />
  </ConvolutionalSmoother>
</LineChart>
```

### Broken Line (Discontinuities)

```tsx
<Data value={data}>
  <LineChart
    x="timestamp"
    y="signal"
    continuity={(d) => d.signalQuality > 0.5}
  />
</Data>
```

The line breaks wherever signal quality drops below 0.5.

### Temperature vs Humidity Over Time

```tsx
<Data value={weatherData}>
  <LineChart
    x={(d) => new Date(d.timestamp).getTime()}
    y="temperature"
    color="humidity"
    colorScheme="RdBu"
    xLabel="Time"
    yLabel="Temperature (°C)"
  />
</Data>
```

Line color represents humidity, creating a bivariate visualization.

### Comparing Before/After

```tsx
<Data value={measurements}>
  <LineChart x="position" y="before" strokeWidth={2} />
  <LineChart x="position" y="after" strokeWidth={2} />
</Data>
```

### With Statistical Overlay

```tsx
<LineChart x="x" y="y" strokeWidth={2}>
  <LinearRegressionStat x="x" y="y">
    <Path stroke="red" strokeWidth={3} strokeDasharray="8,4" />
  </LinearRegressionStat>
</LineChart>
```

## LineSegments Component

The low-level component that renders the lines:

```tsx
import { LineSegments } from 'chart-thing'

<Coordinates x="x" y="y" color="value">
  <LineSegments
    resolution={1}
    strokeWidth={5}
    continuity={(d) => d.continuous}
    colorResolution={5}
    outline={false}
  />
</Coordinates>
```

### LineSegments Props

**resolution (optional)**
- Minimum distance between points (pixels)
- Default: `0` (no filtering)
- Higher values = fewer points = better performance

**strokeWidth (optional)**
- Line thickness in pixels
- Default: `5`

**continuity (optional)**
- Accessor returning boolean for line continuity
- Default: `undefined` (always continuous)

**colorResolution (optional)**
- Minimum color difference to create new gradient
- Default: `5`
- Higher values = fewer gradients

**outline (optional)**
- Add dark outline around the line
- Default: `false`
- Useful for visibility on light backgrounds

## Performance

### Large Datasets

LineSegments is optimized for large datasets:

1. **Point compression:** Removes redundant points based on distance and angle
2. **Off-screen filtering:** Aggressive filtering for off-screen segments
3. **Memoization:** Results are memoized to prevent re-computation

Tested with datasets of 100,000+ points with good performance.

### Optimization Tips

For very dense data:

```tsx
// Increase resolution to filter more points
<LineSegments resolution={5} />

// Reduce color complexity
<LineSegments colorResolution={20} />

// Use simpler data structure
const simplified = data.filter((_, i) => i % 10 === 0)
```

## TypeScript

Full type safety:

```tsx
interface DataPoint {
  timestamp: number
  value: number
  quality: number
}

<Data value={data}>
  <LineChart<DataPoint>
    x="timestamp"
    y="value"
    color="quality"
    continuity={(d) => d.quality > 0.8}
    hoverLabel={(d) => `Value: ${d.value}`}
  />
</Data>
```

## Comparison with Other Chart Types

**Use LineChart when:**
- Data is ordered (time series, sequential measurements)
- You want to show trends over a continuous dimension
- Points are densely packed

**Consider alternatives:**
- **Scatter** - For unordered data or to see individual points
- **RibbonChart** - For ranges or confidence intervals
- **Path** - For custom line rendering

## Advanced Patterns

### Multi-Axis with Different Scales

```tsx
<SizedSVG>
  <Coordinates x="timestamp" y="temperature">
    <XAxis />
    <YAxis />
    <LineSegments strokeWidth={3} />

    <Coordinates x="timestamp" y="humidity">
      <LineSegments strokeWidth={3} />
    </Coordinates>
  </Coordinates>
</SizedSVG>
```

Each line uses its own Y-scale.

### Small Multiples

```tsx
{categories.map(category => (
  <div key={category} style={{ width: '300px', height: '200px' }}>
    <Data value={data}>
      <Subset filter={(d) => d.category === category}>
        <LineChart x="x" y="y" />
      </Subset>
    </Data>
  </div>
))}
```

### Sparkline

```tsx
<div style={{ width: '100px', height: '30px', display: 'inline-block' }}>
  <Data value={data}>
    <SizedSVG leftPad={0} rightPad={0} topPad={0} bottomPad={0}>
      <Coordinates x="x" y="y">
        <LineSegments strokeWidth={2} resolution={0} />
      </Coordinates>
    </SizedSVG>
  </Data>
</div>
```

Or use the dedicated [SparkLine](sparkline.md) component.

### Stepped Line

For a stepped appearance, increase point density and use low resolution:

```tsx
// Interpolate extra points
const stepped = data.flatMap((d, i, arr) =>
  i < arr.length - 1 ? [d, { x: arr[i+1].x, y: d.y }] : [d]
)

<Data value={stepped}>
  <LineChart x="x" y="y" strokeWidth={3} />
</Data>
```

### Gradient Along X-Axis

```tsx
// Create x-based color
<LineChart
  x="x"
  y="y"
  color={(d) => d.x}  // Color changes with x position
  colorScheme="rainbow"
/>
```

## Component Structure

Internally, `LineChart` creates:

```tsx
<SizedSVG onHover={setHover}>
  <Coordinates x={x} y={y} color={color} colorScheme={colorScheme} invertY={invertY}>
    <Title />
    <XAxis />
    <YAxis />
    <ColorLegend top right />
    <LineSegments resolution={1} continuity={continuity} strokeWidth={strokeWidth} />
    {children}
    <Hover hover={hover} hoverLabel={hoverLabel} />
  </Coordinates>
</SizedSVG>
```

See src/LineChart.tsx:28-69 for the implementation.

## Troubleshooting

### Line appears jagged

**Problem:** Line has visible segments instead of smooth curve.

**Solution:** Increase strokeWidth for rounded corners:

```tsx
<LineChart x="x" y="y" strokeWidth={8} />
```

The LineSegments component uses rounded rectangles, which smooth out better with thicker lines.

### Line breaks unexpectedly

**Problem:** Line has gaps where there shouldn't be any.

**Solution:** Check for null/NaN values in your data:

```tsx
// Filter invalid points
const clean = data.filter(d =>
  typeof d.x === 'number' &&
  typeof d.y === 'number' &&
  Number.isFinite(d.x) &&
  Number.isFinite(d.y)
)

<Data value={clean}>
  <LineChart x="x" y="y" />
</Data>
```

### Poor performance with many points

**Problem:** Rendering is slow with thousands of points.

**Solution:** Increase resolution to filter points:

```tsx
<LineSegments resolution={5} />  // Filter points closer than 5px
```

Or use the LineChart directly which sets `resolution={1}` by default.

## Related Components

- [Scatter](scatter.md) - Show individual points
- [RibbonChart](ribbon-chart.md) - Area charts with upper/lower bounds
- [SparkLine](sparkline.md) - Minimal inline charts
- [Path](../primitives/paths.md) - Low-level path rendering
- [ConvolutionalSmoother](../statistical-layers/convolutional-smoother.md) - Smooth noisy data
- [LinearRegressionStat](../statistical-layers/linear-regression.md) - Trend lines
