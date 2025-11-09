# SparkLine

Sparklines are minimal inline charts designed to show trends in small spaces, typically without axes or labels.

## Overview

The `SparkLineChart` component is a compact line chart optimized for inline display with minimal padding and optional Y-axis ticks.

```tsx
import { SparkLineChart, Data } from 'chart-thing'

<Data value={data}>
  <SparkLineChart x="x" y="y" strokeWidth={1} />
</Data>
```

## Basic Usage

### Inline Sparkline

```tsx
const data = Array.from({ length: 50 }, (_, i) => ({
  x: i,
  y: Math.sin(i / 5) + Math.random() * 0.5,
}))

<div style={{ width: '150px', height: '40px', display: 'inline-block' }}>
  <Data value={data}>
    <SparkLineChart x="x" y="y" />
  </Data>
</div>
```

### In a Table

```tsx
<table>
  <tr>
    <td>Sales</td>
    <td>
      <div style={{ width: '100px', height: '30px' }}>
        <Data value={salesData}>
          <SparkLineChart x="week" y="sales" strokeWidth={2} />
        </Data>
      </div>
    </td>
  </tr>
</table>
```

## Props

### x (required)

X-axis data accessor:

```tsx
<SparkLineChart x="timestamp" y="value" />
```

**Type:** `NumericAttribute<T>`

### y (required)

Y-axis data accessor:

```tsx
<SparkLineChart x="x" y="y" />
```

**Type:** `NumericAttribute<T>`

### strokeWidth (optional)

Line thickness:

```tsx
<SparkLineChart x="x" y="y" strokeWidth={2} />
```

**Type:** `number`
**Default:** `1`

### color (optional)

Color dimension for gradient lines:

```tsx
<SparkLineChart x="x" y="y" color="value" colorScheme="viridis" />
```

**Type:** `NumericAttribute<T>`

### colorScheme (optional)

D3 color scale:

```tsx
<SparkLineChart x="x" y="y" color="value" colorScheme="turbo" />
```

**Type:** `ColorScheme`

### continuity (optional)

Control line breaks:

```tsx
<SparkLineChart
  x="x"
  y="y"
  continuity={(d) => d.valid}
/>
```

**Type:** `TypedAccessor<T, boolean>`

### invertY (optional)

Invert the Y-axis:

```tsx
<SparkLineChart x="x" y="depth" invertY />
```

**Type:** `boolean`
**Default:** `false`

### yLabel (optional)

Custom Y-axis label (though typically not shown in sparklines):

```tsx
<SparkLineChart x="x" y="y" yLabel="Value" />
```

**Type:** `string`

### hoverLabel (optional)

Hover tooltip function:

```tsx
<SparkLineChart
  x="x"
  y="y"
  hoverLabel={(d) => `Value: ${d.y}`}
/>
```

**Type:** `HoverLabel<T>`

### children (optional)

Additional elements:

```tsx
<SparkLineChart x="x" y="y">
  <circle cx={100} cy={20} r={2} fill="red" />
</SparkLineChart>
```

**Type:** `React.ReactNode`

## Differences from LineChart

Sparklines are designed for compact display:

1. **Minimal padding:** `bottomPad={10}, topPad={10}, leftPad={15}` (vs responsive padding)
2. **Y-axis ticks only:** No X-axis, no title by default
3. **Thin lines:** Default `strokeWidth={1}` (vs `5` for LineChart)
4. **No point compression:** `resolution={0}` to show all points
5. **Label-less Y-axis:** `<YAxis label={false} />`

See src/SparkLine.tsx:38-44 for the padding configuration.

## Examples

### Stock Price Sparkline

```tsx
<div style={{ width: '120px', height: '30px' }}>
  <Data value={stockPrices}>
    <SparkLineChart
      x={(d) => new Date(d.date).getTime()}
      y="close"
      strokeWidth={1.5}
    />
  </Data>
</div>
```

### Multiple Sparklines

```tsx
<div style={{ display: 'flex', gap: '10px' }}>
  {metrics.map(metric => (
    <div key={metric.name} style={{ width: '100px', height: '40px' }}>
      <Data value={metric.data}>
        <SparkLineChart x="x" y="y" />
      </Data>
    </div>
  ))}
</div>
```

### With Color Gradient

```tsx
<div style={{ width: '150px', height: '50px' }}>
  <Data value={data}>
    <SparkLineChart
      x="x"
      y="y"
      color="temperature"
      colorScheme="RdYlBu"
      strokeWidth={2}
    />
  </Data>
</div>
```

### Dashboard Sparklines

```tsx
<div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '20px',
}}>
  {dashboardMetrics.map(metric => (
    <div key={metric.id}>
      <h4>{metric.name}</h4>
      <div style={{ width: '100%', height: '60px' }}>
        <Data value={metric.timeSeries}>
          <SparkLineChart x="timestamp" y="value" />
        </Data>
      </div>
      <div>{metric.currentValue}</div>
    </div>
  ))}
</div>
```

## TypeScript

```tsx
interface TimeSeriesPoint {
  timestamp: number
  value: number
}

<Data value={data}>
  <SparkLineChart<TimeSeriesPoint>
    x="timestamp"
    y="value"
  />
</Data>
```

## Best Practices

### 1. Keep It Simple

Sparklines are meant to show trends at a glance. Avoid:
- Hover labels (unless necessary)
- Color gradients (unless meaningful)
- Overlays or annotations

### 2. Consistent Sizing

Use consistent dimensions across related sparklines for easy comparison:

```tsx
const SPARKLINE_SIZE = { width: '120px', height: '40px' }

<div style={SPARKLINE_SIZE}>
  <SparkLineChart x="x" y="y" />
</div>
```

### 3. Appropriate Context

Sparklines work best when:
- Space is limited (tables, dashboards, lists)
- Showing relative trends, not exact values
- Multiple sparklines are displayed together

### 4. Consider Line Width

Thicker lines (2-3px) work better for:
- Smaller sparklines
- When precise values matter less

Thinner lines (1px) for:
- Larger sparklines
- Dense data

## Performance

Sparklines render all points (no compression), but:
- Small dimensions = fewer pixels to render
- Works well up to ~500 points
- For more points, consider sampling

## Component Structure

Internally, `SparkLineChart` creates:

```tsx
<SizedSVG bottomPad={10} topPad={10} leftPad={15} onHover={setHover}>
  <Coordinates x={x} y={y} color={color} colorScheme={colorScheme} invertY={invertY}>
    <YAxis label={false} />
    <LineSegments resolution={0} continuity={continuity} strokeWidth={strokeWidth} />
    {children}
    <Hover hover={hover} hoverLabel={hoverLabel} />
  </Coordinates>
</SizedSVG>
```

See src/SparkLine.tsx for implementation.

## Comparison with Other Chart Types

**Use SparkLine when:**
- Space is extremely limited
- Showing trends, not exact values
- Displaying many charts together

**Consider alternatives:**
- **LineChart** - For full-featured line plots with axes and labels
- **Scatter** - For precise individual values

## Related Components

- [LineChart](line-chart.md) - Full-featured line charts
- [LineSegments](../primitives/paths.md) - Low-level line rendering
- [YAxis](../visual-elements/axes.md) - Axis rendering
