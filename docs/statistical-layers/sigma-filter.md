# Sigma Filter

Filter outliers based on standard deviation (sigma) distance from the mean.

## Overview

The `SigmaFilter` component removes data points that are more than N standard deviations away from the mean, helping identify and handle outliers.

```tsx
import { SigmaFilter, Scatter } from 'chart-thing'

<Data value={data}>
  <SigmaFilter attribute="value" threshold={2}>
    <Scatter x="x" y="value" />
  </SigmaFilter>
</Data>
```

## Basic Usage

```tsx
const dataWithOutliers = [
  ...normalData,
  { x: 50, y: 1000 },  // Outlier: far from others
]

<Data value={dataWithOutliers}>
  <SigmaFilter attribute="y" threshold={2}>
    <Scatter x="x" y="y" />
    {/* Outlier is excluded */}
  </SigmaFilter>
</Data>
```

## Props

### attribute (required)

Dimension to filter on:

```tsx
<SigmaFilter attribute="value" threshold={3}>
  {/* Filters based on 'value' attribute */}
</SigmaFilter>
```

**Type:** `NumericAttribute<T>`

### threshold (required)

Number of standard deviations to allow:

```tsx
<SigmaFilter attribute="value" threshold={2}>
  {/* Keep points within 2σ of mean */}
</SigmaFilter>
```

**Type:** `number`

**Common thresholds:**
- **1σ:** ~68% of data (strict filtering, keeps only core)
- **2σ:** ~95% of data (moderate filtering, standard choice)
- **3σ:** ~99.7% of data (loose filtering, removes only extreme outliers)

### children (optional)

Components to render with filtered data:

```tsx
<SigmaFilter attribute="value" threshold={2}>
  <Scatter x="x" y="value" />
</SigmaFilter>
```

**Type:** `React.ReactNode`

## How It Works

1. **Compute statistics:** Calculate mean and standard deviation of attribute
2. **Calculate distance:** For each point, compute `|value - mean| / stdev`
3. **Filter:** Keep points where distance ≤ threshold
4. **Provide data:** Filtered data available via DataContext

See src/SigmaFilter.tsx:5-21 for the filtering function.

### Formula

A point is kept if:

```
|value - μ| / σ ≤ threshold
```

Where:
- `μ` = mean of attribute
- `σ` = standard deviation of attribute
- `value` = point's attribute value

## Examples

### Scatter Plot Without Outliers

```tsx
<Data value={measurements}>
  <SigmaFilter attribute="measurement" threshold={2}>
    <Scatter x="timestamp" y="measurement" />
  </SigmaFilter>
</Data>
```

### Comparing Filtered vs Unfiltered

```tsx
<Data value={data}>
  {/* All data in background */}
  <Scatter x="x" y="y" color="gray" opacity={0.2} />

  {/* Filtered data highlighted */}
  <SigmaFilter attribute="y" threshold={2}>
    <Scatter x="x" y="y" color="blue" />
  </SigmaFilter>
</Data>
```

### Showing Only Outliers

While `SigmaFilter` doesn't have an `invert` prop, you can achieve this by filtering manually:

```tsx
import { useDataArray } from 'chart-thing'

function OutliersOnly() {
  const allData = useDataArray()
  const stats = attrStats(allData, 'value')

  const outliers = allData.filter(d => {
    const distance = Math.abs(d.value - stats.mean) / stats.stdev
    return distance > 2  // Opposite of SigmaFilter
  })

  return (
    <Data value={outliers}>
      <Scatter x="x" y="value" color="red" />
    </Data>
  )
}

<Data value={data}>
  <OutliersOnly />
</Data>
```

### Multi-Dimensional Filtering

```tsx
<Data value={data}>
  <SigmaFilter attribute="x" threshold={3}>
    <SigmaFilter attribute="y" threshold={3}>
      <Scatter x="x" y="y" />
      {/* Filtered on both dimensions */}
    </SigmaFilter>
  </SigmaFilter>
</Data>
```

### Before Regression

```tsx
<Data value={data}>
  <SigmaFilter attribute="y" threshold={2.5}>
    <Scatter x="x" y="y">
      <RegressionLine />
    </Scatter>
  </SigmaFilter>
</Data>
```

Outliers won't affect the regression line.

### Time Series Anomaly Detection

```tsx
<Data value={timeSeries}>
  {/* Normal data */}
  <SigmaFilter attribute="value" threshold={2}>
    <LineChart x="timestamp" y="value" color="blue" />
  </SigmaFilter>

  {/* Highlight anomalies */}
  <OutliersOnly threshold={2}>
    <PointCircles color="red" r={5} />
  </OutliersOnly>
</Data>
```

## Threshold Guidelines

### Conservative (1σ)

```tsx
<SigmaFilter attribute="value" threshold={1}>
  {/* Keeps ~68% of normally distributed data */}
</SigmaFilter>
```

**Use when:**
- You want only the most typical data
- Building a "core" dataset
- High confidence in remaining data

### Moderate (2σ)

```tsx
<SigmaFilter attribute="value" threshold={2}>
  {/* Keeps ~95% of normally distributed data */}
</SigmaFilter>
```

**Use when:**
- Standard outlier removal
- Balancing data retention and outlier removal
- Most common choice

### Permissive (3σ)

```tsx
<SigmaFilter attribute="value" threshold={3}>
  {/* Keeps ~99.7% of normally distributed data */}
</SigmaFilter>
```

**Use when:**
- You only want to remove extreme outliers
- Data collection errors are rare
- Preserving data is important

## Limitations

### Assumes Normal Distribution

Sigma filtering works best when data is normally distributed. For skewed or multimodal data:

- Outliers may not be detected correctly
- Too much or too little data may be removed

**Alternative:** Use percentile-based filtering for non-normal data

### Single Dimension

Filters based on one attribute at a time. For multivariate outlier detection:

- Apply multiple filters sequentially
- Use Mahalanobis distance (requires custom implementation)

### Mean-Based

Mean and standard deviation are sensitive to outliers themselves. Very extreme outliers can affect the threshold.

**Solution:** Use robust statistics (median, MAD) for extreme cases (requires custom implementation)

## Performance

- **O(n):** Single pass through data
- **Memoized:** Only recomputes when data or threshold changes
- **Fast:** Handles 100,000+ points efficiently

## TypeScript

```tsx
interface Measurement {
  timestamp: number
  value: number
  sensorId: string
}

<Data value={measurements}>
  <SigmaFilter<Measurement>
    attribute="value"
    threshold={2}
  >
    <Scatter x="timestamp" y="value" />
  </SigmaFilter>
</Data>
```

## Utility Function

The filtering function is also exported for direct use:

```tsx
import { sigmaFilter } from 'chart-thing'

const data = [...]
const filtered = sigmaFilter(data, 'value', 2)

// Use filtered data directly
console.log(`Removed ${data.length - filtered.length} outliers`)
```

## Related Components

- [Subset](../core-concepts/data-context.md#subset) - General-purpose filtering
- [LinearRegressionStat](linear-regression.md) - Can be affected by outliers
- [ConvolutionalSmoother](convolutional-smoother.md) - Smoothing after outlier removal
- [Scatter](../charts/scatter.md) - Visualizing filtered data
