# Legends

Color legends for continuous and categorical data.

## Overview

- **ColorLegend** - Gradient legend for continuous color scales
- **CategoricalColorLegend** - Discrete legend for categorical data

```tsx
import { ColorLegend, CategoricalColorLegend } from 'chart-thing'

// Continuous
<ColorLegend top right />

// Categorical
<CategoricalColorLegend top left />
```

## ColorLegend

For continuous numeric color dimensions.

### Props

**top, bottom, left, right (optional)**
- Position the legend
- **Type:** `boolean`
- **Default:** `top=true, right=true`

```tsx
<ColorLegend top right />      {/* Top-right (default) */}
<ColorLegend bottom left />    {/* Bottom-left */}
```

**dimensionName (optional)**
- Override dimension name
- **Type:** `NumericAttribute<T>`

**background (optional)**
- Add background rectangle
- **Type:** `boolean | string`
- **Default:** `false`

```tsx
<ColorLegend background />                        {/* White background */}
<ColorLegend background="rgba(0,0,0,0.8)" />    {/* Custom background */}
```

### Features

- Horizontal gradient bar
- Min/max/intermediate labels
- Automatic label count based on width
- Dimension name as title
- Optional semi-transparent background

### Example

```tsx
<Data value={data}>
  <Scatter x="x" y="y" color="temperature" colorScheme="viridis">
    <ColorLegend top right background />
  </Scatter>
</Data>
```

### Label Count

Legend adapts label count to available space:

- Width ≤ 100px: 2 labels (min, max)
- Width < 200px: 3 labels (min, mid, max)
- Width ≥ 200px: 5 labels (0%, 25%, 50%, 75%, 100%)

See src/ColorLegend.tsx:44-49.

## CategoricalColorLegend

For discrete categories.

### Props

Same positioning props as `ColorLegend`.

### Features

- Colored squares for each category
- Category labels
- Automatic sizing based on label length
- Limits to 25 unique values

### Example

```tsx
<Data value={data}>
  <Grouped by="species">
    <Scatter x="sepalLength" y="sepalWidth">
      <CategoricalColorLegend top right background />
    </Scatter>
  </Grouped>
</Data>
```

### Unique Values

The legend automatically extracts unique values from data:

```tsx
const uniqueValues = data.reduce((values, d) => {
  if (values.size < 25) values.add(attributeValue(d, color))
  return values
}, new Set())
```

Limits to 25 to prevent oversized legends.

## Positioning

Both legends support four corner positions:

```tsx
// Top-right (default)
<ColorLegend top right />

// Top-left
<ColorLegend top left />

// Bottom-right
<ColorLegend bottom right />

// Bottom-left
<ColorLegend bottom left />
```

Conflicts (e.g., both `top` and `bottom`) throw an error.

## Examples

### Map with Legend

```tsx
<Map
  wmpX="lon"
  wmpY="lat"
  color="speed"
  colorScheme="RdYlGn"
  tileProvider={tiles}
  legend  {/* ColorLegend included by default */}
/>
```

### Legend with Background

```tsx
<Scatter x="x" y="y" color="value" colorScheme="plasma">
  <ColorLegend top right background />
</Scatter>
```

Useful when legend overlaps data.

### Multiple Legends

For multi-variable visualizations:

```tsx
<SizedSVG>
  <Coordinates x="x" y="y" color="temperature">
    <PointCircles />
    <ColorLegend top right dimensionName="temperature" />
  </Coordinates>

  <Coordinates x="x" y="y" color="humidity">
    <PointCircles opacity={0.3} />
    <ColorLegend bottom right dimensionName="humidity" />
  </Coordinates>
</SizedSVG>
```

## Customization

### Via Dimensions

```tsx
const dimensions = {
  temperature: {
    displayLabel: 'Temperature',
    units: '°C',
    labelValue: (v) => `${v.toFixed(1)}°`,
  },
}

<Dimensions value={dimensions}>
  <Scatter x="x" y="y" color="temperature">
    <ColorLegend />  {/* Uses dimension metadata */}
  </Scatter>
</Dimensions>
```

### Custom Background

```tsx
<ColorLegend
  top
  right
  background="linear-gradient(to bottom, rgba(255,255,255,0.9), rgba(255,255,255,0.7))"
/>
```

## Styling

Legends use CSS classes:

```css
.color-legend {
  /* Continuous legend container */
}

.categorical-color-legend {
  /* Categorical legend container */
}
```

## Performance

Legends are memoized and only re-render when:
- Position props change
- Color scale changes
- Data changes (for categorical)
- Dimensions change

## Related Components

- [Coordinates](../core-concepts/coordinates.md) - Color scale creation
- [Dimensions](../core-concepts/dimensions.md) - Label formatting
- [Grouped](../core-concepts/data-context.md) - Categorical coloring
