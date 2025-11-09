# Scatter Plot

Scatter plots visualize the relationship between two continuous variables, with optional color encoding for a third dimension.

## Overview

The `Scatter` component is a high-level convenience wrapper that combines:
- SizedSVG (responsive container)
- Coordinates (scale creation)
- XAxis, YAxis, Title (visual elements)
- ColorLegend (when using color)
- PointCircles (the actual points)
- Hover support (optional)

```tsx
import { Scatter, Data } from 'chart-thing'

<Data value={data}>
  <Scatter x="temperature" y="humidity" />
</Data>
```

## Basic Usage

### Simple Scatter Plot

```tsx
const data = [
  { x: 1, y: 2 },
  { x: 2, y: 4 },
  { x: 3, y: 3 },
  { x: 4, y: 5 },
]

<div style={{ width: '800px', height: '600px' }}>
  <Data value={data}>
    <Scatter x="x" y="y" />
  </Data>
</div>
```

### With Color Encoding

```tsx
const data = [
  { x: 1, y: 2, value: 10 },
  { x: 2, y: 4, value: 20 },
  { x: 3, y: 3, value: 15 },
]

<Data value={data}>
  <Scatter x="x" y="y" color="value" colorScheme="viridis" />
</Data>
```

Points are colored according to the `value` attribute using the viridis color scale.

## Point Rendering

### Adaptive Opacity

Points automatically adjust opacity based on dataset size to prevent overplotting:

- **< 1,000 points:** opacity = 1.0
- **1,000 - 5,000 points:** opacity = 0.75
- **5,000 - 50,000 points:** opacity = 0.5
- **> 50,000 points:** opacity = 0.25

See `opacityForSize` in src/Scatter.tsx:15-25.

### Adaptive Radius

Point size also adapts to dataset size:

- **< 5,000 points:** radius = 2px
- **5,000 - 10,000 points:** radius = 1.5px
- **> 10,000 points:** radius = 1px

See `radiusForSize` in src/Scatter.tsx:27-35.

This ensures large datasets remain readable without manual configuration.

## Props

### x (required)

X-axis data accessor:

```tsx
// Using object key
<Scatter x="temperature" y="humidity" />

// Using function
<Scatter x={(d) => d.temp * 1.8 + 32} y="humidity" />
```

**Type:** `TypedAccessor<T, number>` (string key or function)

### y (required)

Y-axis data accessor:

```tsx
<Scatter x="x" y="y" />
```

**Type:** `TypedAccessor<T, number>`

### color (optional)

Color dimension accessor:

```tsx
// Encode a third variable as color
<Scatter x="x" y="y" color="z" />

// Using a function
<Scatter
  x="x"
  y="y"
  color={(d) => d.value1 - d.value2}
/>
```

**Type:** `NumericAttribute<T>`

### colorScheme (optional)

D3 color scale to use:

```tsx
<Scatter x="x" y="y" color="value" colorScheme="turbo" />
```

**Available schemes:** See [Coordinates documentation](../core-concepts/coordinates.md#color-schemes)

**Default:** `"turbo"`

### hoverLabel (optional)

Function to generate hover label text:

```tsx
<Scatter
  x="temperature"
  y="humidity"
  hoverLabel={(d) => `${d.temperature}°C, ${d.humidity}%`}
/>
```

**Type:** `HoverLabel<T>` - `(datum: T) => string`

### children (optional)

Additional components to render inside the chart:

```tsx
<Scatter x="x" y="y">
  <LinearRegressionStat x="x" y="y">
    <Path stroke="red" strokeWidth={2} />
  </LinearRegressionStat>
</Scatter>
```

**Type:** `React.ReactNode`

## Customization

### Adding Layers

You can add statistical layers or custom elements as children:

```tsx
<Scatter x="x" y="y">
  {/* Add a regression line */}
  <LinearRegressionStat x="x" y="y">
    <Path stroke="blue" strokeWidth={2} />
  </LinearRegressionStat>

  {/* Add a custom annotation */}
  <circle cx={100} cy={100} r={10} fill="red" stroke="black" />
  <text x={100} y={120}>Outlier</text>
</Scatter>
```

### Using PointCircles Directly

For more control, use the lower-level `PointCircles` component:

```tsx
import { SizedSVG, Coordinates, PointCircles, XAxis, YAxis } from 'chart-thing'

<Data value={data}>
  <SizedSVG>
    <Coordinates x="x" y="y" color="value">
      <XAxis />
      <YAxis />
      <g opacity={0.7}>
        <PointCircles />
      </g>
    </Coordinates>
  </SizedSVG>
</Data>
```

This gives you full control over positioning and styling.

## Examples

### Scatter with Hover

```tsx
<Scatter
  x="temperature"
  y="humidity"
  color="pressure"
  colorScheme="viridis"
  hoverLabel={(d) =>
    `Temp: ${d.temperature.toFixed(1)}°C\n` +
    `Humidity: ${d.humidity.toFixed(0)}%\n` +
    `Pressure: ${d.pressure.toFixed(0)} hPa`
  }
/>
```

### Multiple Groups

```tsx
<Data value={data}>
  <Grouped by="species">
    <Scatter x="sepalLength" y="sepalWidth" />
  </Grouped>
</Data>
```

Each species gets its own color automatically.

### Filtered Data

```tsx
<Data value={data}>
  <Subset filter={(d) => d.quality > 5}>
    <Scatter x="alcohol" y="density" color="quality" />
  </Subset>
</Data>
```

Only shows high-quality samples.

### With Regression Line

```tsx
<Scatter x="x" y="y">
  <LinearRegressionStat x="x" y="y">
    <Path stroke="red" strokeWidth={2} strokeDasharray="5,5" />
  </LinearRegressionStat>
</Scatter>
```

### With Confidence Band

```tsx
<Scatter x="x" y="y">
  <ConvolutionalSmoother x="x" y="y" bandwidth={0.2}>
    <FilledPath fill="blue" opacity={0.2} />
  </ConvolutionalSmoother>
</Scatter>
```

### Large Dataset

```tsx
// 50,000 points - automatic opacity and size adjustment
const data = Array.from({ length: 50000 }, (_, i) => ({
  x: Math.random() * 100,
  y: Math.random() * 100,
}))

<Data value={data}>
  <Scatter x="x" y="y" />
</Data>
```

Points will automatically use radius=1px and opacity=0.25.

### Custom Point Colors

For categorical coloring, use `Grouped`:

```tsx
<Grouped by="category">
  <Scatter x="x" y="y" />
</Grouped>
```

Or provide a custom color scale:

```tsx
<SizedSVG>
  <Coordinates
    x="x"
    y="y"
    colorScale={(d) => d.category === 'A' ? 'red' : 'blue'}
  >
    <PointCircles />
  </Coordinates>
</SizedSVG>
```

### Time Series Scatter

```tsx
<Scatter
  x={(d) => new Date(d.timestamp).getTime()}
  y="value"
  color="category"
/>
```

### Log-Scale

```tsx
<Scatter
  x={(d) => Math.log10(d.income)}
  y={(d) => Math.log10(d.spending)}
/>
```

## PointCircles Component

The underlying component that renders the circles:

```tsx
import { PointCircles } from 'chart-thing'

<Coordinates x="x" y="y" color="value">
  <PointCircles />
</Coordinates>
```

`PointCircles` reads data from DataContext and scales from CoordinateContext to render circles at the appropriate positions.

**Implementation:** See src/Scatter.tsx:37-59

It:
1. Gets data via `useDataArray`
2. Gets scales via `useContext(CoordinateContext)`
3. Maps each data point to a circle with:
   - `cx={xScale(p)}`
   - `cy={yScale(p)}`
   - `fill={colorScale ? colorScale(p) : 'black'}`
   - Adaptive radius and opacity based on data size

## Performance

### Large Datasets

For very large datasets (>100,000 points):

1. **Use binning:** `BinStats2d` creates a heatmap instead of individual points
2. **Sample data:** Reduce to a representative sample
3. **WebGL:** Consider a different library (D3, Plotly) that uses WebGL for millions of points

Scatter works well up to ~100,000 points in modern browsers.

### Hover Performance

With many points, hover detection can be slow. The hover implementation checks distance to every point. For better performance with large datasets, disable hover:

```tsx
// Don't pass hoverLabel
<Scatter x="x" y="y" />
```

## TypeScript

Full TypeScript support:

```tsx
interface DataPoint {
  temperature: number
  humidity: number
  pressure: number
  location: string
}

<Data value={data}>
  <Scatter<DataPoint>
    x="temperature"
    y="humidity"
    color="pressure"
    hoverLabel={(d) => `${d.location}: ${d.temperature}°C`}
  />
</Data>
```

## Comparison with Other Chart Types

**Use Scatter when:**
- You want to see the relationship between two continuous variables
- You have individual data points (not aggregated)
- You want to identify patterns, correlations, or outliers

**Consider alternatives:**
- **LineChart** - For time series or ordered data
- **HeatMap** - For very large datasets or 2D density
- **BinStats2d** - For binned/aggregated data

## Common Patterns

### Correlation Analysis

```tsx
<Scatter
  x="variable1"
  y="variable2"
  color="variable3"
  colorScheme="RdBu"
>
  <LinearRegressionStat x="variable1" y="variable2">
    <Path stroke="black" strokeWidth={2} />
  </LinearRegressionStat>
</Scatter>
```

### Outlier Detection

```tsx
<Scatter x="x" y="y">
  <SigmaFilter x="x" y="y" sigmas={2}>
    {/* Filtered points shown normally */}
    <PointCircles />
  </SigmaFilter>

  {/* Outliers shown in red */}
  <SigmaFilter x="x" y="y" sigmas={2} invert>
    <Coordinates colorScale={() => 'red'}>
      <PointCircles />
    </Coordinates>
  </SigmaFilter>
</Scatter>
```

### Multi-Class Classification

```tsx
<Data value={data}>
  <Grouped by="predictedClass">
    <Scatter x="feature1" y="feature2" />
  </Grouped>
</Data>
```

Each class gets a different color, making decision boundaries visible.

## Component Structure

The `Scatter` component internally creates:

```tsx
<SizedSVG onHover={setHover}>
  <Coordinates x={x} y={y} color={color} colorScheme={colorScheme}>
    <ColorLegend top right />
    <Title />
    <XAxis />
    <YAxis />
    <g>{children}</g>
    <g>
      <PointCircles />
    </g>
    <Hover hover={hover} hoverLabel={hoverLabel} />
  </Coordinates>
</SizedSVG>
```

See src/Scatter.tsx:70-95 for the implementation.

## Related Components

- [LineChart](line-chart.md) - Connect points with lines
- [HeatMap](heatmap.md) - 2D density visualization
- [LinearRegressionStat](../statistical-layers/linear-regression.md) - Add trend lines
- [BinStats2d](../statistical-layers/bin-stats.md) - Aggregate into bins
- [Hover](../visual-elements/hover.md) - Interactive hover labels
