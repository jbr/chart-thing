# Title

Chart titles that automatically describe the visualization or display custom text.

## Overview

The `Title` component renders a title at the top of the chart, defaulting to "Y vs X" based on dimension names.

```tsx
import { Title } from 'chart-thing'

<Coordinates x="x" y="y">
  <Title />
</Coordinates>
```

## Basic Usage

### Automatic Title

```tsx
<Scatter x="temperature" y="humidity">
  <Title />
  {/* Displays: "humidity vs temperature" */}
</Scatter>
```

### Custom Title

```tsx
<Scatter x="x" y="y">
  <Title>My Custom Chart Title</Title>
</Scatter>
```

### With Display Labels

```tsx
<Coordinates
  x="temp"
  y="humid"
  xDisplayLabel="Temperature (°C)"
  yDisplayLabel="Humidity (%)"
>
  <Title />
  {/* Displays: "Humidity (%) vs Temperature (°C)" */}
</Coordinates>
```

## Props

### children (optional)

Custom title text:

```tsx
<Title>Sales Performance Q4 2024</Title>
```

**Type:** `React.ReactNode`

**Default:** Generates "Y vs X" from dimension names

## Title Generation

When no children provided:

1. Gets X and Y dimensions from `CoordinateContext`
2. Uses `xDisplayLabel` / `yDisplayLabel` if available
3. Falls back to `getDimension(x).displayLabel` / `getDimension(y).displayLabel`
4. Formats as: `"${yLabel} vs ${xLabel}"`

See src/Title.tsx:22-26.

## Positioning

Title position adapts to chart width:

**Width < 350px:**
- Left-aligned at `-leftPad / 2`
- `textAnchor="start"`

**Width ≥ 350px:**
- Center-aligned at `width / 2`
- `textAnchor="middle"`

Vertical position: `-topPad / 2` (centered in top padding)

See src/Title.tsx:28-46.

## Examples

### With Dimension Metadata

```tsx
const dimensions = {
  altitude: {
    displayLabel: 'Altitude',
    units: 'm',
  },
  distance: {
    displayLabel: 'Distance',
    units: 'km',
  },
}

<Dimensions value={dimensions}>
  <LineChart x="distance" y="altitude">
    <Title />
    {/* Displays: "Altitude vs Distance" */}
  </LineChart>
</Dimensions>
```

### Custom Title

```tsx
<Scatter x="x" y="y">
  <Title>Experimental Results - Trial #7</Title>
</Scatter>
```

### No Title

Simply don't include the component:

```tsx
<Scatter x="x" y="y">
  {/* No <Title /> = no title */}
</Scatter>
```

### Dynamic Title

```tsx
function DynamicChart({ data, selectedMetric }) {
  return (
    <Data value={data}>
      <Scatter x="x" y={selectedMetric}>
        <Title>
          Performance: {selectedMetric.toUpperCase()}
        </Title>
      </Scatter>
    </Data>
  )
}
```

## Styling

Titles use the CSS class `chart-title`:

```css
.chart-title {
  font-size: 16px;
  font-weight: bold;
  fill: #333;
}
```

Override in your CSS:

```css
.chart-title {
  font-size: 20px;
  font-weight: 600;
  fill: #000;
  font-family: 'Helvetica Neue', sans-serif;
}
```

## Responsive Behavior

The title automatically adjusts alignment based on chart width:

- **Small charts (< 350px):** Left-aligned to save space
- **Larger charts (≥ 350px):** Center-aligned for balance

This ensures readability across different chart sizes.

## Component Structure

```tsx
<text
  x={width < 350 ? -leftPad / 2 : width / 2}
  y={-topPad / 2}
  textAnchor={width < 350 ? "start" : "middle"}
  className="chart-title"
>
  {children || `${yLabel} vs ${xLabel}`}
</text>
```

## TypeScript

```tsx
<Title>
  {`Analysis: ${metric.name} (n=${data.length})`}
</Title>
```

## Related Components

- [Dimensions](../core-concepts/dimensions.md) - Provides display labels
- [Coordinates](../core-concepts/coordinates.md) - Provides dimension info
- [XAxis](axes.md) - Axis labels
- [YAxis](axes.md) - Axis labels
