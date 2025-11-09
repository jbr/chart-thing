# Convolutional Smoother

Smooth noisy data using convolution with Gaussian, moving window, or triangular kernels.

## Overview

The `ConvolutionalSmoother` component applies convolution-based smoothing to data, reducing noise while preserving trends.

```tsx
import { ConvolutionalSmoother, LineChart } from 'chart-thing'

<Data value={noisyData}>
  <ConvolutionalSmoother on="y" size={5} fn="gaussian">
    <LineChart x="x" y="y" />
  </ConvolutionalSmoother>
</Data>
```

## Basic Usage

```tsx
const noisyData = Array.from({ length: 100 }, (_, i) => ({
  x: i,
  y: Math.sin(i / 10) + (Math.random() - 0.5) * 2  // Signal + noise
}))

<Data value={noisyData}>
  <ConvolutionalSmoother on="y" size={3} fn="gaussian">
    <LineChart x="x" y="y" strokeWidth={2} />
  </ConvolutionalSmoother>
</Data>
```

## Props

### on (required)

Dimension to smooth:

```tsx
<ConvolutionalSmoother on="value" size={5}>
  {/* 'value' attribute is smoothed */}
</ConvolutionalSmoother>
```

**Type:** `NumericAttribute<T>`

### size (required)

Smoothing window size (kernel width):

```tsx
<ConvolutionalSmoother on="y" size={10}>
  {/* Larger size = more smoothing */}
</ConvolutionalSmoother>
```

**Type:** `number`

- **Small (1-3):** Minimal smoothing, preserves detail
- **Medium (5-10):** Moderate smoothing
- **Large (15+):** Heavy smoothing, removes fine details

### as (optional)

Output attribute name (defaults to same as `on`):

```tsx
<ConvolutionalSmoother on="value" as="smoothedValue" size={5}>
  <LineChart x="x" y="smoothedValue" />
  {/* Original 'value' still available */}
</ConvolutionalSmoother>
```

**Type:** `NumericAttribute<T>`
**Default:** Same as `on`

### fn (optional)

Convolution function/kernel:

```tsx
<ConvolutionalSmoother on="y" size={5} fn="gaussian">
  {/* Uses Gaussian kernel */}
</ConvolutionalSmoother>
```

**Type:** `ConvolutionFunctionName | ConvolutionFunction`

**Built-in functions:**
- `"gaussian"` (default) - Gaussian/normal distribution kernel
- `"movingWindow"` - Simple moving average (uniform weights)
- `"triangular"` - Triangular/tent kernel

**Default:** `"gaussian"`

### children (required)

Components to render with smoothed data:

```tsx
<ConvolutionalSmoother on="y" size={5}>
  <LineChart x="x" y="y" />
</ConvolutionalSmoother>
```

**Type:** `React.ReactNode`

## Convolution Functions

### Gaussian

Weighted average with weights following normal distribution:

```tsx
weight(distance) = (1 / (σ√(2π))) × e^(-(distance²) / (2σ²))
```

Where σ = `size`

**Best for:** General-purpose smoothing, preserves shape

### Moving Window

Simple average of nearby points:

```tsx
weight(distance) = {
  1 / windowSize  if |distance| ≤ windowSize
  0               otherwise
}
```

**Best for:** Quick smoothing, equal weighting

### Triangular

Linear decline in weights:

```tsx
weight(distance) = max(0, size - |distance|) / size²
```

**Best for:** Moderate smoothing with less emphasis on distant points

## How It Works

1. **Padding:** Data is padded at edges (repeats first/last values)
2. **Convolution:** For each point, compute weighted sum of neighbors
3. **Output:** Create new dataset with smoothed values
4. **Data flow:** Smoothed data provided via DataContext

See src/ConvolutionalSmoother.tsx:43-86 for the smooth function implementation.

## Examples

### Comparison of Original vs Smoothed

```tsx
<Data value={noisyData}>
  {/* Original data */}
  <LineChart x="x" y="value" strokeWidth={1} opacity={0.3} />

  {/* Smoothed overlay */}
  <ConvolutionalSmoother on="value" size={5}>
    <LineChart x="x" y="value" strokeWidth={3} />
  </ConvolutionalSmoother>
</Data>
```

### Different Smoothing Levels

```tsx
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
  {[2, 5, 10].map(size => (
    <div key={size} style={{ height: '200px' }}>
      <Data value={noisyData}>
        <ConvolutionalSmoother on="y" size={size}>
          <LineChart x="x" y="y" />
        </ConvolutionalSmoother>
      </Data>
      <p>Size: {size}</p>
    </div>
  ))}
</div>
```

### Comparing Kernel Functions

```tsx
<Data value={noisyData}>
  <ConvolutionalSmoother on="value" as="gaussian" size={5} fn="gaussian">
    <LineChart x="x" y="gaussian" stroke="red" />
  </ConvolutionalSmoother>

  <ConvolutionalSmoother on="value" as="moving" size={5} fn="movingWindow">
    <LineChart x="x" y="moving" stroke="blue" />
  </ConvolutionalSmoother>

  <ConvolutionalSmoother on="value" as="triangular" size={5} fn="triangular">
    <LineChart x="x" y="triangular" stroke="green" />
  </ConvolutionalSmoother>
</Data>
```

### Confidence Band

```tsx
<Data value={data}>
  <ConvolutionalSmoother on="value" size={5}>
    <LineChart x="x" y="value">
      {/* Original data as scatter */}
      <Data value={data}>
        <PointCircles opacity={0.2} />
      </Data>
    </LineChart>
  </ConvolutionalSmoother>
</Data>
```

### Custom Kernel Function

```tsx
// Cosine kernel
const cosineKernel = (distance: number, size: number) => {
  if (Math.abs(distance) > size) return 0
  return (Math.cos((Math.PI * distance) / size) + 1) / (2 * size)
}

<ConvolutionalSmoother on="y" size={5} fn={cosineKernel}>
  <LineChart x="x" y="y" />
</ConvolutionalSmoother>
```

## Performance

### Computation Complexity

- **O(n²)** for naive implementation
- Each of n points weighted by all n neighbors
- Optimized with caching of kernel values

See src/ConvolutionalSmoother.tsx:36-41 for caching implementation.

### Optimization Tips

1. **Use appropriate size:** Larger size = more computation
2. **Downsample first:** Smooth fewer points if possible
3. **Memoization:** Results are memoized automatically

Works well with up to 10,000 points. For larger datasets, consider downsampling.

## Edge Behavior

At the start and end of data:

1. **Padding:** First and last values are repeated
2. **Edge points:** Smoothed but with fewer neighbors on one side
3. **No extrapolation:** Doesn't extend beyond data range

This prevents edge artifacts but can cause slight bias at boundaries.

## TypeScript

```tsx
interface TimeSeries {
  timestamp: number
  value: number
}

<Data value={data}>
  <ConvolutionalSmoother<TimeSeries>
    on="value"
    as="smoothed"
    size={5}
  >
    <LineChart x="timestamp" y="smoothed" />
  </ConvolutionalSmoother>
</Data>
```

## Choosing Smoothing Parameters

### Size Selection

**Too small (< 2):**
- Minimal smoothing
- Noise remains
- Details preserved

**Appropriate (3-10):**
- Balances noise reduction and detail
- Typical for most use cases

**Too large (> 20):**
- Over-smoothing
- Loss of real features
- Data becomes overly simplified

**Rule of thumb:** Start with `size = sqrt(n) / 10` where n is data length

### Function Selection

**Gaussian:**
- Default choice
- Smooth results
- Natural-looking curves

**Moving Window:**
- Faster computation
- Simple to understand
- Can introduce minor artifacts

**Triangular:**
- Middle ground
- Less computation than Gaussian
- Smoother than moving window

## Comparison with Other Techniques

**ConvolutionalSmoother vs LinearRegression:**
- Convolution: Non-parametric, local smoothing, follows data closely
- Regression: Parametric, global fit, straight line

**ConvolutionalSmoother vs BinStats:**
- Convolution: Preserves all points, smooths values
- Binning: Aggregates points, reduces count

## Related Components

- [LinearRegressionStat](linear-regression.md) - Parametric trend lines
- [SigmaFilter](sigma-filter.md) - Outlier removal before smoothing
- [LineChart](../charts/line-chart.md) - Visualizing smoothed data
- [RibbonChart](../charts/ribbon-chart.md) - Uses smoothing for percentile curves
