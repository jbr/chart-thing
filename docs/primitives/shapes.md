# Shapes

Low-level shape components for custom visualizations.

## Overview

- **Tiles** - Renders map tiles from tile servers
- **GradientBar** - Colored gradient rectangle
- **TextWithBackground** - Text with background box and smart positioning

```tsx
import { Tiles, GradientBar, TextWithBackground } from 'chart-thing'
```

## Tiles

Renders tiled map images for geographic visualizations.

### Usage

```tsx
const tileProvider = (x, y, z) =>
  `https://tile.openstreetmap.org/${z}/${x}/${y}.png`

<MapCoordinates ...>
  <Tiles tileProvider={tileProvider} zoomable />
</MapCoordinates>
```

### Props

**tileProvider (required)**
- Function that returns tile URL
- **Type:** `(x: number, y: number, z: number) => string`

**zoomable (required)**
- Enable preloading of adjacent zoom levels
- **Type:** `boolean`

### How It Works

1. **Calculate zoom level** based on screen width and scale
2. **Determine visible tiles** from current viewport
3. **Preload tiles** using Image() constructor
4. **Render images** as SVG `<image>` elements

See src/Tiles.tsx for implementation.

### Zoom Calculation

```tsx
const zoom = Math.min(
  Math.ceil(Math.log2(width / 256 / xScale.range) + 0.25),
  16
)
```

Selects appropriate zoom level (0-16) based on map size and screen width.

### Preloading

When `zoomable={true}`:
- Preloads tiles for current zoom
- Preloads adjacent tiles (for panning)
- Preloads next zoom level (for zooming in)
- Preloads previous zoom level (for zooming out)

This provides smooth pan/zoom experience.

### Caching

Tiles are cached in-memory using a `Set`:

```tsx
const cache = new Set<string>()
```

Prevents re-downloading tiles during the session.

## GradientBar

Colored rectangle with horizontal gradient.

### Usage

```tsx
<GradientBar
  x={100}
  y={50}
  width={200}
  height={20}
  min={0}
  max={100}
  colorScale={(n) => d3.interpolateViridis(n / 100)}
/>
```

### Props

**x, y (required)**
- Position of rectangle
- **Type:** `number`

**width, height (required)**
- Size of rectangle
- **Type:** `number`

**min, max (required)**
- Range for color scale
- **Type:** `number`

**colorScale (required)**
- Function mapping value to color
- **Type:** `(n: number) => string`

### Implementation

Creates 101 gradient stops from min to max:

```tsx
<linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
  {new Array(101).fill(0).map((_, stop) => (
    <stop
      key={stop}
      offset={`${stop}%`}
      stopColor={colorScale(min + (max - min) * (stop / 100))}
    />
  ))}
</linearGradient>
```

See src/GradientBar.tsx.

### Example

```tsx
import { interpolateRdYlBu } from 'd3-scale-chromatic'

<GradientBar
  x={20}
  y={20}
  width={300}
  height={40}
  min={-10}
  max={10}
  colorScale={(n) => interpolateRdYlBu((n + 10) / 20)}
/>
```

## TextWithBackground

Text element with automatic background box and edge detection.

### Usage

```tsx
<TextWithBackground
  x={100}
  y={100}
  padding={10}
  fill="rgba(255,255,255,0.9)"
  stroke="black"
>
  Hover Label Text
</TextWithBackground>
```

### Props

**x, y (required)**
- Text position
- **Type:** `number | string`

**padding (optional)**
- Space between text and background
- **Type:** `number | string`
- **Default:** `0`

**fill (optional)**
- Background fill color
- **Type:** `string`
- **Default:** `"rgba(255,255,255,0.75)"`

**stroke, strokeWidth (optional)**
- Border styling
- **Type:** `string | number`

**rx, ry (optional)**
- Corner radius
- **Type:** `number`
- **Default:** `5`

**maxX, maxY (optional)**
- Boundaries for edge detection
- **Type:** `number | string`

**margin (optional)**
- Offset from x/y position
- **Type:** `number | string`

**fontSize, className (optional)**
- Text styling
- **Type:** `number | string`

### How It Works

1. **Renders text** and gets bounding box using `getBBox()`
2. **Draws background rect** sized to bbox + padding
3. **Checks boundaries** - if text would overflow maxX/maxY, shifts it
4. **Exposes dimensions** via ref for parent positioning

See src/TextWithBackground.tsx.

### Edge Detection

Automatically repositions to stay within bounds:

```tsx
<TextWithBackground
  x={700}  {/* Near right edge */}
  y={50}
  maxX={800}  {/* Chart width */}
  padding={10}
>
  This text will shift left to stay on screen
</TextWithBackground>
```

### Ref API

Access dimensions via ref:

```tsx
const ref = useRef<TextWithBackgroundRef>(null)

<TextWithBackground ref={ref} x={100} y={100}>
  Text
</TextWithBackground>

// Later:
if (ref.current) {
  const { width, height, x, y } = ref.current
}
```

Used by `Hover` component for positioning.

## Examples

### Map Tiles

```tsx
const osmTiles = (x, y, z) =>
  `https://tile.openstreetmap.org/${z}/${x}/${y}.png`

<Map
  wmpX="lon"
  wmpY="lat"
  tileProvider={osmTiles}
  zoomable
/>
```

### Custom Legend

```tsx
<GradientBar
  x={width - 220}
  y={20}
  width={200}
  height={30}
  min={0}
  max={100}
  colorScale={(n) => interpolatePlasma(n / 100)}
/>
<text x={width - 220} y={60}>0</text>
<text x={width - 20} y={60}>100</text>
```

### Hover Label

```tsx
<TextWithBackground
  x={hoverX}
  y={hoverY}
  padding={10}
  fill="white"
  stroke="blue"
  strokeWidth={2}
  maxX={width}
  maxY={height}
>
  <tspan x={hoverX + 15} y={hoverY + 20}>
    Value: {value.toFixed(2)}
  </tspan>
</TextWithBackground>
```

### Multi-Line Text Box

```tsx
<TextWithBackground x={50} y={50} padding={15}>
  {labels.map((label, i) => (
    <tspan key={i} x={65} y={65 + i * 20}>
      {label}
    </tspan>
  ))}
</TextWithBackground>
```

## TypeScript

```tsx
import { TextWithBackgroundRef } from 'chart-thing'

const ref = useRef<TextWithBackgroundRef>(null)

<TextWithBackground ref={ref} x={100} y={100}>
  Text
</TextWithBackground>
```

## Related Components

- [Map](../charts/map.md) - Uses Tiles
- [ColorLegend](../visual-elements/legends.md) - Uses GradientBar
- [Hover](../visual-elements/hover.md) - Uses TextWithBackground
