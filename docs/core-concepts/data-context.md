# Data Context

The Data Context is the foundation of chart-thing's data flow system. It uses React Context to make data available to all chart components in the tree, enabling composition and layering.

## Overview

Instead of passing data as props to every component, you wrap your charts in a `<Data>` provider. All child components can then access and transform that data through React hooks.

```tsx
import { Data, Scatter } from 'chart-thing'

<Data value={myData}>
  <Scatter x="x" y="y" />
</Data>
```

## Basic Usage

### Providing Data

The `Data` component accepts an array of objects:

```tsx
const data = [
  { x: 1, y: 2, category: 'A' },
  { x: 2, y: 4, category: 'B' },
  { x: 3, y: 3, category: 'A' },
]

<Data value={data}>
  {/* Charts go here */}
</Data>
```

### Accessing Data

Components use the `useDataArray` hook to access the current data:

```tsx
import { useDataArray } from 'chart-thing'

function MyComponent<T>() {
  const data = useDataArray<T>()

  return (
    <>
      {data.map((d, i) => (
        <circle key={i} /* ... */ />
      ))}
    </>
  )
}
```

## Data Transformations

### Subset - Filtering Data

The `Subset` component filters data based on a predicate function:

```tsx
import { Subset } from 'chart-thing'

<Data value={data}>
  <Subset filter={(d) => d.value > 10}>
    <Scatter x="x" y="y" />
  </Subset>
</Data>
```

This creates a new Data context containing only the filtered items.

#### Multiple Filters

You can chain `Subset` components:

```tsx
<Data value={data}>
  <Subset filter={(d) => d.value > 10}>
    <Subset filter={(d) => d.category === 'A'}>
      <Scatter x="x" y="y" />
    </Subset>
  </Subset>
</Data>
```

Or use a combined filter:

```tsx
<Subset filter={(d) => d.value > 10 && d.category === 'A'}>
  <Scatter x="x" y="y" />
</Subset>
```

### Grouped - Grouping Data

The `Grouped` component splits data into groups and renders children once for each group:

```tsx
import { Grouped } from 'chart-thing'

<Data value={data}>
  <Grouped by="category">
    <LineChart x="x" y="y" />
  </Grouped>
</Data>
```

This renders a separate line for each unique value of `category`.

#### How It Works

1. Data is grouped by the specified attribute
2. Children are rendered once per group
3. Each group gets its own Data context
4. Groups are automatically assigned a color based on their index

#### Accessor Functions

You can group by a computed value:

```tsx
<Grouped by={(d) => d.timestamp.getMonth()}>
  <LineChart x="day" y="value" />
</Grouped>
```

#### Accessing Group Information

The data array provided to each group is augmented with metadata:

```tsx
function GroupLabel() {
  const data = useDataArray<any>()

  // Access group metadata
  const groupKey = (data as any).group
  const groupIndex = (data as any).groupIndex

  return <text>{groupKey}</text>
}

<Grouped by="category">
  <GroupLabel />
  <LineChart x="x" y="y" />
</Grouped>
```

### DataFrame - Partitioned Data

If your data is an object with multiple named arrays, use `DataFrame` to select a partition:

```tsx
const multiData = {
  training: [{ x: 1, y: 2 }, { x: 2, y: 4 }],
  testing: [{ x: 3, y: 6 }, { x: 4, y: 8 }],
}

<Data value={multiData}>
  <DataFrame part="training">
    <Scatter x="x" y="y" color="blue" />
  </DataFrame>

  <DataFrame part="testing">
    <Scatter x="x" y="y" color="red" />
  </DataFrame>
</Data>
```

#### Use Cases

- Comparing training vs testing data
- Rendering multiple related datasets on one chart
- Organizing complex multi-dataset visualizations

## Nested Data Contexts

Data contexts can be nested. Inner contexts override outer ones:

```tsx
<Data value={allData}>
  <Scatter x="x" y="y" />  {/* Uses allData */}

  <Data value={differentData}>
    <Scatter x="a" y="b" />  {/* Uses differentData */}
  </Data>
</Data>
```

This is useful for:
- Overlaying multiple datasets
- Comparing different data sources
- Creating complex composite visualizations

## Advanced Patterns

### Multiple Datasets on One Chart

```tsx
<SizedSVG>
  <Coordinates x={(d: any) => d.x} y={(d: any) => d.y}>
    <XAxis />
    <YAxis />

    <Data value={dataset1}>
      <PointCircles />
    </Data>

    <Data value={dataset2}>
      <PointCircles />
    </Data>
  </Coordinates>
</SizedSVG>
```

### Grouped with Custom Colors

```tsx
const colors = ['red', 'blue', 'green']

<Grouped by="category">
  <Coordinates
    x="x"
    y="y"
    colorScale={(d) => {
      const data = useDataArray()
      const groupIndex = (data as any).groupIndex
      return colors[groupIndex]
    }}
  >
    <PointCircles />
  </Coordinates>
</Grouped>
```

### Combining Transformations

```tsx
<Data value={allData}>
  <Subset filter={(d) => d.timestamp > startDate}>
    <Grouped by="region">
      <Subset filter={(d) => d.value !== null}>
        <LineChart x="timestamp" y="value" />
      </Subset>
    </Grouped>
  </Subset>
</Data>
```

## Hooks API

### useDataArray

Returns the current data context as an array:

```tsx
const data = useDataArray<DataType>()
```

Returns an empty array if the context value is not an array.

### useDataObject

Returns the current data context as an object:

```tsx
const data = useDataObject()
```

Returns `null` if the context value is not an object.

Useful for working with `DataFrame`:

```tsx
function PartSelector() {
  const data = useDataObject()
  const parts = data ? Object.keys(data) : []

  return (
    <>
      {parts.map(part => (
        <DataFrame key={part} part={part}>
          <Scatter x="x" y="y" />
        </DataFrame>
      ))}
    </>
  )
}
```

### useDataDimensions

Returns the keys from the first data item:

```tsx
const dimensions = useDataDimensions<DataType>()
// Returns: ['x', 'y', 'category', ...]
```

Useful for automatic dimension detection or building dynamic UIs.

## TypeScript

All data hooks and components support TypeScript generics:

```tsx
interface DataPoint {
  x: number
  y: number
  category: string
}

const data: DataPoint[] = [...]

<Data value={data}>
  <Grouped<DataPoint> by="category">
    <Scatter<DataPoint> x="x" y="y" />
  </Grouped>
</Data>
```

## Component Reference

### Data

Provides data to child components via React context.

**Props:**
- `value: unknown` - The data to provide (typically an array or object)
- `children: React.ReactNode` - Child components

### Subset

Filters data based on a predicate.

**Props:**
- `filter: (value: unknown) => boolean` - Predicate function
- `children: React.ReactNode` - Child components

### Grouped

Groups data by an attribute and renders children for each group.

**Props:**
- `by: TypedAccessor<T, any>` - Attribute key or accessor function to group by
- `children: React.ReactNode` - Child components (rendered once per group)

### DataFrame

Selects a named partition from an object of arrays.

**Props:**
- `part: string` - The key to select from the data object
- `children: React.ReactNode | ((data: unknown[]) => React.ReactNode)` - Child components or render function

## Performance Considerations

### Memoization

Since data flows through React context, changes to the data array will trigger re-renders of all consumers. If you're transforming data in the component that renders `<Data>`, memoize it:

```tsx
const filteredData = useMemo(
  () => rawData.filter(d => d.value > 0),
  [rawData]
)

<Data value={filteredData}>
  <Scatter x="x" y="y" />
</Data>
```

### Large Datasets

For very large datasets (10,000+ points), consider:

1. **Filter early** - Use `Subset` as high in the tree as possible
2. **Sample data** - Reduce points for interactive exploration
3. **Use aggregations** - BinStats1d/2d for large datasets
4. **Virtualization** - Only render visible portions for time series

### Static Data

If your data doesn't change, define it outside the component:

```tsx
// Good - data doesn't recreate on each render
const staticData = [...]

function MyChart() {
  return (
    <Data value={staticData}>
      <Scatter x="x" y="y" />
    </Data>
  )
}

// Avoid - creates new array on each render
function MyChart() {
  const data = [...] // New array every render!
  return <Data value={data}>...</Data>
}
```

## Examples

### Interactive Filtering

```tsx
function InteractiveChart() {
  const [minValue, setMinValue] = useState(0)

  return (
    <>
      <input
        type="range"
        min={0}
        max={100}
        value={minValue}
        onChange={(e) => setMinValue(+e.target.value)}
      />

      <Data value={data}>
        <Subset filter={(d) => d.value >= minValue}>
          <Scatter x="x" y="y" />
        </Subset>
      </Data>
    </>
  )
}
```

### Group Comparison

```tsx
<Data value={data}>
  <Grouped by="treatment">
    <Histogram x="outcome" xBins={20} />
  </Grouped>
</Data>
```

Each treatment group gets its own histogram, automatically colored differently.

### Time Series by Region

```tsx
<Data value={timeSeriesData}>
  <Grouped by="region">
    <LineChart
      x={(d) => new Date(d.timestamp)}
      y="value"
    />
  </Grouped>
</Data>
```

Renders a line for each region with automatic color assignment.
