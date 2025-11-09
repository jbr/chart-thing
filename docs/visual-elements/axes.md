# Axes

X and Y axis components with automatic tick placement, labels, and grid lines.

## Overview

- **XAxis** - Horizontal axis at bottom of chart
- **YAxis** - Vertical axis at left of chart

Both components automatically compute appropriate tick positions based on data range and available space.

```tsx
import { XAxis, YAxis } from 'chart-thing'

<Coordinates x="x" y="y">
  <XAxis />
  <YAxis />
</Coordinates>
```

## Basic Usage

```tsx
<Data value={data}>
  <SizedSVG>
    <Coordinates x="temperature" y="humidity">
      <XAxis />
      <YAxis />
      <PointCircles />
    </Coordinates>
  </SizedSVG>
</Data>
```

## XAxis

### Features

- Min/max labels at endpoints
- Intermediate tick marks with labels
- Vertical grid lines
- Axis label (dimension name + units)
- Smart tick placement based on available space

### Implementation

See src/XAxis.tsx for full implementation.

**How it works:**
1. Gets dimension from `getDimension(x)`
2. Finds appropriate tick spacing from `dimension.divisions`
3. Ensures ticks are at least 75px apart (configurable)
4. Renders min, max, and intermediate ticks
5. Adds axis label at bottom center

### Customization

Axes use information from [Dimensions](../core-concepts/dimensions.md):

```tsx
const dimensions = {
  temperature: {
    displayLabel: 'Temperature',
    units: '°C',
    labelValue: (v) => `${v.toFixed(1)}°`,
    divisions: [-20, -10, 0, 10, 20, 30, 40],
  },
}

<Dimensions value={dimensions}>
  <Scatter x="temperature" y="humidity">
    <XAxis />  {/* Uses temperature dimensions */}
  </Scatter>
</Dimensions>
```

Or override the label directly:

```tsx
<Coordinates
  x="temp"
  y="humidity"
  xDisplayLabel="Temperature (Celsius)"
>
  <XAxis />
</Coordinates>
```

## YAxis

### Props

**label (optional)**
- Show/hide the Y-axis label
- **Type:** `boolean`
- **Default:** `true`

```tsx
<YAxis label={false} />  {/* No axis label */}
```

### Features

- Min/max labels
- Intermediate tick marks
- Horizontal grid lines
- Rotated axis label (-90°)
- 45° rotated tick labels
- Smart tick placement based on available space

### Implementation

See src/YAxis.tsx for full implementation.

Similar to XAxis but:
- Ticks are at least 50px apart
- Labels are rotated -45° for readability
- Axis label is rotated -90° and placed on left

## Examples

### Basic Axes

```tsx
<Scatter x="x" y="y">
  <XAxis />
  <YAxis />
</Scatter>
```

### Without Labels

```tsx
<SparkLineChart x="x" y="y">
  <YAxis label={false} />  {/* Just ticks, no label */}
</SparkLineChart>
```

### Custom Labels

```tsx
<Coordinates
  x="timestamp"
  y="value"
  xDisplayLabel="Time (UTC)"
  yDisplayLabel="Measurement (ppm)"
>
  <XAxis />
  <YAxis />
</Coordinates>
```

### With Dimension Definitions

```tsx
const dimensions = {
  altitude: {
    displayLabel: 'Altitude',
    units: 'm',
    labelValue: (v) => v < 1000 ? `${v}m` : `${(v/1000).toFixed(1)}km`,
    divisions: [0, 500, 1000, 2000, 3000, 4000, 5000],
  },
}

<Dimensions value={dimensions}>
  <LineChart x="distance" y="altitude">
    <XAxis />
    <YAxis />
  </LineChart>
</Dimensions>
```

## Tick Selection Algorithm

Both axes use the same approach:

1. **Get division options** from dimension (e.g., `[0.5, 1, 2, 5, 10, 25, ...]`)
2. **Calculate space** between ticks for each option
3. **Select first division** where space exceeds minimum (75px for X, 50px for Y)
4. **Generate ticks** at multiples of selected division within data range
5. **Add min/max** as explicit ticks

This ensures readable spacing regardless of data range.

### Example

For data range 0-100 with width=800px:

- Division=1: 100 ticks, 8px apart → too crowded
- Division=5: 20 ticks, 40px apart → too crowded
- Division=10: 10 ticks, 80px apart → **selected** ✓

## Grid Lines

Both axes render grid lines:

**XAxis:**
- Vertical lines at each tick
- `stroke="rgba(0,0,0,0.15)"` for subtle appearance
- Extend full height of plot area

**YAxis:**
- Horizontal lines at each tick
- Same styling as X grid
- Extend full width of plot area

## Styling

Axes use CSS classes for styling:

```css
.x-axis, .y-axis {
  /* Axis container */
}

.axis-label {
  /* Dimension name + units */
  font-size: 14px;
  fill: #333;
}

.axis-value {
  /* Tick labels */
  font-size: 12px;
  fill: #777;
}
```

Override in your CSS:

```css
.axis-label {
  font-weight: bold;
  font-size: 16px;
}

.axis-value {
  font-size: 10px;
  fill: #999;
}
```

## Performance

Axes are memoized and only re-render when:
- Data range changes
- Chart dimensions change
- Dimension definitions change

Tick calculation is O(1) based on division selection.

## Limitations

### Fixed Tick Spacing

Ticks are evenly spaced - no logarithmic or custom scales. For log scales, transform your data first.

### No Custom Tick Positions

You can't specify exact tick positions. Use `dimensions.divisions` to influence spacing, but the algorithm still selects from those options.

### Rotation

Tick labels have fixed rotation (-45° for Y-axis). Not configurable.

## Related Components

- [Dimensions](../core-concepts/dimensions.md) - Control axis labels and formatting
- [Coordinates](../core-concepts/coordinates.md) - Provides scale information
- [Title](title.md) - Chart titles
