# chart-thing

A composable, React-friendly charting library inspired by the grammar of graphics. Build complex, interactive visualizations through composition of simple, reusable components.

## Features

- **Composable Architecture** - Layer statistical transformations, geometries, and visual elements to build complex charts
- **React-First** - Built with React hooks and context for natural React integration
- **TypeScript Support** - Fully typed API with excellent IDE autocompletion
- **Responsive** - Automatically adapts to container size with smart padding
- **Flexible Data Binding** - Use object keys or accessor functions for data attributes
- **Rich Color Schemes** - Built-in support for D3 color scales (viridis, turbo, spectral, and more)
- **Interactive** - Built-in hover support and custom gesture handling
- **Statistical Layers** - Linear regression, convolution smoothing, binning, sigma filtering

## Quick Start

```bash
npm install chart-thing
```

```tsx
import { Scatter, Data } from 'chart-thing'

function MyChart() {
  const data = [
    { x: 1, y: 2, category: 'A' },
    { x: 2, y: 4, category: 'B' },
    { x: 3, y: 3, category: 'A' },
  ]

  return (
    <div style={{ width: '100%', height: '400px' }}>
      <Data value={data}>
        <Scatter x="x" y="y" color="category" />
      </Data>
    </div>
  )
}
```

## Core Concepts

chart-thing is built around four core concepts:

1. **[Data Context](core-concepts/data-context.md)** - Manage and transform your data through React context
2. **[Coordinates](core-concepts/coordinates.md)** - Map data to visual space with automatic scaling
3. **[Dimensions](core-concepts/dimensions.md)** - Define metadata for data attributes (labels, units, ranges)
4. **[Sizing](core-concepts/sizing.md)** - Responsive SVG containers that adapt to their parent

## Chart Types

- **[Scatter](charts/scatter.md)** - Scatter plots with optional color encoding
- **[LineChart](charts/line-chart.md)** - Line charts and time series
- **[Histogram](charts/histogram.md)** - One-dimensional distributions
- **[HeatMap](charts/heatmap.md)** - Two-dimensional density plots
- **[RibbonChart](charts/ribbon-chart.md)** - Area charts with upper and lower bounds
- **[SparkLine](charts/sparkline.md)** - Minimal inline charts
- **[Map](charts/map.md)** - Geographic visualizations with pan/zoom

## Statistical Layers

Enhance your charts with statistical transformations:

- **[BinStats](statistical-layers/bin-stats.md)** - 1D and 2D binning (histograms, heatmaps)
- **[LinearRegression](statistical-layers/linear-regression.md)** - Regression lines with confidence bands
- **[ConvolutionalSmoother](statistical-layers/convolutional-smoother.md)** - Smooth noisy data
- **[SigmaFilter](statistical-layers/sigma-filter.md)** - Filter outliers

## Visual Elements

- **[Axes](visual-elements/axes.md)** - X and Y axes with smart tick placement
- **[Legends](visual-elements/legends.md)** - Color legends and categorical legends
- **[Hover](visual-elements/hover.md)** - Interactive hover labels
- **[Title](visual-elements/title.md)** - Chart titles

## Primitives

Low-level components for custom visualizations:

- **[Paths](primitives/paths.md)** - Path, FilledPath, LineSegments
- **[Shapes](primitives/shapes.md)** - Tiles, GradientBar, TextWithBackground

## Examples

### Scatter Plot with Color Encoding

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

### Line Chart with Hover

```tsx
<Data value={timeSeries}>
  <LineChart
    x="timestamp"
    y="value"
    hoverLabel={(d) => `${d.timestamp}: ${d.value}`}
  />
</Data>
```

### Histogram with Custom Bins

```tsx
<Data value={measurements}>
  <Histogram x="measurement" xBins={20} />
</Data>
```

### Composing Layers

```tsx
<Data value={data}>
  <Scatter x="x" y="y">
    <LinearRegressionStat x="x" y="y">
      <Path stroke="red" strokeWidth={2} />
    </LinearRegressionStat>
  </Scatter>
</Data>
```

## Architecture

chart-thing follows a layered architecture:

```
┌─────────────────────────────────────┐
│         Chart Components            │  Scatter, LineChart, Histogram
│  (High-level composition helpers)   │
├─────────────────────────────────────┤
│      Statistical Layers             │  LinearRegression, BinStats
│   (Data transformation layers)      │  ConvolutionalSmoother
├─────────────────────────────────────┤
│       Visual Elements               │  Axes, Legends, Hover, Title
│    (Presentation components)        │
├─────────────────────────────────────┤
│         Primitives                  │  Path, FilledPath, LineSegments
│     (SVG building blocks)           │  Tiles, GradientBar
├─────────────────────────────────────┤
│       Core System                   │  Coordinates, DataContext
│  (Scaling, contexts, utilities)     │  Dimensions, SizedSVG
└─────────────────────────────────────┘
```

Each layer builds on the one below it. You can work at any level - use high-level chart components for quick visualizations, or compose primitives for full custom control.

## API Philosophy

### Composition over Configuration

Instead of passing dozens of options to a monolithic chart component, compose smaller pieces:

```tsx
// Compose layers for exactly what you need
<Scatter x="x" y="y">
  <Title />
  <XAxis />
  <YAxis />
  <ColorLegend />
  <LinearRegressionStat>
    <Path stroke="red" />
  </LinearRegressionStat>
</Scatter>
```

### Data Flows Through Context

Data flows through React context, making it easy to transform and filter:

```tsx
<Data value={allData}>
  <Grouped by="category">
    <Scatter x="x" y="y" />
  </Grouped>
</Data>
```

### Accessor Functions or Keys

All data attributes accept either object keys or functions:

```tsx
// Using keys
<Scatter x="timestamp" y="value" />

// Using functions
<Scatter
  x={(d) => new Date(d.timestamp).getTime()}
  y={(d) => d.value * 100}
/>
```

## Documentation

- [Getting Started](getting-started.md)
- [Core Concepts](core-concepts/)
- [Charts](charts/)
- [Statistical Layers](statistical-layers/)
- [Visual Elements](visual-elements/)
- [Primitives](primitives/)
- [API Reference](api-reference.md)

## License

MIT
