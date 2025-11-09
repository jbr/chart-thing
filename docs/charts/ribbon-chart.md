# Ribbon Chart

Ribbon charts visualize distributions across a continuous dimension using percentile bands, creating a "ribbon" effect that shows data spread.

## Overview

The `RibbonChart` component displays weighted percentiles across binned data, showing how a distribution changes along an axis. This is particularly useful for visualizing uncertainty, variance, or spread in data.

```tsx
import { RibbonChart, Data } from 'chart-thing'

<Data value={data}>
  <RibbonChart
    x="distance"
    y="elevation"
    weightBy="count"
  />
</Data>
```

## Basic Usage

```tsx
const data = Array.from({ length: 1000 }, (_, i) => ({
  x: i / 10,
  y: Math.sin(i / 10) + (Math.random() - 0.5) * 2,
  weight: 1,
}))

<div style={{ width: '800px', height: '600px' }}>
  <Data value={data}>
    <RibbonChart
      x="x"
      y="y"
      weightBy="weight"
    />
  </Data>
</div>
```

## Props

### x (required)

The continuous dimension to bin along (typically the independent variable):

```tsx
<RibbonChart x="distance" y="elevation" weightBy="sampleCount" />
```

**Type:** `NumericAttribute<T>`

### y (required)

The dimension to compute percentiles for (the dependent variable):

```tsx
<RibbonChart x="timestamp" y="value" weightBy="confidence" />
```

**Type:** `NumericAttribute<T>`

### weightBy (required)

Dimension to weight observations by when computing percentiles:

```tsx
// Equal weighting
<RibbonChart x="x" y="y" weightBy={(d) => 1} />

// Weight by sample size
<RibbonChart x="position" y="measurement" weightBy="sampleSize" />
```

**Type:** `NumericAttribute<T>`

### children (optional)

Additional elements to render:

```tsx
<RibbonChart x="x" y="y" weightBy="weight">
  <line x1={0} y1={0} x2={width} y2={height} stroke="red" />
</RibbonChart>
```

**Type:** `React.ReactNode`

## How It Works

### Binning and Percentiles

1. **X-axis binning:** Data is binned along the X dimension (like a histogram)
2. **Percentile computation:** For each bin, weighted percentiles are computed for Y values (1st, 3rd, 5th, ..., 95th, 97th, 99th)
3. **Smoothing:** Percentile curves are smoothed using Gaussian convolution
4. **Rendering:** Polygon bands are drawn between adjacent percentiles

See src/RibbonChart.tsx:42-186 for the implementation.

### Weighted Percentiles

Unlike standard percentiles, these account for weights:

```tsx
// If your data has varying confidence/sample sizes
const data = [
  { x: 1, y: 10, confidence: 0.5 },  // Low confidence
  { x: 1, y: 12, confidence: 1.0 },  // High confidence
]

<RibbonChart x="x" y="y" weightBy="confidence" />
```

Points with higher weights contribute more to the percentile calculation.

### Color and Opacity

Ribbons are colored using the Inferno color scheme, with:
- **Center (50th percentile):** Brightest
- **Edges (1st, 99th percentiles):** Darkest
- **Opacity:** Higher near the median, lower at extremes

This creates a visual emphasis on the central tendency.

## Examples

### Elevation Profile

```tsx
// Show elevation distribution across distance
<Data value={routeData}>
  <RibbonChart
    x="distance"
    y="elevation"
    weightBy={(d) => 1}  // Equal weights
  />
</Data>
```

### Time Series with Uncertainty

```tsx
// Display forecast predictions with uncertainty bands
<Data value={forecasts}>
  <RibbonChart
    x={(d) => new Date(d.timestamp).getTime()}
    y="predictedValue"
    weightBy="confidence"
  />
</Data>
```

### Performance Distribution

```tsx
// Show how performance varies across experience levels
<Data value={athleteData}>
  <RibbonChart
    x="yearsExperience"
    y="performanceScore"
    weightBy="numberOfAthletes"
  />
</Data>
```

## Percentiles Component

For more control, use the `Percentiles` component directly:

```tsx
import { Percentiles, SizedSVG, XAxis, YAxis } from 'chart-thing'

<Data value={data}>
  <SizedSVG>
    <Percentiles x="x" y="y" weightBy="weight">
      <XAxis />
      <YAxis />
      {/* Custom rendering */}
    </Percentiles>
  </SizedSVG>
</Data>
```

The `Percentiles` component:
- Bins data and computes percentiles
- Provides binned + percentile data via DataContext
- Renders the percentile bands as polygons

## TypeScript

```tsx
interface Measurement {
  position: number
  value: number
  sampleSize: number
}

<Data value={measurements}>
  <RibbonChart<Measurement>
    x="position"
    y="value"
    weightBy="sampleSize"
  />
</Data>
```

## Comparison with Other Chart Types

**Use RibbonChart when:**
- You want to show distribution/spread across a continuous dimension
- You have varying uncertainty or confidence
- You want to emphasize trends while showing variability

**Consider alternatives:**
- **LineChart** - For single-valued relationships without uncertainty
- **Scatter** - To see individual data points
- **Histogram** - For 1D distributions at a single point

## Performance

Ribbon charts are optimized for large datasets:

1. **Binning:** Reduces data to manageable number of bins
2. **Percentile computation:** O(n log n) per bin
3. **Smoothing:** Gaussian convolution on percentile curves
4. **Rendering:** Draws polygons for percentile bands, not individual points

Works well with 10,000+ data points.

## Limitations

### Fixed Percentiles

Percentiles are hardcoded: 1, 3, 5, ..., 95, 97, 99 (see src/RibbonChart.tsx:42).

To customize, you would need to use the `Percentiles` component directly and modify the rendering.

### Inferno Color Scheme

The color scheme is hardcoded to Inferno (src/RibbonChart.tsx:34).

For custom colors, build your own ribbon visualization using the `Percentiles` component.

### Bin Width Logic

Bin width calculation includes some hardcoded special cases for specific attributes like `gradePerMi` and `angle` (src/RibbonChart.tsx:44-53).

## Component Structure

Internally, `RibbonChart` creates:

```tsx
<SizedSVG>
  <Percentiles x={x} y={y} weightBy={weightBy}>
    <XAxis />
    <YAxis />
    <Title />
    {/* Percentile band polygons */}
  </Percentiles>
</SizedSVG>
```

See src/RibbonChart.tsx:188-198 for the implementation.

## Related Components

- [LineChart](line-chart.md) - Single-valued line plots
- [ConvolutionalSmoother](../statistical-layers/convolutional-smoother.md) - Smoothing algorithm used for percentiles
- [BinStats1d](../statistical-layers/bin-stats.md) - 1D binning
- [FilledPath](../primitives/paths.md) - For custom area charts
