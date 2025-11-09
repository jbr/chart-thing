# Dimensions

The Dimensions system provides metadata for data attributes - display labels, units, formatting functions, and scale overrides. This separates presentation concerns from your data structure.

## Overview

Dimensions define how to display and format data attributes:

```tsx
import { Dimensions } from 'chart-thing'

const dimensions = {
  temperature: {
    displayLabel: 'Temperature',
    units: '°C',
    labelValue: (value) => `${value.toFixed(1)}°C`,
  },
  humidity: {
    displayLabel: 'Relative Humidity',
    units: '%',
    labelValue: (value) => `${Math.round(value)}%`,
  },
}

<Dimensions value={dimensions}>
  <Data value={data}>
    <Scatter x="temperature" y="humidity" />
  </Data>
</Dimensions>
```

Now axes, legends, and hover labels will use these display settings.

## Basic Usage

### Defining Dimensions

```tsx
const dimensions = {
  altitude: {
    displayLabel: 'Altitude',
    units: 'm',
    labelValue: (value) => `${Math.round(value)}m`,
    divisions: [100, 250, 500, 1000, 2500, 5000],
  },
}
```

### Applying Dimensions

Wrap your app or chart with the `Dimensions` provider:

```tsx
<Dimensions value={dimensions}>
  {/* All charts here can access dimension metadata */}
  <Scatter x="altitude" y="temperature" />
</Dimensions>
```

## Dimension Properties

### displayLabel

Human-readable label for the dimension:

```tsx
{
  tempCelsius: {
    displayLabel: 'Temperature (Celsius)',
  }
}
```

Used by `XAxis`, `YAxis`, `Title`, and legends.

**Default:** Converts camelCase to spaces and lowercases:
- `tempCelsius` → `"temp celsius"`
- `maxValue` → `"max value"`

### units

Unit string for the dimension:

```tsx
{
  distance: {
    units: 'km',
  }
}
```

Currently informational - used by `displayLabel` in most components.

### labelValue

Function to format values for display:

```tsx
{
  price: {
    labelValue: (value) => `$${value.toFixed(2)}`,
  },
  percentage: {
    labelValue: (value) => `${(value * 100).toFixed(1)}%`,
  },
  timestamp: {
    labelValue: (value) => new Date(value).toLocaleDateString(),
  },
}
```

Used by axes for tick labels and hover components for data display.

**Default:** Rounds to nearest integer:
```tsx
labelValue: (value) => Math.round(value).toString()
```

See src/Dimensions.tsx:26-28 for the default implementation.

### divisions

Array of preferred tick values for axes:

```tsx
{
  altitude: {
    divisions: [0, 500, 1000, 2000, 3000, 4000, 5000],
  },
  probability: {
    divisions: [0, 0.25, 0.5, 0.75, 1.0],
  },
}
```

Axes will try to use these values for ticks when possible.

**Default:**
```tsx
[0.5, 1, 2, 5, 10, 25, 50, 100, 250, 500, 1000, 5000]
```

### stats

Override scale ranges:

```tsx
{
  percentage: {
    stats: {
      min: 0,
      max: 100,
    },
  },
  score: {
    stats: {
      min: 0,
      max: 10,
    },
  },
}
```

This forces the scale to use these bounds instead of computing from data.

**Use cases:**
- Ensure scales start at zero
- Match scales across multiple charts
- Clip outliers
- Set fixed ranges for familiar metrics

## Accessing Dimensions

### In Components

Use the `getDimension` function:

```tsx
import { getDimension } from 'chart-thing'

function MyAxis({ dimension }) {
  const dim = getDimension(dimension)

  return (
    <text>
      {dim.displayLabel} ({dim.units})
    </text>
  )
}
```

This is used internally by `XAxis` and `YAxis` - see src/XAxis.tsx and src/YAxis.tsx.

### Type-Safe Access

```tsx
type Dimension<T> = keyof T

interface DataPoint {
  temperature: number
  humidity: number
}

function MyComponent({ dim }: { dim: Dimension<DataPoint> }) {
  const dimension = getDimension(dim)  // Type-safe!
}
```

## Default Behavior

If a dimension isn't defined, `getDimension` returns sensible defaults:

```tsx
getDimension('someUndefinedDimension')
// Returns:
// {
//   displayLabel: 'some undefined dimension',
//   units: '',
//   labelValue: (value) => Math.round(value).toString(),
//   divisions: [0.5, 1, 2, 5, 10, 25, 50, 100, 250, 500, 1000, 5000],
// }
```

This means dimensions are optional - chart-thing works fine without them, they just improve formatting.

## Common Patterns

### Temperature

```tsx
const dimensions = {
  tempCelsius: {
    displayLabel: 'Temperature',
    units: '°C',
    labelValue: (v) => `${v.toFixed(1)}°C`,
    divisions: [-20, -10, 0, 10, 20, 30, 40],
  },
  tempFahrenheit: {
    displayLabel: 'Temperature',
    units: '°F',
    labelValue: (v) => `${v.toFixed(1)}°F`,
    divisions: [0, 32, 50, 70, 90, 110],
  },
}
```

### Distance

```tsx
const dimensions = {
  distanceMeters: {
    displayLabel: 'Distance',
    units: 'm',
    labelValue: (v) => v < 1000
      ? `${Math.round(v)}m`
      : `${(v / 1000).toFixed(1)}km`,
    divisions: [100, 250, 500, 1000, 2500, 5000, 10000],
  },
}
```

### Money

```tsx
const dimensions = {
  price: {
    displayLabel: 'Price',
    units: 'USD',
    labelValue: (v) => `$${v.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`,
    divisions: [1, 5, 10, 25, 50, 100, 500, 1000],
  },
}
```

### Time

```tsx
const dimensions = {
  timestamp: {
    displayLabel: 'Time',
    labelValue: (v) => new Date(v).toLocaleString(),
  },
  date: {
    displayLabel: 'Date',
    labelValue: (v) => new Date(v).toLocaleDateString(),
  },
  hour: {
    displayLabel: 'Hour',
    labelValue: (v) => `${v}:00`,
    divisions: [0, 3, 6, 9, 12, 15, 18, 21],
  },
}
```

### Percentages

```tsx
const dimensions = {
  percentage: {
    displayLabel: 'Percentage',
    units: '%',
    labelValue: (v) => `${v.toFixed(1)}%`,
    divisions: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
    stats: { min: 0, max: 100 },
  },
  proportion: {
    displayLabel: 'Proportion',
    labelValue: (v) => v.toFixed(3),
    divisions: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
    stats: { min: 0, max: 1 },
  },
}
```

## Utility Functions

### dimensionsWithLabels

Create a simple label mapping:

```tsx
import { dimensionsWithLabels } from 'chart-thing'

const labels = dimensionsWithLabels('temperature', 'humidity', 'pressure')
// Returns:
// {
//   temperature: 'temperature',
//   humidity: 'humidity',
//   pressure: 'pressure',
// }
```

Useful for generating dimension objects programmatically.

## Scale Overrides

The `stats` property is particularly powerful for controlling scales:

### Force Zero Baseline

```tsx
{
  count: {
    stats: { min: 0 },  // Always start at zero
  }
}
```

### Fixed Range

```tsx
{
  score: {
    stats: { min: 0, max: 100 },  // Always 0-100
  }
}
```

### Symmetrical Scale

```tsx
{
  change: {
    stats: { min: -10, max: 10 },  // Centered at zero
  }
}
```

These overrides are applied in `attrScale` (src/common.ts:125-138):

```tsx
const stats = Object.assign(attrStats(arr, scaleAttr), override)
```

## Component Reference

### Dimensions

**Props:**
- `value: DimensionObject` - Object mapping dimension names to definitions
- `children: React.ReactNode` - Child components

### DimensionDefinition

**Type:**
```tsx
interface DimensionDefinition {
  displayLabel: string
  units: string
  labelValue(value: number): string
  divisions: number[]
  stats?: Partial<Stats>
}
```

All properties are optional. Defaults are provided for missing properties.

### getDimension

**Function:**
```tsx
function getDimension<T>(
  dimensionName: Dimension<T> | Function
): DimensionDefinition
```

Returns the dimension definition, merging user-provided values with defaults.

## TypeScript

Dimensions work with TypeScript:

```tsx
interface DataPoint {
  x: number
  y: number
  category: string
}

const dimensions: Record<keyof DataPoint, Partial<DimensionDefinition>> = {
  x: { displayLabel: 'X Coordinate' },
  y: { displayLabel: 'Y Coordinate' },
  category: { displayLabel: 'Category' },
}
```

## Best Practices

### 1. Define Dimensions Once

Create a central dimensions definition:

```tsx
// dimensions.ts
export const appDimensions = {
  temperature: { /* ... */ },
  humidity: { /* ... */ },
  pressure: { /* ... */ },
}

// App.tsx
<Dimensions value={appDimensions}>
  <Routes />
</Dimensions>
```

### 2. Use labelValue for Formatting

Keep formatting logic in dimensions, not scattered through components:

```tsx
// Good
{
  value: {
    labelValue: (v) => formatNumber(v),
  }
}

// Avoid formatting in every component
<text>{formatNumber(value)}</text>  // Repeated everywhere
```

### 3. Consistent Units

Use dimension definitions to ensure consistent unit display:

```tsx
const dimensions = {
  altitude: {
    units: 'm',
    labelValue: (v) => `${Math.round(v)}m`,
  },
}
```

Now all altitude displays use meters consistently.

### 4. Semantic Names

Use clear, semantic dimension names:

```tsx
// Good
const dimensions = {
  temperatureCelsius: { /* ... */ },
  pressureHectopascals: { /* ... */ },
}

// Avoid
const dimensions = {
  temp: { /* ... */ },
  p: { /* ... */ },
}
```

## Integration with Charts

Dimensions automatically enhance:

### Axes

```tsx
<Scatter x="temperature" y="humidity" />
```

Axes will show "Temperature" and "Relative Humidity" labels (from `displayLabel`) with formatted tick values (from `labelValue`).

### Legends

Color legends use `labelValue` to format the scale.

### Hover Labels

Default hover labels use `displayLabel` and `labelValue`:

```tsx
<Scatter
  x="temperature"
  y="humidity"
  hoverLabel={(d) => {
    const tempDim = getDimension('temperature')
    const humidDim = getDimension('humidity')
    return `${tempDim.displayLabel}: ${tempDim.labelValue(d.temperature)}, ${humidDim.displayLabel}: ${humidDim.labelValue(d.humidity)}`
  }}
/>
```

## Examples

### Full Example

```tsx
const dimensions = {
  timestamp: {
    displayLabel: 'Time',
    labelValue: (v) => new Date(v * 1000).toLocaleTimeString(),
    divisions: Array.from({ length: 25 }, (_, i) => i),
  },
  temperature: {
    displayLabel: 'Temperature',
    units: '°C',
    labelValue: (v) => `${v.toFixed(1)}°C`,
    divisions: [-10, 0, 10, 20, 30, 40],
    stats: { min: -20, max: 50 },
  },
  humidity: {
    displayLabel: 'Humidity',
    units: '%',
    labelValue: (v) => `${Math.round(v)}%`,
    divisions: [0, 20, 40, 60, 80, 100],
    stats: { min: 0, max: 100 },
  },
}

<Dimensions value={dimensions}>
  <Data value={weatherData}>
    <LineChart x="timestamp" y="temperature" />
    <LineChart x="timestamp" y="humidity" />
  </Data>
</Dimensions>
```

All charts will use consistent formatting and labeling for these dimensions.
