# API Reference

Complete reference for all chart-thing components, hooks, and utilities.

## Table of Contents

- [Charts](#charts)
- [Core Contexts](#core-contexts)
- [Statistical Layers](#statistical-layers)
- [Visual Elements](#visual-elements)
- [Primitives](#primitives)
- [Hooks](#hooks)
- [Utilities](#utilities)
- [Types](#types)

## Charts

### Scatter

Scatter plot visualization.

```tsx
<Scatter<T>
  x: TypedAccessor<T, number>
  y: TypedAccessor<T, number>
  color?: NumericAttribute<T>
  colorScheme?: ColorScheme
  hoverLabel?: HoverLabel<T>
  children?: React.ReactNode
/>
```

**See:** [scatter.md](charts/scatter.md)

### LineChart

Line chart for time series and ordered data.

```tsx
<LineChart<T>
  x: NumericAttribute<T>
  y: NumericAttribute<T>
  color?: NumericAttribute<T>
  colorScheme?: ColorScheme
  xLabel?: string
  yLabel?: string
  invertY?: boolean
  continuity?: TypedAccessor<T, boolean>
  hoverLabel?: HoverLabel<T>
  strokeWidth?: number
  children?: React.ReactNode
/>
```

**See:** [line-chart.md](charts/line-chart.md)

### Histogram

Frequency or summary distribution visualization.

```tsx
<Histogram<T>
  x: NumericAttribute<T>
  summaryDimension: NumericAttribute<T>
  summaryStat: NumericAttribute<Stats>
  children?: React.ReactNode
/>
```

**See:** [histogram.md](charts/histogram.md)

### HeatMap

2D density or summary visualization.

```tsx
<HeatMap<T>
  x: NumericAttribute<T>
  y: NumericAttribute<T>
  color: NumericAttribute<T>
  stat?: NumericAttribute<Stats>  // default: "count"
  colorScheme?: ColorScheme       // default: "plasma"
  children?: React.ReactNode
/>
```

**See:** [heatmap.md](charts/heatmap.md)

### RibbonChart

Weighted percentile bands visualization.

```tsx
<RibbonChart<T>
  x: NumericAttribute<T>
  y: NumericAttribute<T>
  weightBy: NumericAttribute<T>
  children?: React.ReactNode
/>
```

**See:** [ribbon-chart.md](charts/ribbon-chart.md)

### SparkLineChart

Minimal inline charts.

```tsx
<SparkLineChart<T>
  x: NumericAttribute<T>
  y: NumericAttribute<T>
  color?: NumericAttribute<T>
  colorScheme?: ColorScheme
  yLabel?: string
  invertY?: boolean
  continuity?: TypedAccessor<T, boolean>
  hoverLabel?: HoverLabel<T>
  strokeWidth?: number           // default: 1
  children?: React.ReactNode
/>
```

**See:** [sparkline.md](charts/sparkline.md)

### Map

Geographic map with tiles and overlays.

```tsx
<Map<T>
  wmpX: TypedAccessor<T, number>
  wmpY: TypedAccessor<T, number>
  tileProvider: TileProvider
  strokeWidth?: number
  continuity?: TypedAccessor<T, boolean>
  zoomable?: boolean              // default: false
  hoverLabel?: HoverLabel<T>
  outline?: boolean
  legend?: boolean                // default: true
  coordinateTransform?: (wmpX: number, wmpY: number) => { x: number, y: number }
  color?: TypedAccessor<T, number>
  colorScale?: (datum: T) => string
  colorScheme?: ColorScheme
  children?: React.ReactNode
/>
```

**See:** [map.md](charts/map.md)

## Core Contexts

### Data

Provides data to child components.

```tsx
<Data value={data: unknown}>
  {children: React.ReactNode}
</Data>
```

**Hooks:**
- `useDataArray<T>(): T[]`
- `useDataObject(): { [key: string]: unknown } | null`
- `useDataDimensions<T>(): string[]`

**See:** [data-context.md](core-concepts/data-context.md)

### Subset

Filters data.

```tsx
<Subset
  filter={(value: unknown) => boolean}
  children: React.ReactNode
/>
```

**See:** [data-context.md#subset](core-concepts/data-context.md#subset)

### Grouped

Groups data and renders children for each group.

```tsx
<Grouped<T>
  by: TypedAccessor<T, any>
  children: React.ReactNode
/>
```

**See:** [data-context.md#grouped](core-concepts/data-context.md#grouped)

### DataFrame

Selects a partition from object of arrays.

```tsx
<DataFrame
  part: string
  children: React.ReactNode | ((data: unknown[]) => React.ReactNode)
/>
```

**See:** [data-context.md#dataframe](core-concepts/data-context.md#dataframe)

### Coordinates

Creates coordinate system with scales.

```tsx
<Coordinates<T>
  x: TypedAccessor<T, number>
  y: TypedAccessor<T, number>
  color?: NumericAttribute<T>
  colorScale?: (datum: T) => string
  colorScheme?: ColorScheme       // default: "turbo"
  xDisplayLabel?: string
  yDisplayLabel?: string
  children: React.ReactNode | ((context: CoordinateContextValue) => React.ReactNode)
/>
```

**See:** [coordinates.md](core-concepts/coordinates.md)

### Dimensions

Provides dimension metadata.

```tsx
<Dimensions value={dimensions: DimensionObject}>
  {children: React.ReactNode}
</Dimensions>

// DimensionObject
type DimensionObject = {
  [dimensionName: string]: Partial<DimensionDefinition>
}

interface DimensionDefinition {
  displayLabel: string
  units: string
  labelValue(value: number): string
  divisions: number[]
  stats?: Partial<Stats>
}
```

**See:** [dimensions.md](core-concepts/dimensions.md)

### SizedSVG

Responsive SVG container.

```tsx
<SizedSVG
  leftPad?: number
  rightPad?: number
  topPad?: number
  bottomPad?: number
  className?: string
  id?: string
  onHover?: (event: GestureEvent | null) => void
  onClick?: (event: GestureEvent) => void
  onPan?: (event: GestureEvent) => void
  onZoom?: (event: GestureEvent) => void
  children: React.ReactNode
/>
```

**See:** [sizing.md](core-concepts/sizing.md)

## Statistical Layers

### BinStats1d

1D binning and statistics.

```tsx
<BinStats1d<T>
  x: NumericAttribute<T>
  summaryDimension: NumericAttribute<T>
  summaryStat: NumericAttribute<Stats>
  children: React.ReactNode
/>
```

**See:** [bin-stats.md](statistical-layers/bin-stats.md)

### BinStats2d

2D binning and statistics.

```tsx
<BinStats2d<T>
  x: NumericAttribute<T>
  y: NumericAttribute<T>
  summaryDimension: NumericAttribute<T>
  summaryStat: NumericAttribute<Stats>
  colorScheme?: ColorScheme
  children: React.ReactNode
/>
```

**See:** [bin-stats.md](statistical-layers/bin-stats.md)

### ConvolutionalSmoother

Smooth noisy data.

```tsx
<ConvolutionalSmoother<T>
  on: NumericAttribute<T>
  size: number
  as?: NumericAttribute<T>         // default: same as 'on'
  fn?: ConvolutionFunctionName | ConvolutionFunction  // default: "gaussian"
  children: React.ReactNode
/>

// Built-in functions
type ConvolutionFunctionName = "gaussian" | "movingWindow" | "triangular"
```

**See:** [convolutional-smoother.md](statistical-layers/convolutional-smoother.md)

### SigmaFilter

Filter outliers based on standard deviation.

```tsx
<SigmaFilter<T>
  attribute: NumericAttribute<T>
  threshold: number               // e.g., 2 for 2σ
  children?: React.ReactNode
/>
```

**Utility:**
```tsx
sigmaFilter<T>(
  data: T[],
  attribute: NumericAttribute<T>,
  threshold: number
): T[]
```

**See:** [sigma-filter.md](statistical-layers/sigma-filter.md)

## Visual Elements

### XAxis

Horizontal axis.

```tsx
<XAxis />
```

**See:** [axes.md](visual-elements/axes.md)

### YAxis

Vertical axis.

```tsx
<YAxis label?: boolean />         // default: true
```

**See:** [axes.md](visual-elements/axes.md)

### ColorLegend

Continuous color legend.

```tsx
<ColorLegend<T>
  top?: boolean
  right?: boolean
  left?: boolean
  bottom?: boolean
  label?: string
  dimensionName?: NumericAttribute<T>
  background?: boolean | string  // default: false
/>
```

**See:** [legends.md](visual-elements/legends.md)

### CategoricalColorLegend

Discrete color legend.

```tsx
<CategoricalColorLegend<T>
  top?: boolean
  right?: boolean
  left?: boolean
  bottom?: boolean
  label?: string
  dimensionName?: NumericAttribute<T>
  background?: boolean | string  // default: false
/>
```

**See:** [legends.md](visual-elements/legends.md)

### Hover

Interactive hover labels.

```tsx
<Hover<T>
  hover: GestureEvent | null
  hoverLabel?: HoverLabel<T>
/>

type HoverLabel<T> = (d: T) => string | string[]
```

**See:** [hover.md](visual-elements/hover.md)

### Title

Chart title.

```tsx
<Title>
  {children?: React.ReactNode}
</Title>
```

**See:** [title.md](visual-elements/title.md)

## Primitives

### Path

Simple SVG path connecting points.

```tsx
<Path />
// Accepts SVG path props: stroke, strokeWidth, strokeDasharray, etc.
```

**See:** [paths.md](primitives/paths.md)

### FilledPath

Area chart with gradient.

```tsx
<FilledPath
  {...SVGPathElement props}
/>
```

**See:** [paths.md](primitives/paths.md)

### LineSegments

Advanced line rendering.

```tsx
<LineSegments<T>
  resolution?: number             // default: 0
  strokeWidth?: number            // default: 5
  continuity?: TypedAccessor<T, boolean>
  colorResolution?: number        // default: 5
  outline?: boolean               // default: false
/>
```

**See:** [paths.md](primitives/paths.md)

### PointCircles

Renders circles for scatter plots.

```tsx
<PointCircles<T> />
```

**See:** [scatter.md](charts/scatter.md)

### Tiles

Renders map tiles.

```tsx
<Tiles
  tileProvider: TileProvider
  zoomable: boolean
/>

type TileProvider = (x: number, y: number, z: number) => string
```

**See:** [shapes.md](primitives/shapes.md)

### GradientBar

Colored gradient rectangle.

```tsx
<GradientBar
  x: number
  y: number
  width: number
  height: number
  min: number
  max: number
  colorScale: (n: number) => string
/>
```

**See:** [shapes.md](primitives/shapes.md)

### TextWithBackground

Text with background box.

```tsx
<TextWithBackground
  x: number | string
  y: number | string
  padding?: number | string      // default: 0
  fill?: string                  // default: "rgba(255,255,255,0.75)"
  stroke?: string                // default: "none"
  strokeWidth?: number | string  // default: 1
  rx?: number                    // default: 5
  ry?: number                    // default: 5
  maxX?: number | string
  maxY?: number | string
  margin?: number | string
  fontSize?: number
  className?: string
  ref?: Ref<TextWithBackgroundRef>
>
  {children: React.ReactNode}
</TextWithBackground>

type TextWithBackgroundRef = {
  width: number
  height: number
  x: number
  y: number
} | null
```

**See:** [shapes.md](primitives/shapes.md)

## Hooks

### useLinearRegression

Compute linear regression for current data.

```tsx
function useLinearRegression<T>(): {
  m: number                       // Slope
  b: number                       // Y-intercept
  fn: (x: T) => number           // Prediction function
}
```

**See:** [linear-regression.md](statistical-layers/linear-regression.md)

### useSize

Measure element size.

```tsx
function useSize<T extends Element>(): {
  ref: RefObject<T>
  width: number
  height: number
  resizing: boolean
}
```

**See:** [sizing.md](core-concepts/sizing.md)

### useDataArray

Get current data as array.

```tsx
function useDataArray<T>(): T[]
```

### useDataObject

Get current data as object.

```tsx
function useDataObject(): { [key: string]: unknown } | null
```

### useDataDimensions

Get data dimension names.

```tsx
function useDataDimensions<T>(): string[]
```

## Utilities

### getDimension

Get dimension definition.

```tsx
function getDimension<T>(
  dimensionName: Dimension<T> | Function
): DimensionDefinition
```

### attrStats

Compute statistics for an attribute.

```tsx
function attrStats<T>(
  arr: T[],
  attr: TypedAccessor<T, number>
): Stats

interface Stats {
  count: number
  naCount: number
  min: number
  max: number
  range: number
  sum: number
  mean: number | null
  variance: number | null
  stdev: number | null
  median: number | null
}
```

### attrScale

Create a normalized scale (0-1).

```tsx
function attrScale<T>(
  arr: T[],
  scaleAttr: TypedAccessor<T, number>,
  override?: Partial<Stats>
): Scale<T>

interface Scale<T> extends Stats {
  (datum: T): null | number      // Returns 0-1
  scaleAttr: TypedAccessor<T, number>
}
```

### buildScale

Map normalized scale to pixel space.

```tsx
function buildScale<T>(
  statScale: Scale<T>,
  scaleTo: number,
  invert?: boolean               // default: false
): Scale<T>                      // Returns 0-scaleTo (or inverted)
```

### attributeValue

Get value from data using accessor.

```tsx
function attributeValue<T, V>(
  datum: T,
  attr: TypedAccessor<T, V>
): null | V
```

### attributeNumber

Get numeric value from data.

```tsx
function attributeNumber<T>(
  d: T,
  attribute: TypedAccessor<T, number>
): number
```

### smooth

Smooth data using convolution.

```tsx
function smooth<T>(
  data: T[],
  on: NumericAttribute<T>,
  as: NumericAttribute<T>,
  fnOrFnName: ConvolutionFunction | ConvolutionFunctionName,
  size: number
): T[]
```

### sigmaFilter

Filter outliers.

```tsx
function sigmaFilter<T>(
  data: T[],
  attribute: NumericAttribute<T>,
  threshold: number
): T[]
```

## Types

### Core Types

```tsx
// Accessors
type TypedAccessor<T, V> = KeysWithValueType<T, V> | AccessorFunction<T, V>
type NumericAttribute<T> = KeysWithValueType<T, number>
type Accessor<T> = Attribute<T> | AccessorFunction<T, any>
type Attribute<T> = keyof T
type AccessorFunction<T, V> = (d: T) => V

// Color
type ColorScheme = "viridis" | "inferno" | "magma" | "plasma" | "turbo" |
  "RdBu" | "RdYlBu" | "RdYlGn" | "spectral" | "cool" | "warm" | // ... see colors.ts

// Hover
type HoverLabel<T> = (d: T) => string | string[]

// Gestures
interface GestureEvent {
  x: number
  y: number
  dx: number
  dy: number
  width: number
  height: number
}

// Summary Stats
type SummaryStat = "mean" | "min" | "max" | "variance" | "stdev" |
  "range" | "median" | "count" | "sum"
```

### Context Types

```tsx
interface CoordinateContextValue {
  width: number
  height: number
  xScale?: Scale<any>
  yScale?: Scale<any>
  xStatScale?: Scale<any>
  yStatScale?: Scale<any>
  xStatValue?: (datum: any) => any
  yStatValue?: (datum: any) => any
  colorScale?: (datum: any) => string
  colorStatScale?: Scale<any>
  colorStatValue?: (datum: any) => number | null
  colorScheme?: ColorScheme
  x?: any
  y?: any
  color?: any
  xDisplayLabel?: string
  yDisplayLabel?: string
  topPad?: number
  bottomPad?: number
  leftPad?: number
  rightPad?: number
  binWidth?: number
  binHeight?: number
  [key: string]: any
}
```

## Version

This API reference is for chart-thing v0.0.1.

## Migration & Breaking Changes

As this is v0.0.1, the API may change in future versions. Check the main README and changelog for updates.
