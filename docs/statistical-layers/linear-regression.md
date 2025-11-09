# Linear Regression

Add linear regression trend lines to scatter plots and other visualizations.

## Overview

The `useLinearRegression` hook computes the best-fit line for the current data using least squares regression. It's typically used with the `Path` component to draw regression lines.

```tsx
import { useLinearRegression, Path } from 'chart-thing'

function RegressionLine() {
  const { m, b } = useLinearRegression()
  // y = mx + b

  return <Path stroke="red" strokeWidth={2} />
}
```

## Basic Usage

```tsx
<Data value={data}>
  <Scatter x="x" y="y">
    <RegressionLine />
  </Scatter>
</Data>

function RegressionLine() {
  const regression = useLinearRegression()
  const { width } = useContext(CoordinateContext)

  return (
    <line
      x1={0}
      y1={/* calculate y at x=0 */}
      x2={width}
      y2={/* calculate y at x=width */}
      stroke="red"
      strokeWidth={2}
    />
  )
}
```

## Hook API

### useLinearRegression()

Computes linear regression for current data in DataContext using x/y from CoordinateContext.

**Returns:**
```tsx
{
  m: number       // Slope
  b: number       // Y-intercept
  fn: (x: T) => number  // Function to predict y for any data point
}
```

**Equation:** `y = mx + b`

### How It Works

1. Reads data from `DataContext`
2. Gets `xStatValue` and `yStatValue` from `CoordinateContext`
3. Extracts (x, y) pairs
4. Computes least-squares linear regression using the `regression` library
5. Returns slope (m), intercept (b), and prediction function

See src/LinearRegressionStat.tsx for implementation.

## Examples

### Basic Regression Line

```tsx
import { useLinearRegression } from 'chart-thing'
import { useContext } from 'react'
import { CoordinateContext } from 'chart-thing'

function RegressionOverlay() {
  const { m, b } = useLinearRegression()
  const { xScale, yScale, width } = useContext(CoordinateContext)

  // Calculate endpoints
  const x1 = 0
  const x2 = width
  const y1 = yScale({ /* dummy object */ })  // This won't work directly

  // Better: use data points
  const data = useDataArray()
  const firstX = data[0]
  const lastX = data[data.length - 1]

  return (
    <line
      x1={xScale(firstX)}
      y1={yScale({ ...firstX, y: m * xStatValue(firstX) + b })}
      x2={xScale(lastX)}
      y2={yScale({ ...lastX, y: m * xStatValue(lastX) + b })}
      stroke="red"
      strokeWidth={2}
    />
  )
}

<Scatter x="x" y="y">
  <RegressionOverlay />
</Scatter>
```

### With Equation Display

```tsx
function RegressionWithEquation() {
  const { m, b } = useLinearRegression()

  return (
    <>
      <Path stroke="red" strokeWidth={2} />
      <text x={10} y={20} fontSize="14px">
        y = {m.toFixed(2)}x + {b.toFixed(2)}
      </text>
    </>
  )
}
```

### Confidence Band

```tsx
// Note: useLinearRegression doesn't provide confidence intervals
// This is a simplified visualization
function RegressionWithBand() {
  const { m, b, fn } = useLinearRegression()
  const data = useDataArray()

  // Calculate residuals
  const residuals = data.map(d => Math.abs(yStatValue(d) - fn(d)))
  const avgResidual = residuals.reduce((a, b) => a + b, 0) / residuals.length

  return (
    <>
      {/* Upper bound */}
      <Path
        data={data.map(d => ({ ...d, y: fn(d) + avgResidual }))}
        stroke="red"
        strokeDasharray="5,5"
        opacity={0.5}
      />

      {/* Regression line */}
      <Path stroke="red" strokeWidth={2} />

      {/* Lower bound */}
      <Path
        data={data.map(d => ({ ...d, y: fn(d) - avgResidual }))}
        stroke="red"
        strokeDasharray="5,5"
        opacity={0.5}
      />
    </>
  )
}
```

### Grouped Regression

```tsx
<Data value={data}>
  <Grouped by="category">
    <Scatter x="x" y="y">
      <RegressionLine />
    </Scatter>
  </Grouped>
</Data>
```

Each group gets its own regression line automatically.

## Limitations

### Linear Only

Only computes linear (straight line) regression. For polynomial, exponential, or other fits, you'll need to:

1. Use the `regression` library directly
2. Transform your data before passing to chart-thing
3. Use `ConvolutionalSmoother` for non-parametric smoothing

### No Confidence Intervals

The hook doesn't provide:
- R² (coefficient of determination)
- Confidence intervals
- P-values
- Standard errors

For these, access the `regression` library directly:

```tsx
import regression from 'regression'

const data = useDataArray()
const { xStatValue, yStatValue } = useContext(CoordinateContext)

const points = data.map(d => [xStatValue(d), yStatValue(d)])
const result = regression.linear(points)

console.log(result.r2)  // R-squared
console.log(result.equation)  // [m, b]
console.log(result.string)  // "y = mx + b"
```

### Outlier Sensitivity

Least squares regression is sensitive to outliers. Consider:

1. **Filtering outliers** with `SigmaFilter` first
2. **Robust regression** using a different library
3. **Visual inspection** of residuals

## TypeScript

```tsx
interface DataPoint {
  temperature: number
  sales: number
}

function MyRegression() {
  const regression = useLinearRegression<DataPoint>()

  // regression.fn accepts DataPoint and returns number
  const predicted = regression.fn({ temperature: 25, sales: 0 })

  return <Path stroke="blue" />
}
```

## Performance

Regression computation is:
- **O(n)** where n is the number of data points
- **Memoized** - only recomputes when data or coordinates change
- **Fast** - handles 10,000+ points without issues

## Related Components

- [Scatter](../charts/scatter.md) - Scatter plots for regression
- [Path](../primitives/paths.md) - Drawing the regression line
- [ConvolutionalSmoother](convolutional-smoother.md) - Non-parametric smoothing
- [SigmaFilter](sigma-filter.md) - Outlier removal
