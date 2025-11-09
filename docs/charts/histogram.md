# Histogram

Histograms visualize the distribution of a continuous variable by binning values and displaying frequencies or other summary statistics.

## Overview

The `Histogram` component uses `BinStats1d` to bin data and display rectangles representing the distribution.

```tsx
import { Histogram, Data } from 'chart-thing'

<Data value={measurements}>
  <Histogram
    x="value"
    summaryDimension="value"
    summaryStat="count"
  />
</Data>
```

## Basic Usage

### Simple Frequency Histogram

```tsx
const data = Array.from({ length: 1000 }, () => ({
  value: Math.random() * 100
}))

<div style={{ width: '800px', height: '600px' }}>
  <Data value={data}>
    <Histogram
      x="value"
      summaryDimension="value"
      summaryStat="count"
    />
  </Data>
</div>
```

This creates a frequency histogram showing how many data points fall into each bin.

### Distribution of Measurements

```tsx
<Data value={measurements}>
  <Histogram
    x="temperature"
    summaryDimension="temperature"
    summaryStat="count"
  />
</Data>
```

## Props

### x (required)

The dimension to bin along the X-axis:

```tsx
<Histogram
  x="measurement"
  summaryDimension="measurement"
  summaryStat="count"
/>
```

**Type:** `NumericAttribute<T>` (string key or accessor function)

### summaryDimension (required)

The dimension to compute summary statistics on:

```tsx
// For frequency histogram, use the same as x
<Histogram
  x="value"
  summaryDimension="value"
  summaryStat="count"
/>

// For weighted histogram, use a different dimension
<Histogram
  x="category"
  summaryDimension="amount"
  summaryStat="sum"
/>
```

**Type:** `NumericAttribute<T>`

### summaryStat (required)

Which statistic to display for each bin:

```tsx
<Histogram
  x="value"
  summaryDimension="value"
  summaryStat="count"  // Show frequency
/>
```

**Available statistics:**
- `"count"` - Number of items in bin (frequency)
- `"sum"` - Sum of values in bin
- `"mean"` - Average value in bin
- `"median"` - Median value in bin
- `"min"` - Minimum value in bin
- `"max"` - Maximum value in bin
- `"variance"` - Variance of bin
- `"stdev"` - Standard deviation of bin
- `"range"` - Range (max - min) of bin

**Type:** `NumericAttribute<Stats>`

See src/common.ts:49-60 for the Stats interface.

### children (optional)

Additional elements to render:

```tsx
<Histogram x="value" summaryDimension="value" summaryStat="count">
  {/* Overlay custom elements */}
  <circle cx={200} cy={100} r={5} fill="red" />
</Histogram>
```

**Type:** `React.ReactNode`

## Binning Algorithm

### Automatic Bin Count

Bins are automatically calculated using Freedman-Diaconis rule:

```tsx
binWidth = (3.5 * stdev) / ∛n
bins = floor(range / binWidth)
```

Where:
- `stdev` is the standard deviation of the data
- `n` is the number of data points
- `range` is max - min

See src/BinStats1d.tsx:31-36 for the implementation.

**Fallback:** If standard deviation cannot be computed, uses 20 bins.

### Bin Assignment

Each data point is assigned to a bin:

```tsx
binIndex = floor((value - min) / binWidth)
```

Points are grouped by bin, then summary statistics are computed for each bin.

## Examples

### Normal Distribution

```tsx
// Generate normal distribution
const data = Array.from({ length: 10000 }, () => ({
  value: (Math.random() + Math.random() + Math.random() - 1.5) * 20 + 50
}))

<Data value={data}>
  <Histogram
    x="value"
    summaryDimension="value"
    summaryStat="count"
  />
</Data>
```

### Weighted Histogram

```tsx
// Show sum of amounts per category
<Data value={sales}>
  <Histogram
    x="category"
    summaryDimension="amount"
    summaryStat="sum"
  />
</Data>
```

Each bar shows the total sales for that category.

### Average per Bin

```tsx
// Show average value per bin
<Data value={measurements}>
  <Histogram
    x="position"
    summaryDimension="temperature"
    summaryStat="mean"
  />
</Data>
```

### Multiple Distributions

```tsx
<Data value={experiments}>
  <Grouped by="condition">
    <Histogram
      x="result"
      summaryDimension="result"
      summaryStat="count"
    />
  </Grouped>
</Data>
```

Creates overlapping or side-by-side histograms for each condition.

### With Custom Overlay

```tsx
<Data value={data}>
  <Histogram
    x="value"
    summaryDimension="value"
    summaryStat="count"
  >
    {/* Add mean line */}
    <line
      x1={meanValue}
      y1={0}
      x2={meanValue}
      y2={height}
      stroke="red"
      strokeWidth={2}
      strokeDasharray="5,5"
    />
  </Histogram>
</Data>
```

## Using BinStats1d Directly

For more control, use `BinStats1d` directly:

```tsx
import { BinStats1d, SizedSVG } from 'chart-thing'

<Data value={data}>
  <SizedSVG>
    <BinStats1d
      x="value"
      summaryDimension="value"
      summaryStat="count"
    >
      {/* Custom rendering */}
      <YourCustomBinRenderer />
    </BinStats1d>
  </SizedSVG>
</Data>
```

`BinStats1d` provides:
- Binned data via DataContext
- Scales via CoordinateContext
- `binWidth` in CoordinateContext

See [BinStats documentation](../statistical-layers/bin-stats.md) for details.

## Bin Data Structure

Inside the histogram, data is transformed into bins:

```tsx
interface Bin1d<T> {
  xBin: number        // Bin index (0, 1, 2, ...)
  data: T[]           // Original data points in this bin
  count: number       // Number of items
  sum: number         // Sum of summaryDimension
  mean: number        // Average of summaryDimension
  // ... other statistics
}
```

These bins become the new data available to child components via `useDataArray()`.

## Custom Bin Rendering

You can create custom bin visualizations:

```tsx
import { useDataArray, useContext } from 'react'
import { CoordinateContext } from 'chart-thing'

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
          fill={bin.count > 100 ? 'red' : 'blue'}
        />
      ))}
    </>
  )
}

<BinStats1d x="value" summaryDimension="value" summaryStat="count">
  <CustomBars />
</BinStats1d>
```

## TypeScript

Full type safety:

```tsx
interface Measurement {
  value: number
  weight: number
}

<Data value={measurements}>
  <Histogram<Measurement>
    x="value"
    summaryDimension="weight"
    summaryStat="mean"
  />
</Data>
```

## Comparison with Other Chart Types

**Use Histogram when:**
- You want to see the distribution of a single variable
- You have continuous numeric data
- You want to identify patterns in frequency

**Consider alternatives:**
- **Scatter** - For relationships between two variables
- **HeatMap** - For 2D distributions
- **BinStats1d** - For custom bin visualizations

## Performance

Histograms are efficient even with large datasets:

1. **Binning reduces data:** 100,000 points → ~20-50 bins
2. **Single pass:** Data is binned in one iteration
3. **Memoized:** Bins only recompute when data or settings change

Tested with datasets of 1,000,000+ points with good performance.

## Common Patterns

### Comparing Distributions

```tsx
<Data value={allData}>
  <Grouped by="group">
    <Histogram x="value" summaryDimension="value" summaryStat="count" />
  </Grouped>
</Data>
```

### Filtering Outliers

```tsx
<Data value={data}>
  <Subset filter={(d) => d.value > 0 && d.value < 100}>
    <Histogram x="value" summaryDimension="value" summaryStat="count" />
  </Subset>
</Data>
```

### Log Scale

```tsx
<Data value={data}>
  <Histogram
    x={(d) => Math.log10(d.value)}
    summaryDimension={(d) => Math.log10(d.value)}
    summaryStat="count"
  />
</Data>
```

### Normalized Histogram

```tsx
// Show proportions instead of counts
const total = data.length

function NormalizedBars() {
  const bins = useDataArray<Bin1d<any>>()
  const { xScale, yScale, binWidth, height } = useContext(CoordinateContext)

  return (
    <>
      {bins.map(bin => (
        <rect
          key={bin.xBin}
          x={xScale(bin)}
          y={yScale({ ...bin, count: bin.count / total })}
          width={binWidth}
          height={height - yScale({ ...bin, count: bin.count / total })}
        />
      ))}
    </>
  )
}
```

## Component Structure

Internally, `Histogram` creates:

```tsx
<SizedSVG>
  <BinStats1d
    x={x}
    summaryDimension={summaryDimension}
    summaryStat={summaryStat}
  >
    <Title />
    <XAxis />
    <YAxis />
    <Rectangles />
    {children}
  </BinStats1d>
</SizedSVG>
```

See src/Histogram.tsx for the implementation.

The `Rectangles` component (src/Histogram.tsx:11-32) renders the bars using the binned data.

## Limitations

### Fixed Bin Width

Currently, bin width is automatically calculated and cannot be customized. To use custom bins, use `BinStats1d` directly and provide bin configuration through Dimensions:

```tsx
const dimensions = {
  value: {
    stats: {
      min: 0,
      max: 100,
    }
  }
}

<Dimensions value={dimensions}>
  <Histogram x="value" summaryDimension="value" summaryStat="count" />
</Dimensions>
```

### No Stacking

Multiple histograms overlay rather than stack. For stacked histograms, you'll need to compute cumulative values manually.

## Troubleshooting

### Bars not showing

**Problem:** Histogram renders but no bars appear.

**Solution:** Check that data has valid numeric values:

```tsx
const clean = data.filter(d =>
  typeof d.value === 'number' &&
  Number.isFinite(d.value)
)

<Data value={clean}>
  <Histogram x="value" summaryDimension="value" summaryStat="count" />
</Data>
```

### Too few or too many bins

**Problem:** Binning doesn't look right.

**Solution:** The automatic binning may not suit your data. Use `BinStats1d` with custom dimension stats to control the range and implicitly the bin count.

### Overlapping bars

**Problem:** Multiple grouped histograms overlap and are hard to read.

**Solution:** Use small multiples instead:

```tsx
{groups.map(group => (
  <div key={group} style={{ width: '300px', height: '200px' }}>
    <Data value={data}>
      <Subset filter={(d) => d.group === group}>
        <Histogram x="value" summaryDimension="value" summaryStat="count" />
      </Subset>
    </Data>
  </div>
))}
```

## Related Components

- [BinStats1d](../statistical-layers/bin-stats.md) - The underlying binning component
- [BinStats2d](../statistical-layers/bin-stats.md) - 2D binning for heatmaps
- [HeatMap](heatmap.md) - 2D distribution visualization
- [Scatter](scatter.md) - Individual data points
