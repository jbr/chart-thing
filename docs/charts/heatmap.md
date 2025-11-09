# Heat Map

Heat maps visualize 2D distributions or densities using color-coded cells.

## Overview

The `HeatMap` component uses `BinStats2d` to create a 2D grid of colored rectangles representing data density or other summary statistics.

```tsx
import { HeatMap, Data } from 'chart-thing'

<Data value={data}>
  <HeatMap
    x="longitude"
    y="latitude"
    color="temperature"
    stat="mean"
    colorScheme="viridis"
  />
</Data>
```

## Basic Usage

### Density Heat Map

```tsx
const data = Array.from({ length: 5000 }, () => ({
  x: Math.random() * 100,
  y: Math.random() * 100,
}))

<div style={{ width: '800px', height: '600px' }}>
  <Data value={data}>
    <HeatMap
      x="x"
      y="y"
      color="x"  // Use x for color
      stat="count"  // Show point density
      colorScheme="plasma"
    />
  </Data>
</div>
```

### 2D Summary Statistics

```tsx
<Data value={spatialData}>
  <HeatMap
    x="longitude"
    y="latitude"
    color="temperature"
    stat="mean"  // Show average temperature per cell
    colorScheme="RdYlBu"
  />
</Data>
```

## Props

### x (required)

X-axis dimension to bin:

```tsx
<HeatMap x="longitude" y="latitude" color="value" stat="count" />
```

**Type:** `NumericAttribute<T>`

### y (required)

Y-axis dimension to bin:

```tsx
<HeatMap x="x" y="y" color="z" stat="mean" />
```

**Type:** `NumericAttribute<T>`

### color (required)

Dimension to map to color:

```tsx
<HeatMap x="x" y="y" color="temperature" stat="mean" />
```

**Type:** `NumericAttribute<T>`

### stat (optional)

Summary statistic to compute for each bin:

**Available statistics:**
- `"count"` - Number of points in cell (default)
- `"sum"` - Sum of color values
- `"mean"` - Average of color values
- `"median"` - Median of color values
- `"min"` - Minimum value
- `"max"` - Maximum value
- `"variance"` - Variance
- `"stdev"` - Standard deviation
- `"range"` - max - min

**Type:** `NumericAttribute<Stats>`
**Default:** `"count"`

### colorScheme (optional)

D3 color scale:

```tsx
<HeatMap x="x" y="y" color="value" stat="mean" colorScheme="viridis" />
```

**Default:** `"plasma"`

See [Coordinates documentation](../core-concepts/coordinates.md#color-schemes) for available schemes.

### children (optional)

Additional elements to overlay:

```tsx
<HeatMap x="x" y="y" color="value" stat="count">
  <circle cx={200} cy={200} r={10} fill="red" stroke="white" strokeWidth={2} />
</HeatMap>
```

**Type:** `React.ReactNode`

## Binning

Heat maps use 2D binning similar to histograms:

1. **Bin calculation:** Uses Freedman-Diaconis rule independently for X and Y
2. **Point assignment:** Each point assigned to a 2D bin
3. **Statistic computation:** Summary stat computed for each bin
4. **Color mapping:** Stat values mapped to colors

See [BinStats2d documentation](../statistical-layers/bin-stats.md) for details.

## Examples

### Point Density

```tsx
// Visualize where points cluster
<HeatMap
  x="x"
  y="y"
  color="x"  // Any dimension works for count
  stat="count"
  colorScheme="viridis"
/>
```

### Spatial Average

```tsx
// Show average value across geographic regions
<HeatMap
  x="longitude"
  y="latitude"
  color="pollution"
  stat="mean"
  colorScheme="RdYlGn"
/>
```

### Correlation Matrix

```tsx
// Create a correlation matrix-style visualization
const gridData = []
for (let i = 0; i < 10; i++) {
  for (let j = 0; j < 10; j++) {
    gridData.push({
      x: i,
      y: j,
      correlation: Math.random() * 2 - 1  // -1 to 1
    })
  }
}

<Data value={gridData}>
  <HeatMap
    x="x"
    y="y"
    color="correlation"
    stat="mean"
    colorScheme="RdBu"
  />
</Data>
```

### With Scatter Overlay

```tsx
<Data value={data}>
  <SizedSVG>
    <BinStats2d x="x" y="y" summaryDimension="z" summaryStat="mean" colorScheme="viridis">
      <Squares />  {/* Heat map */}

      {/* Overlay original points */}
      <Data value={data}>
        <Coordinates x="x" y="y">
          <g opacity={0.3}>
            <PointCircles />
          </g>
        </Coordinates>
      </Data>

      <XAxis />
      <YAxis />
      <ColorLegend top right />
    </BinStats2d>
  </SizedSVG>
</Data>
```

## Performance

Heat maps are highly efficient for large datasets:

1. **Aggregation:** 1,000,000 points → typically 20x20 to 50x50 bins
2. **Single pass:** O(n) binning algorithm
3. **Fast rendering:** Renders bins, not individual points

Excellent for datasets too large for scatter plots.

## TypeScript

```tsx
interface SpatialData {
  longitude: number
  latitude: number
  value: number
}

<Data value={data}>
  <HeatMap<SpatialData>
    x="longitude"
    y="latitude"
    color="value"
    stat="mean"
  />
</Data>
```

## Comparison with Other Chart Types

**Use HeatMap when:**
- You have many points (10,000+)
- You want to see 2D density or patterns
- Individual points don't matter

**Consider alternatives:**
- **Scatter** - For fewer points or when individual points matter
- **Histogram** - For 1D distributions
- **Tiles** - For pre-binned or gridded data

## Component Structure

Internally, `HeatMap` creates:

```tsx
<SizedSVG>
  <BinStats2d
    x={x}
    y={y}
    summaryDimension={color}
    summaryStat={stat}
    colorScheme={colorScheme}
  >
    <XAxis />
    <YAxis />
    <ColorLegend top right dimensionName={color} />
    <Title />
    <Squares />
    <g>{children}</g>
  </BinStats2d>
</SizedSVG>
```

See src/HeatMap.tsx for implementation.

## Related Components

- [Histogram](histogram.md) - 1D distributions
- [BinStats2d](../statistical-layers/bin-stats.md) - 2D binning engine
- [Scatter](scatter.md) - Individual points
- [Tiles](../primitives/shapes.md) - Tile-based rendering
