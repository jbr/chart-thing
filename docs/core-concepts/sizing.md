# Sizing

The SizedSVG component creates responsive charts that automatically adapt to their container size. It handles measuring, padding, and coordinate system setup.

## Overview

`SizedSVG` creates a wrapper div that:
1. Measures its own size using ResizeObserver
2. Creates an SVG with calculated dimensions
3. Applies padding to create a plotting area
4. Provides width/height through CoordinateContext

```tsx
import { SizedSVG, Coordinates } from 'chart-thing'

<div style={{ width: '800px', height: '600px' }}>
  <SizedSVG>
    <Coordinates x="x" y="y">
      {/* Your chart */}
    </Coordinates>
  </SizedSVG>
</div>
```

## Critical Requirement: Parent Container Sizing

**IMPORTANT:** The parent container of `SizedSVG` must have explicit width and height.

### ✅ Correct Usage

```tsx
// Explicit pixel dimensions
<div style={{ width: '800px', height: '600px' }}>
  <SizedSVG>
    <Scatter x="x" y="y" />
  </SizedSVG>
</div>

// Percentage of a sized parent
<div style={{ width: '100vw', height: '100vh' }}>
  <div style={{ width: '80%', height: '500px' }}>
    <SizedSVG>
      <Scatter x="x" y="y" />
    </SizedSVG>
  </div>
</div>

// Using CSS classes
<div className="chart-container">  {/* .chart-container { width: 800px; height: 600px; } */}
  <SizedSVG>
    <Scatter x="x" y="y" />
  </SizedSVG>
</div>
```

### ❌ Incorrect Usage

```tsx
// No height - chart won't render
<div style={{ width: '100%' }}>
  <SizedSVG>
    <Scatter x="x" y="y" />
  </SizedSVG>
</div>

// Percentage height without sized ancestor
<div style={{ width: '100%', height: '100%' }}>  {/* Parent has no height */}
  <SizedSVG>
    <Scatter x="x" y="y" />
  </SizedSVG>
</div>

// No sizing at all
<div>
  <SizedSVG>
    <Scatter x="x" y="y" />
  </SizedSVG>
</div>
```

## How It Works

### Measurement

`SizedSVG` uses the `useSize` hook (src/useSize.ts:4-55) which:

1. Creates a ref to the wrapper div
2. Uses ResizeObserver to watch for size changes
3. Updates width/height state when the container resizes
4. Hides content while `resizing` is true to prevent flicker

### Padding

Padding creates margins around the plot area for axes and labels:

```tsx
<SizedSVG leftPad={100} rightPad={50} topPad={75} bottomPad={75}>
  {/* Plotting area is width - 150, height - 150 */}
</SizedSVG>
```

**Default padding** (responsive based on size):

```tsx
// For width < 350: left=50, right=25
// For width < 700: left=75, right=50
// For width >= 700: left=100, right=100

// For height < 350: top=50, bottom=50
// For height < 700: top=75, bottom=75
// For height >= 700: top=100, bottom=100
```

See src/SizedSVG.tsx:19-61 for the padding calculation logic.

### Coordinate System

The SVG uses a transform to shift the origin by the padding:

```tsx
<svg width={width} height={height}>
  <g transform={`translate(${leftPad} ${topPad})`}>
    {/* Children render here */}
  </g>
</svg>
```

This means child components draw in a coordinate system where:
- (0, 0) is the top-left of the plot area (after padding)
- (width, height) is the bottom-right of the plot area

## Custom Padding

### Fixed Padding

```tsx
<SizedSVG leftPad={120} rightPad={60} topPad={40} bottomPad={80}>
  <Coordinates x="x" y="y">
    <YAxis />  {/* Has 120px on the left for labels */}
    <XAxis />  {/* Has 80px on the bottom for labels */}
  </Coordinates>
</SizedSVG>
```

### No Padding

```tsx
<SizedSVG leftPad={0} rightPad={0} topPad={0} bottomPad={0}>
  {/* Full-bleed chart */}
</SizedSVG>
```

Useful for:
- Sparklines
- Small multiples
- Charts without axes

### Asymmetric Padding

```tsx
<SizedSVG leftPad={150} rightPad={50} topPad={30} bottomPad={100}>
  {/* More space on left for Y-axis labels */}
  {/* More space on bottom for rotated X-axis labels */}
</SizedSVG>
```

## Responsive Charts

### Percentage Width

```tsx
<div style={{ width: '100%', maxWidth: '1200px', height: '600px', margin: '0 auto' }}>
  <SizedSVG>
    <Scatter x="x" y="y" />
  </SizedSVG>
</div>
```

The chart will resize when the container width changes.

### Container Queries

```tsx
const [containerSize, setContainerSize] = useState({ width: 800, height: 600 })

<div style={{ width: containerSize.width, height: containerSize.height }}>
  <SizedSVG>
    <Scatter x="x" y="y" />
  </SizedSVG>
</div>
```

### CSS Grid/Flexbox

```tsx
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', height: '600px' }}>
  <SizedSVG>
    <Scatter x="x" y="y" data={data1} />
  </SizedSVG>

  <SizedSVG>
    <Scatter x="x" y="y" data={data2} />
  </SizedSVG>
</div>
```

Both charts automatically fill their grid cells.

## Accessing Size Information

Components inside `SizedSVG` can access width/height through `CoordinateContext`:

```tsx
import { useContext } from 'react'
import { CoordinateContext } from 'chart-thing'

function MyComponent() {
  const { width, height, leftPad, rightPad, topPad, bottomPad } = useContext(CoordinateContext)

  return (
    <text x={width / 2} y={height / 2}>
      Chart is {width}x{height}
    </text>
  )
}
```

## Gesture Handling

`SizedSVG` includes gesture support via `useMapGestures` (src/useMapGestures.ts):

```tsx
<SizedSVG
  onHover={(event) => console.log('Hover at', event)}
  onClick={(event) => console.log('Clicked', event)}
  onPan={(event) => console.log('Panning', event)}
  onZoom={(event) => console.log('Zooming', event)}
>
  {/* Your chart */}
</SizedSVG>
```

See [Map documentation](../charts/map.md) for details on gesture events.

## Performance

### Resize Handling

While resizing, the chart hides to prevent expensive re-renders:

```tsx
{resizing ? null : (
  <svg>{/* chart */}</svg>
)}
```

This prevents lag during window resize.

### Debouncing

ResizeObserver updates are automatically debounced by the browser. chart-thing doesn't add additional debouncing.

For expensive charts, consider wrapping in your own debounce:

```tsx
const [size, setSize] = useState({ width: 800, height: 600 })
const debouncedSize = useDebounce(size, 200)

<div style={{ width: debouncedSize.width, height: debouncedSize.height }}>
  <SizedSVG>
    {/* Expensive chart */}
  </SizedSVG>
</div>
```

## Common Patterns

### Full-Screen Chart

```tsx
<div style={{ width: '100vw', height: '100vh' }}>
  <SizedSVG>
    <Scatter x="x" y="y" />
  </SizedSVG>
</div>
```

### Chart in Modal/Dialog

```tsx
<Dialog open={open}>
  <div style={{ width: '90vw', maxWidth: '1000px', height: '600px' }}>
    <SizedSVG>
      <Scatter x="x" y="y" />
    </SizedSVG>
  </div>
</Dialog>
```

### Dashboard Grid

```tsx
<div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
  gap: '20px',
  padding: '20px',
}}>
  {charts.map((chart, i) => (
    <div key={i} style={{ height: '300px' }}>
      <SizedSVG>
        <Scatter x="x" y="y" data={chart.data} />
      </SizedSVG>
    </div>
  ))}
</div>
```

### Sparkline (No Padding)

```tsx
<div style={{ width: '100px', height: '30px', display: 'inline-block' }}>
  <SizedSVG leftPad={0} rightPad={0} topPad={0} bottomPad={0}>
    <SparkLine x="x" y="y" />
  </SizedSVG>
</div>
```

### Aspect Ratio

```tsx
// Maintain 16:9 aspect ratio
<div style={{ width: '100%', maxWidth: '800px' }}>
  <div style={{ paddingBottom: '56.25%', position: 'relative' }}>
    <div style={{ position: 'absolute', inset: 0 }}>
      <SizedSVG>
        <Scatter x="x" y="y" />
      </SizedSVG>
    </div>
  </div>
</div>
```

## Troubleshooting

### Chart Doesn't Appear

**Problem:** Chart renders but is invisible or 0x0.

**Solution:** Ensure parent has explicit height:

```tsx
// Add explicit height
<div style={{ height: '600px' }}>
  <SizedSVG>...</SizedSVG>
</div>
```

### Chart Flickers on Resize

**Problem:** Chart flickers or shows old content during resize.

**Solution:** This is expected behavior. `SizedSVG` hides content while `resizing` is true. If flicker is problematic, you can override this:

```tsx
// Custom SizedSVG wrapper without hiding
const { ref, width, height } = useSize()

<div ref={ref}>
  <svg width={width} height={height}>
    {/* Your chart */}
  </svg>
</div>
```

### Padding Too Large/Small

**Problem:** Default padding doesn't work for your use case.

**Solution:** Set explicit padding:

```tsx
<SizedSVG leftPad={200} rightPad={50} topPad={50} bottomPad={100}>
  {/* Adjusted for long Y-axis labels */}
</SizedSVG>
```

### Layout Shift on Load

**Problem:** Page layout shifts when chart measures itself.

**Solution:** Set explicit container dimensions:

```tsx
// Instead of letting it measure
<div>
  <SizedSVG>...</SizedSVG>
</div>

// Set explicit size to prevent layout shift
<div style={{ width: '800px', height: '600px' }}>
  <SizedSVG>...</SizedSVG>
</div>
```

## Component Reference

### SizedSVG

**Props:**
- `leftPad?: number` - Left padding in pixels (default: responsive)
- `rightPad?: number` - Right padding in pixels (default: responsive)
- `topPad?: number` - Top padding in pixels (default: responsive)
- `bottomPad?: number` - Bottom padding in pixels (default: responsive)
- `className?: string` - CSS class for the SVG element
- `id?: string` - ID for the SVG element
- `onHover?: (event: GestureEvent | null) => void` - Hover event handler
- `onClick?: (event: GestureEvent) => void` - Click event handler
- `onPan?: (event: GestureEvent) => void` - Pan event handler
- `onZoom?: (event: GestureEvent) => void` - Zoom event handler
- `children: React.ReactNode` - Child components

**Context Provided:**

Extends the existing `CoordinateContext` with:
- `width: number` - Plot area width (after padding)
- `height: number` - Plot area height (after padding)
- `leftPad: number` - Left padding
- `rightPad: number` - Right padding
- `topPad: number` - Top padding
- `bottomPad: number` - Bottom padding

### useSize

A hook for measuring element size:

```tsx
import { useSize } from 'chart-thing'

function MyComponent() {
  const { ref, width, height, resizing } = useSize<HTMLDivElement>()

  return (
    <div ref={ref}>
      Size: {width} x {height}
      {resizing && <span>Resizing...</span>}
    </div>
  )
}
```

**Returns:**
- `ref: RefObject<T>` - Ref to attach to the element to measure
- `width: number` - Current width in pixels
- `height: number` - Current height in pixels
- `resizing: boolean` - True while size is changing

## Best Practices

### 1. Always Size the Parent

Never rely on SizedSVG to size itself - it measures the parent.

```tsx
// Good
<div style={{ width: '800px', height: '600px' }}>
  <SizedSVG>...</SizedSVG>
</div>

// Bad
<SizedSVG style={{ width: '800px', height: '600px' }}>  {/* Won't work! */}
  ...
</SizedSVG>
```

### 2. Use Appropriate Padding

More complex charts need more padding:

```tsx
// Simple sparkline
<SizedSVG leftPad={0} rightPad={0} topPad={0} bottomPad={0} />

// Standard scatter plot
<SizedSVG />  {/* Use defaults */}

// Chart with long labels
<SizedSVG leftPad={150} bottomPad={120} />
```

### 3. Consistent Sizing for Comparisons

When comparing multiple charts, use the same size:

```tsx
const chartSize = { width: '600px', height: '400px' }

<div style={chartSize}>
  <SizedSVG><Scatter data={data1} /></SizedSVG>
</div>

<div style={chartSize}>
  <SizedSVG><Scatter data={data2} /></SizedSVG>
</div>
```

### 4. CSS for Responsive Layouts

Use CSS (flex, grid, percentage) for responsive layouts, not inline styles:

```css
.chart-container {
  width: 100%;
  max-width: 1200px;
  height: 600px;
  margin: 0 auto;
}
```

```tsx
<div className="chart-container">
  <SizedSVG>...</SizedSVG>
</div>
```

## Integration with Other Components

Most chart components automatically wrap content in `SizedSVG`:

```tsx
// These are equivalent
<Scatter x="x" y="y" />

<SizedSVG>
  <Coordinates x="x" y="y">
    <Title />
    <XAxis />
    <YAxis />
    <ColorLegend />
    <PointCircles />
  </Coordinates>
</SizedSVG>
```

So you typically don't need to use `SizedSVG` directly unless you're building custom charts from primitives.
