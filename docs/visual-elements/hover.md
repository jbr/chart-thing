# Hover

Interactive hover labels that display data values on mouseover.

## Overview

The `Hover` component shows a tooltip when hovering over data points, with automatic positioning and a highlight marker.

```tsx
import { Hover } from 'chart-thing'

<SizedSVG onHover={setHover}>
  <Coordinates x="x" y="y">
    <PointCircles />
    <Hover hover={hover} hoverLabel={(d) => `Value: ${d.y}`} />
  </Coordinates>
</SizedSVG>
```

## Basic Usage

```tsx
function MyChart() {
  const [hover, setHover] = useState(null)

  return (
    <div style={{ width: '800px', height: '600px' }}>
      <Data value={data}>
        <SizedSVG onHover={setHover}>
          <Coordinates x="x" y="y" color="value">
            <PointCircles />
            <Hover
              hover={hover}
              hoverLabel={(d) => `x: ${d.x}, y: ${d.y}, value: ${d.value}`}
            />
          </Coordinates>
        </SizedSVG>
      </Data>
    </div>
  )
}
```

## Props

### hover (required)

Hover event from `SizedSVG`:

```tsx
const [hover, setHover] = useState<GestureEvent | null>(null)

<SizedSVG onHover={setHover}>
  <Hover hover={hover} />
</SizedSVG>
```

**Type:** `GestureEvent | null`

### hoverLabel (optional)

Function to generate label text:

```tsx
<Hover
  hover={hover}
  hoverLabel={(d) => `Temperature: ${d.temp}°C`}
/>
```

**Type:** `HoverLabel<T>` - `(datum: T) => string | string[]`

**Returns:**
- Single string: Single-line label
- Array of strings: Multi-line label

**Default:** Shows color dimension value

## How It Works

1. **Find nearest point** using Euclidean distance
2. **Check threshold** - only show if within 50px
3. **Calculate position** - place label near point
4. **Adjust for edges** - prevent overflow
5. **Highlight point** - draw target marker

See src/Hover.tsx for implementation.

### Nearest Point Algorithm

```tsx
const closest = _.minBy(data, (point) =>
  vector.distance({ x: xScale(point), y: yScale(point) }, hover)
)
```

Finds the data point whose screen position is closest to the mouse.

### Distance Threshold

```tsx
if (vector.distance(closestLoc, hover) >= 50) return null
```

If no point within 50px, no tooltip is shown.

### Edge Detection

The label automatically repositions to stay on-screen:

- If overflows right: shift left
- If overflows bottom: shift up

See src/Hover.tsx:48-55.

## Examples

### Single-Line Label

```tsx
<Hover
  hover={hover}
  hoverLabel={(d) => `${d.name}: ${d.value}`}
/>
```

### Multi-Line Label

```tsx
<Hover
  hover={hover}
  hoverLabel={(d) => [
    `Name: ${d.name}`,
    `Value: ${d.value}`,
    `Category: ${d.category}`,
  ]}
/>
```

### Formatted Values

```tsx
<Hover
  hover={hover}
  hoverLabel={(d) => {
    const date = new Date(d.timestamp).toLocaleDateString()
    const value = d.value.toFixed(2)
    return `${date}: $${value}`
  }}
/>
```

### Default Color Value

```tsx
// No hoverLabel prop - shows color dimension
<Scatter x="x" y="y" color="temperature">
  <Hover hover={hover} />
  {/* Shows "Temperature: 25.3" */}
</Scatter>
```

### Conditional Formatting

```tsx
<Hover
  hover={hover}
  hoverLabel={(d) => {
    const status = d.value > 100 ? '⚠️ High' : '✓ Normal'
    return [
      `Value: ${d.value}`,
      `Status: ${status}`,
    ]
  }}
/>
```

## Visual Elements

### Label Box

- White background with 90% opacity
- Stroke color matches point color
- 10px padding
- Positioned with 18px offset from point

### Target Marker

Three concentric circles:
- Outer: White with 25% opacity
- Middle: Point's color, 2px stroke
- Inner: Solid fill with point's color

See src/Hover.tsx:84-102.

## TypeScript

```tsx
interface DataPoint {
  temperature: number
  humidity: number
  location: string
}

<Hover<DataPoint>
  hover={hover}
  hoverLabel={(d) => `${d.location}: ${d.temperature}°C, ${d.humidity}%`}
/>
```

## Performance

### Large Datasets

Finding the nearest point is O(n) where n is the number of data points. For very large datasets (100,000+ points):

- Consider downsampling for hover
- Use spatial indexing (not built-in)
- Disable hover if performance is critical

### Optimization

The component only renders when `hover` is non-null, so there's no overhead when not hovering.

## Accessibility

Current implementation is visual-only. For accessibility:

- Consider adding ARIA labels
- Provide alternative keyboard navigation
- Display data in an accessible table

## Limitations

### 50px Threshold

Hardcoded 50px distance threshold. Points further away won't trigger hover, even if they're the nearest.

### Single Point

Only highlights one point at a time. For multi-series charts, it picks the globally nearest point, not one per series.

### No Touch Support

Optimized for mouse hover. Touch devices would need tap-and-hold or similar interaction.

## Related Components

- [SizedSVG](../core-concepts/sizing.md) - Provides hover events
- [Coordinates](../core-concepts/coordinates.md) - Provides scales
- [TextWithBackground](../primitives/shapes.md) - Label rendering
- [Scatter](../charts/scatter.md) - Common use case
