# BinStats (1D & 2D)

Statistical binning components that aggregate data into bins and compute summary statistics. The foundation for Histogram and HeatMap components.

## Overview

- **BinStats1d** - Bins data along one dimension
- **BinStats2d** - Bins data in two dimensions (creates a grid)

These components transform raw data into binned data with computed statistics, which can then be visualized in various ways.

```tsx
import { BinStats1d, BinStats2d } from 'chart-thing'

// 1D binning
<BinStats1d x="value" summaryDimension="value" summaryStat="count">
  {/* Render bins */}
</BinStats1d>

// 2D binning
<BinStats2d x="x" y="y" summaryDimension="z" summaryStat="mean">
  {/* Render grid cells */}
</BinStats2d>
```

## BinStats1d

### Props

**x (required)**
- Dimension to bin along
- **Type:** `NumericAttribute<T>`

**summaryDimension (required)**
- Dimension to compute statistics on
- **Type:** `NumericAttribute<T>`

**summaryStat (required)**
- Which statistic to compute
- **Type:** `NumericAttribute<Stats>`
- **Options:** `"count"`, `"sum"`, `"mean"`, `"median"`, `"min"`, `"max"`, `"variance"`, `"stdev"`, `"range"`

**children (required)**
- Components to render with binned data
- **Type:** `React.ReactNode`

### Binning Algorithm

1. **Compute bin width** using Freedman-Diaconis rule:
   ```
   binWidth = (3.5 × stdev) / ∛n
   ```
   Fallback: `range / 20` if stdev unavailable

2. **Calculate number of bins:**
   ```
   bins = floor(range / binWidth)
   ```

3. **Assign points to bins:**
   ```
   binIndex = floor((value - min) / binWidth)
   ```

4. **Compute statistics** for each bin

See src/BinStats1d.tsx:31-36 for bin width calculation.

### Output Data Structure

BinStats1d provides binned data via DataContext:

```tsx
interface Bin1d<T> {
  xBin: number        // Bin index (0, 1, 2, ...)
  data: T[]           // Original data points in bin
  count: number       // Number of items
  sum: number         // Sum of summaryDimension
  mean: number        // Average
  median: number      // Median
  min: number         // Minimum
  max: number         // Maximum
  variance: number    // Variance
  stdev: number       // Standard deviation
  range: number       // max - min
}
```

### Context Provided

In addition to binned data, BinStats1d provides via CoordinateContext:

- `xScale`: Maps bin → pixel X coordinate
- `yScale`: Maps statistic value → pixel Y coordinate
- `binWidth`: Width of each bin in pixels
- `width`, `height`: Plot area dimensions

### Examples

#### Custom Histogram Bars

```tsx
import { useDataArray, useContext } from 'react'
import { BinStats1d, CoordinateContext } from 'chart-thing'

function CustomBars() {
  const bins = useDataArray<Bin1d<any>>()
  const { xScale, yScale, binWidth, height } = useContext(CoordinateContext)

  return (
    <>
      {bins.map(bin => (
        <rect
          key={bin.xBin}
          x={xScale(bin)}
          y={yScale(bin)}
          width={binWidth}
          height={height - yScale(bin)}
          fill={bin.count > 50 ? 'red' : 'blue'}
          stroke="white"
        />
      ))}
    </>
  )
}

<BinStats1d x="value" summaryDimension="value" summaryStat="count">
  <CustomBars />
</BinStats1d>
```

#### Weighted Histogram

```tsx
// Show sum of weights per bin instead of count
<BinStats1d x="category" summaryDimension="amount" summaryStat="sum">
  <Rectangles />
</BinStats1d>
```

#### Distribution Statistics

```tsx
// Show mean ± stdev for each bin
function BinStats() {
  const bins = useDataArray<Bin1d<any>>()
  const { xScale, yScale, binWidth } = useContext(CoordinateContext)

  return (
    <>
      {bins.map(bin => {
        const mean = bin.mean
        const stdev = bin.stdev || 0

        return (
          <g key={bin.xBin}>
            {/* Mean line */}
            <line
              x1={xScale(bin)}
              x2={xScale(bin) + binWidth}
              y1={yScale({ ...bin, [summaryStat]: mean })}
              y2={yScale({ ...bin, [summaryStat]: mean })}
              stroke="black"
              strokeWidth={2}
            />
            {/* Error bar */}
            <rect
              x={xScale(bin)}
              y={yScale({ ...bin, [summaryStat]: mean + stdev })}
              width={binWidth}
              height={yScale({ ...bin, [summaryStat]: mean - stdev }) -
                      yScale({ ...bin, [summaryStat]: mean + stdev })}
              fill="rgba(0,0,0,0.2)"
            />
          </g>
        )
      })}
    </>
  )
}
```

## BinStats2d

### Props

**x (required)**
- Dimension to bin along X-axis
- **Type:** `NumericAttribute<T>`

**y (required)**
- Dimension to bin along Y-axis
- **Type:** `NumericAttribute<T>`

**summaryDimension (required)**
- Dimension to compute statistics on
- **Type:** `NumericAttribute<T>`

**summaryStat (required)**
- Which statistic to compute
- **Type:** `NumericAttribute<Stats>`

**colorScheme (optional)**
- D3 color scheme for color mapping
- **Type:** `ColorScheme`

**children (required)**
- Components to render with binned data
- **Type:** `React.ReactNode`

### Binning Algorithm

Same as BinStats1d, but applied independently to both dimensions:

1. Compute bin widths for X and Y
2. Calculate number of bins in each dimension
3. Assign each point to a 2D bin `(xBin, yBin)`
4. Compute statistics for each cell

See src/BinStats2d.tsx:28-76 for implementation.

### Output Data Structure

BinStats2d provides binned data via DataContext:

```tsx
interface Bin2d<T> {
  xBin: number        // X bin index
  yBin: number        // Y bin index
  data: T[]           // Points in this cell
  count: number       // Number of items
  sum: number         // Sum of summaryDimension
  mean: number        // Average
  // ... other statistics
}
```

### Context Provided

- `xScale`: Maps xBin → pixel X coordinate
- `yScale`: Maps yBin → pixel Y coordinate
- `binWidth`: Width of bins in pixels
- `binHeight`: Height of bins in pixels
- `colorScale`: Maps bin statistic → color
- `width`, `height`: Plot area dimensions

### Examples

#### Custom Heat Map

```tsx
import { useDataArray, useContext } from 'react'
import { BinStats2d, CoordinateContext } from 'chart-thing'

function CustomHeatMap() {
  const bins = useDataArray<Bin2d<any>>()
  const { xScale, yScale, binWidth, binHeight, colorScale } = useContext(CoordinateContext)

  return (
    <>
      {bins.map(bin => (
        <rect
          key={`${bin.xBin},${bin.yBin}`}
          x={xScale(bin)}
          y={yScale(bin) - binHeight}
          width={binWidth}
          height={binHeight}
          fill={colorScale(bin)}
          stroke="none"
        />
      ))}
    </>
  )
}

<BinStats2d
  x="longitude"
  y="latitude"
  summaryDimension="temperature"
  summaryStat="mean"
  colorScheme="RdYlBu"
>
  <CustomHeatMap />
</BinStats2d>
```

#### Annotated Heat Map

```tsx
function AnnotatedHeatMap() {
  const bins = useDataArray<Bin2d<any>>()
  const { xScale, yScale, binWidth, binHeight, colorScale } = useContext(CoordinateContext)

  return (
    <>
      {bins.map(bin => (
        <g key={`${bin.xBin},${bin.yBin}`}>
          <rect
            x={xScale(bin)}
            y={yScale(bin) - binHeight}
            width={binWidth}
            height={binHeight}
            fill={colorScale(bin)}
          />
          {/* Add count text */}
          <text
            x={xScale(bin) + binWidth / 2}
            y={yScale(bin) - binHeight / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="10px"
            fill="white"
          >
            {bin.count}
          </text>
        </g>
      ))}
    </>
  )
}
```

## Use Cases

### When to Use BinStats1d

- Creating custom histograms
- Frequency distributions
- Aggregating time series into intervals
- Showing statistics per category/range

### When to Use BinStats2d

- Heat maps and density plots
- 2D aggregations
- Spatial statistics (geography, grids)
- Correlation matrices

### When NOT to Use

- **Small datasets** - Use Scatter directly
- **Pre-binned data** - If your data is already aggregated, just use it directly
- **Irregular bins** - BinStats uses equal-width bins; for custom bin edges, aggregate manually

## Performance

Both components are optimized for large datasets:

- **O(n) binning** - Single pass through data
- **Reduces data size** - 1M points → ~50 bins (1D) or ~2,500 cells (2D)
- **Memoized** - Bins only recompute when data/settings change

Tested with millions of data points.

## Customizing Bin Width

Currently, bin width is automatically calculated. To control it indirectly:

### Via Dimensions

```tsx
const dimensions = {
  value: {
    stats: {
      min: 0,
      max: 100,  // Force range
    }
  }
}

<Dimensions value={dimensions}>
  <BinStats1d x="value" summaryDimension="value" summaryStat="count">
    {/* Bins will span 0-100 */}
  </BinStats1d>
</Dimensions>
```

This affects the range, which affects bin count.

## TypeScript

```tsx
interface DataPoint {
  measurement: number
  weight: number
}

<BinStats1d<DataPoint>
  x="measurement"
  summaryDimension="weight"
  summaryStat="sum"
>
  {/* TypeScript knows bin structure */}
</BinStats1d>
```

## Component References

### BinStats1d

**Location:** src/BinStats1d.tsx

**Key features:**
- Freedman-Diaconis binning
- Computes full statistics per bin
- Provides custom scales for bin rendering

### BinStats2d

**Location:** src/BinStats2d.tsx

**Key features:**
- Independent X/Y binning
- Color scale integration
- Sparse storage (only non-empty bins)

## Related Components

- [Histogram](../charts/histogram.md) - Uses BinStats1d
- [HeatMap](../charts/heatmap.md) - Uses BinStats2d
- [Coordinates](../core-concepts/coordinates.md) - Scale creation
- [Dimensions](../core-concepts/dimensions.md) - Controlling ranges
