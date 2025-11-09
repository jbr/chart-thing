# Coordinates

The Coordinates system maps data values to visual positions (pixels) and colors. It automatically calculates scales, handles data transformations, and makes scale information available to all child components.

## Overview

The `Coordinates` component:
1. Analyzes your data to find min/max values
2. Creates scale functions that map data values to pixel coordinates
3. Provides these scales through React Context
4. Optionally maps a third dimension to color

```tsx
import { Coordinates } from 'chart-thing'

<Coordinates x="temperature" y="humidity" color="pressure">
  {/* Components here can access xScale, yScale, colorScale */}
</Coordinates>
```

## Basic Usage

### Simple X/Y Mapping

```tsx
<Data value={data}>
  <SizedSVG>
    <Coordinates x="x" y="y">
      <XAxis />
      <YAxis />
      <PointCircles />
    </Coordinates>
  </SizedSVG>
</Data>
```

This creates:
- `xScale`: Maps `x` values to horizontal pixels (0 to width)
- `yScale`: Maps `y` values to vertical pixels (height to 0, inverted)

### Adding Color

```tsx
<Coordinates x="x" y="y" color="value">
  <PointCircles />  {/* Points are colored by 'value' */}
  <ColorLegend />   {/* Shows the color scale */}
</Coordinates>
```

## Scales

### What is a Scale?

A scale is both a function and an object with statistical properties:

```tsx
const xScale = useContext(CoordinateContext).xScale

// As a function: convert data value to pixel coordinate
const pixelX = xScale(dataPoint)  // e.g., 245

// As an object: access statistics
xScale.min      // Minimum data value
xScale.max      // Maximum data value
xScale.mean     // Average value (in pixel space)
xScale.range    // max - min
xScale.count    // Number of data points
```

### Y-Axis Inversion

The Y scale is automatically inverted so that higher values appear at the top of the chart (matching typical chart conventions). This happens in `buildScale` with the `invert` parameter in src/Coordinates.tsx:101.

## Accessor Patterns

### Using Object Keys

The simplest way - just pass the property name:

```tsx
<Coordinates x="timestamp" y="temperature" />
```

### Using Functions

For computed values or transformations:

```tsx
<Coordinates
  x={(d) => new Date(d.timestamp).getTime()}
  y={(d) => (d.temp_fahrenheit - 32) * 5/9}
  color={(d) => d.humidity / 100}
/>
```

### Mixed Approaches

You can mix and match:

```tsx
<Coordinates
  x="timestamp"
  y={(d) => d.value * conversionFactor}
  color="category"
/>
```

## Color Schemes

chart-thing uses D3's color scales. Specify a scheme with the `colorScheme` prop:

```tsx
<Coordinates x="x" y="y" color="value" colorScheme="viridis" />
```

### Available Schemes

**Sequential (single hue):**
- `viridis` (default for continuous data)
- `inferno`
- `magma`
- `plasma`
- `warm`
- `cool`
- `turbo` (default scheme)

**Diverging (two hues):**
- `RdBu` - Red to Blue
- `RdYlBu` - Red-Yellow-Blue
- `RdYlGn` - Red-Yellow-Green
- `BrBG` - Brown-Blue-Green
- `PRGn` - Purple-Red-Green
- `PiYG` - Pink-Yellow-Green
- `PuOr` - Purple-Orange
- `RdGy` - Red-Gray

**Cyclical:**
- `rainbow`
- `sinebow`

**Other:**
- `spectral`
- `cubehelixDefault`

See src/colors.ts:1-27 for the complete list.

### Custom Color Scales

Instead of using `color` + `colorScheme`, you can provide a custom `colorScale` function:

```tsx
<Coordinates
  x="x"
  y="y"
  colorScale={(d) => d.category === 'A' ? 'red' : 'blue'}
/>
```

This is useful for:
- Categorical coloring
- Custom color logic
- Using external color libraries

## Accessing Scales

### In Child Components

Use the `useContext` hook:

```tsx
import { useContext } from 'react'
import { CoordinateContext } from 'chart-thing'

function MyCustomLayer() {
  const { xScale, yScale, colorScale, width, height } = useContext(CoordinateContext)
  const data = useDataArray()

  return (
    <>
      {data.map((d, i) => (
        <circle
          key={i}
          cx={xScale(d)}
          cy={yScale(d)}
          r={3}
          fill={colorScale ? colorScale(d) : 'black'}
        />
      ))}
    </>
  )
}
```

### Render Props Pattern

The `Coordinates` component supports a render function as children:

```tsx
<Coordinates x="x" y="y">
  {({ xScale, yScale, width, height }) => (
    <rect width={width} height={height} fill="lightgray" />
  )}
</Coordinates>
```

## Display Labels

Customize axis labels with `xDisplayLabel` and `yDisplayLabel`:

```tsx
<Coordinates
  x="temp"
  y="humidity"
  xDisplayLabel="Temperature (°C)"
  yDisplayLabel="Relative Humidity (%)"
/>
```

These labels are used by `XAxis`, `YAxis`, and `Title` components.

If you don't provide display labels, chart-thing will:
1. Check the [Dimensions](dimensions.md) context for `displayLabel`
2. Fall back to the attribute name with camelCase converted to spaces

## Scale Statistics

Each scale includes computed statistics:

```tsx
const { xScale } = useContext(CoordinateContext)

xScale.min      // Minimum value in the data
xScale.max      // Maximum value in the data
xScale.range    // max - min
xScale.mean     // Average value
xScale.median   // Median value
xScale.stdev    // Standard deviation
xScale.variance // Variance
xScale.count    // Number of data points
xScale.sum      // Sum of all values
xScale.naCount  // Number of NA/null/undefined values
```

These are calculated by `attrStats` in src/common.ts:62-105.

## Under the Hood

### Scale Creation

When `Coordinates` renders, it:

1. Reads data from `DataContext` using `useDataArray`
2. Calls `attrScale` for each dimension (x, y, color) - src/common.ts:125-138
3. `attrScale` computes statistics with `attrStats`
4. `buildScale` maps the normalized scale to pixel space - src/common.ts:140-166
5. Scales are memoized and only recalculate when data changes

### Padding and Ranges

By default, scales use the exact min/max from your data. You can override this with [Dimensions](dimensions.md):

```tsx
const dimensions = {
  temperature: {
    stats: {
      min: 0,    // Force minimum
      max: 100,  // Force maximum
    }
  }
}

<Dimensions value={dimensions}>
  <Coordinates x="temperature" y="humidity">
    {/* temperature scale will always go from 0-100 */}
  </Coordinates>
</Dimensions>
```

### Color Scale Details

The color scale creation (src/Coordinates.tsx:17-59):

1. If `colorScale` is provided, use it directly
2. If `color` is provided:
   - Compute stats for the color dimension
   - Normalize values to 0-1
   - Map through D3's interpolator for the chosen `colorScheme`
3. Otherwise, return a constant color (black by default)

## Advanced Patterns

### Multiple Coordinate Systems

You can nest `Coordinates` to create multiple scales:

```tsx
<Coordinates x="timestamp" y="temperature">
  <Path />  {/* Uses outer coordinates */}

  <Coordinates x="timestamp" y="humidity">
    <Path stroke="blue" />  {/* Uses inner coordinates */}
  </Coordinates>
</Coordinates>
```

This is useful for:
- Dual-axis charts
- Overlaying different measurements
- Small multiples

### Shared Scales Across Charts

Define coordinates once and reuse:

```tsx
<SizedSVG>
  <Coordinates x="x" y="y">
    {(coords) => (
      <>
        <XAxis />
        <YAxis />

        <Data value={dataset1}>
          <g opacity={0.5}>
            <PointCircles />
          </g>
        </Data>

        <Data value={dataset2}>
          <g opacity={0.5}>
            <PointCircles />
          </g>
        </Data>
      </>
    )}
  </Coordinates>
</SizedSVG>
```

Both datasets share the same coordinate system.

### Custom Scale Logic

For full control, you can bypass `Coordinates` and provide scales directly:

```tsx
import { CoordinateContext } from 'chart-thing'

const customContext = {
  width: 500,
  height: 300,
  xScale: (d) => d.customX * 10,
  yScale: (d) => 300 - d.customY * 5,
  colorScale: (d) => d.isActive ? 'green' : 'red',
}

<CoordinateContext.Provider value={customContext}>
  {/* Your components */}
</CoordinateContext.Provider>
```

## TypeScript

Coordinates is fully typed:

```tsx
interface DataPoint {
  x: number
  y: number
  category: string
}

<Coordinates<DataPoint>
  x="x"
  y="y"
  color={(d) => d.category === 'A' ? 0 : 1}  // Type-safe!
/>
```

The accessor functions receive properly typed data.

## Component Reference

### Coordinates

**Props:**
- `x: TypedAccessor<T, number>` - X-axis data accessor (required)
- `y: TypedAccessor<T, number>` - Y-axis data accessor (required)
- `color?: NumericAttribute<T>` - Color dimension accessor
- `colorScale?: (datum: T) => string` - Custom color function
- `colorScheme?: ColorScheme` - D3 color scheme name (default: "turbo")
- `xDisplayLabel?: string` - Custom X-axis label
- `yDisplayLabel?: string` - Custom Y-axis label
- `children: React.ReactNode | ((context: CoordinateContextValue) => React.ReactNode)` - Child components or render function

**Context Provided:**
- `width: number` - Chart width in pixels
- `height: number` - Chart height in pixels
- `xScale: Scale<T>` - X-axis scale function
- `yScale: Scale<T>` - Y-axis scale function
- `xStatScale: Scale<T>` - Normalized X scale (0-1)
- `yStatScale: Scale<T>` - Normalized Y scale (0-1)
- `xStatValue: (datum: T) => any` - Raw X value accessor
- `yStatValue: (datum: T) => any` - Raw Y value accessor
- `colorScale?: (datum: T) => string` - Color mapping function
- `colorStatScale?: Scale<T>` - Normalized color scale (0-1)
- `colorStatValue?: (datum: T) => number | null` - Raw color value
- `colorScheme?: ColorScheme` - Active color scheme name
- `xDisplayLabel?: string` - X-axis label
- `yDisplayLabel?: string` - Y-axis label

## Performance

### Memoization

Coordinates uses `React.useMemo` extensively to avoid recalculating scales on every render. Scales only recompute when:
- Data changes
- Dimension definitions change
- Width/height changes

### Large Datasets

For datasets with 10,000+ points, scale calculation is still fast (typically <10ms). The bottleneck is usually rendering, not scaling.

## Common Patterns

### Logarithmic Scales

```tsx
<Coordinates
  x={(d) => Math.log10(d.value)}
  y="measurement"
  xDisplayLabel="Value (log scale)"
/>
```

### Time Series

```tsx
<Coordinates
  x={(d) => new Date(d.timestamp).getTime()}
  y="value"
  xDisplayLabel="Time"
/>
```

### Normalized Values

```tsx
<Coordinates
  x={(d) => d.value / d.total}  // Percentage
  y="score"
/>
```

### Categorical X-Axis

```tsx
const categories = ['A', 'B', 'C', 'D']
<Coordinates
  x={(d) => categories.indexOf(d.category)}
  y="value"
/>
```

## Examples

### Scatter with Regression Line

```tsx
<Coordinates x="x" y="y">
  <PointCircles />
  <LinearRegressionStat>
    <Path stroke="red" strokeWidth={2} />
  </LinearRegressionStat>
  <XAxis />
  <YAxis />
</Coordinates>
```

### Grouped Line Chart

```tsx
<Grouped by="category">
  <Coordinates x="timestamp" y="value">
    <Path />
  </Coordinates>
</Grouped>
```

Each group gets the same coordinate system but different data.

### Heat Map

```tsx
<Coordinates x="x" y="y" color="density" colorScheme="viridis">
  <Tiles />
  <ColorLegend />
</Coordinates>
```
