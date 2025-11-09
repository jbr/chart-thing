# Getting Started

This guide will walk you through installing chart-thing and creating your first visualization.

## Installation

```bash
npm install chart-thing
```

### Peer Dependencies

chart-thing requires React 17 or later:

```bash
npm install react react-dom
```

## Your First Chart

Let's create a simple scatter plot:

```tsx
import React from 'react'
import { Scatter, Data } from 'chart-thing'

function App() {
  const data = [
    { temperature: 20, humidity: 65, pressure: 1013 },
    { temperature: 22, humidity: 60, pressure: 1015 },
    { temperature: 25, humidity: 55, pressure: 1012 },
    { temperature: 28, humidity: 50, pressure: 1010 },
    { temperature: 30, humidity: 45, pressure: 1008 },
  ]

  return (
    <div style={{ width: '100%', height: '400px' }}>
      <Data value={data}>
        <Scatter x="temperature" y="humidity" />
      </Data>
    </div>
  )
}
```

### What's Happening Here?

1. **Container sizing** - The outer `div` defines the chart size. chart-thing charts are responsive and fill their parent container.

2. **Data context** - `<Data value={data}>` provides data to all child components through React context.

3. **Chart component** - `<Scatter>` creates a scatter plot mapping `temperature` to the x-axis and `humidity` to the y-axis.

## Adding Color

Let's encode a third variable using color:

```tsx
<Data value={data}>
  <Scatter
    x="temperature"
    y="humidity"
    color="pressure"
    colorScheme="viridis"
  />
</Data>
```

The `color` prop maps the `pressure` attribute to a color scale, and `colorScheme` selects which D3 color interpolator to use.

## Customizing the Chart

chart-thing components are composable. The `<Scatter>` component is actually a convenience wrapper that includes several sub-components. You can customize by passing children:

```tsx
<Data value={data}>
  <Scatter x="temperature" y="humidity" color="pressure">
    {/* Add custom elements as children */}
    <circle cx={100} cy={100} r={5} fill="red" />
  </Scatter>
</Data>
```

Or build from scratch using lower-level components:

```tsx
import { SizedSVG, Coordinates, XAxis, YAxis, PointCircles, Title } from 'chart-thing'

<Data value={data}>
  <SizedSVG>
    <Coordinates x="temperature" y="humidity" color="pressure">
      <Title />
      <XAxis />
      <YAxis />
      <PointCircles />
    </Coordinates>
  </SizedSVG>
</Data>
```

## Using Accessor Functions

Instead of object keys, you can use accessor functions for computed values:

```tsx
<Scatter
  x={(d) => d.temperature}
  y={(d) => d.humidity * 100}  // Convert to percentage
  color={(d) => d.pressure - 1000}  // Normalize pressure
/>
```

## Adding Interactivity

Enable hover labels to show data values on mouseover:

```tsx
<Scatter
  x="temperature"
  y="humidity"
  hoverLabel={(d) => `Temp: ${d.temperature}°C, Humidity: ${d.humidity}%`}
/>
```

## Defining Dimensions

For better axis labels and formatting, define dimension metadata:

```tsx
import { Data, Dimensions, Scatter } from 'chart-thing'

const dimensions = {
  temperature: {
    displayLabel: 'Temperature',
    units: '°C',
    labelValue: (value) => `${value.toFixed(1)}°C`,
  },
  humidity: {
    displayLabel: 'Relative Humidity',
    units: '%',
    labelValue: (value) => `${value.toFixed(0)}%`,
  },
}

function App() {
  return (
    <Dimensions value={dimensions}>
      <Data value={data}>
        <Scatter x="temperature" y="humidity" />
      </Data>
    </Dimensions>
  )
}
```

Now your axes will show "Temperature" and "Relative Humidity" as labels, with nicely formatted tick values.

## Transforming Data

chart-thing provides components for filtering and grouping data:

### Filtering

```tsx
<Data value={data}>
  <Subset filter={(d) => d.temperature > 25}>
    <Scatter x="temperature" y="humidity" />
  </Subset>
</Data>
```

### Grouping

```tsx
<Data value={data}>
  <Grouped by="category">
    <LineChart x="x" y="y" />
  </Grouped>
</Data>
```

Each group renders as a separate line with a different color.

## Adding Statistical Layers

Enhance your charts with statistical transformations:

```tsx
import { Scatter, LinearRegressionStat, Path } from 'chart-thing'

<Data value={data}>
  <Scatter x="temperature" y="humidity">
    <LinearRegressionStat x="temperature" y="humidity">
      <Path stroke="red" strokeWidth={2} />
    </LinearRegressionStat>
  </Scatter>
</Data>
```

This adds a linear regression line to your scatter plot.

## Different Chart Types

### Line Chart

```tsx
import { LineChart } from 'chart-thing'

<Data value={timeSeries}>
  <LineChart x="timestamp" y="value" />
</Data>
```

### Histogram

```tsx
import { Histogram } from 'chart-thing'

<Data value={measurements}>
  <Histogram x="value" xBins={20} />
</Data>
```

### Heat Map

```tsx
import { HeatMap } from 'chart-thing'

<Data value={gridData}>
  <HeatMap x="x" y="y" color="density" />
</Data>
```

## TypeScript

chart-thing is written in TypeScript and provides full type safety:

```tsx
interface DataPoint {
  temperature: number
  humidity: number
  timestamp: Date
}

const data: DataPoint[] = [...]

<Data value={data}>
  <Scatter<DataPoint>
    x="temperature"  // Autocomplete works!
    y="humidity"
    // x="typo"  // TypeScript error
  />
</Data>
```

## Next Steps

Now that you've created your first chart, explore the documentation:

- [Core Concepts](core-concepts/data-context.md) - Understand how data flows through chart-thing
- [Charts](charts/scatter.md) - Learn about all available chart types
- [Statistical Layers](statistical-layers/bin-stats.md) - Add statistical transformations
- [Visual Elements](visual-elements/axes.md) - Customize axes, legends, and more
- [API Reference](api-reference.md) - Complete API documentation

## Common Patterns

### Multiple Datasets

```tsx
<div style={{ width: '100%', height: '400px' }}>
  <SizedSVG>
    <Coordinates x={(d) => d.x} y={(d) => d.y}>
      <XAxis />
      <YAxis />

      <Data value={dataset1}>
        <PointCircles />
      </Data>

      <Data value={dataset2}>
        <PointCircles />
      </Data>
    </Coordinates>
  </SizedSVG>
</div>
```

### Small Multiples

```tsx
{categories.map(category => (
  <div key={category} style={{ width: '300px', height: '200px' }}>
    <Data value={data}>
      <Subset filter={(d) => d.category === category}>
        <Scatter x="x" y="y" />
      </Subset>
    </Data>
  </div>
))}
```

### Custom Padding

```tsx
<SizedSVG leftPad={100} rightPad={50} topPad={50} bottomPad={75}>
  <Coordinates x="x" y="y">
    {/* your chart */}
  </Coordinates>
</SizedSVG>
```

## Troubleshooting

### Chart doesn't appear

Make sure the parent container has explicit width and height:

```tsx
// Wrong - no height
<div style={{ width: '100%' }}>
  <Scatter x="x" y="y" />
</div>

// Right
<div style={{ width: '100%', height: '400px' }}>
  <Scatter x="x" y="y" />
</div>
```

### Data isn't displaying

Check that:
1. Data is wrapped in `<Data value={...}>`
2. Accessor keys match your data shape
3. Data values are valid numbers (not null, undefined, or NaN)

### TypeScript errors

If you get type errors with accessor keys, you may need to provide the generic type:

```tsx
<Scatter<YourDataType>
  x="yourKey"
  y="anotherKey"
/>
```
