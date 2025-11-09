# Map

Geographic maps with optional tile layers, pan/zoom support, and data overlays.

## Overview

The `Map` component displays geographic data on a tiled base map with support for panning, zooming, and data visualization.

```tsx
import { Map, Data } from 'chart-thing'

<Data value={gpsPoints}>
  <Map
    wmpX={(d) => d.longitude}
    wmpY={(d) => d.latitude}
    tileProvider={myTileProvider}
    zoomable
  />
</Data>
```

## Basic Usage

```tsx
import { Map, Data } from 'chart-thing'

const tileProvider = {
  template: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '© OpenStreetMap contributors',
}

const route = [
  { lon: -122.4194, lat: 37.7749 },  // San Francisco
  { lon: -118.2437, lat: 34.0522 },  // Los Angeles
  // ... more points
]

<div style={{ width: '800px', height: '600px' }}>
  <Data value={route}>
    <Map
      wmpX="lon"
      wmpY="lat"
      tileProvider={tileProvider}
      strokeWidth={3}
      zoomable
    />
  </Data>
</div>
```

## Props

### wmpX (required)

Longitude accessor (Web Mercator X):

```tsx
<Map wmpX="longitude" wmpY="latitude" tileProvider={tiles} />

// Or as function
<Map wmpX={(d) => d.coords.lon} wmpY={(d) => d.coords.lat} tileProvider={tiles} />
```

**Type:** `TypedAccessor<T, number>`

### wmpY (required)

Latitude accessor (Web Mercator Y):

```tsx
<Map wmpX="lon" wmpY="lat" tileProvider={tiles} />
```

**Type:** `TypedAccessor<T, number>`

### tileProvider (required)

Tile server configuration:

```tsx
const tileProvider = {
  template: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '© OpenStreetMap',
}

<Map wmpX="lon" wmpY="lat" tileProvider={tileProvider} />
```

**Type:** `TileProvider`

**Common providers:**
- OpenStreetMap: `https://tile.openstreetmap.org/{z}/{x}/{y}.png`
- Stamen Terrain: `https://stamen-tiles.a.ssl.fastly.net/terrain/{z}/{x}/{y}.jpg`
- CartoDB: `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png`

### zoomable (optional)

Enable pan and zoom:

```tsx
<Map wmpX="lon" wmpY="lat" tileProvider={tiles} zoomable />
```

**Type:** `boolean`
**Default:** `false`

When enabled:
- Pan by dragging
- Zoom with scroll wheel/pinch
- Zoom buttons appear in top-left

### strokeWidth (optional)

Line thickness for paths:

```tsx
<Map wmpX="lon" wmpY="lat" tileProvider={tiles} strokeWidth={5} />
```

**Type:** `number`

### color (optional)

Color dimension for path:

```tsx
<Map
  wmpX="lon"
  wmpY="lat"
  color="speed"
  colorScheme="viridis"
  tileProvider={tiles}
/>
```

**Type:** `TypedAccessor<T, number>`

### colorScale (optional)

Custom color function:

```tsx
<Map
  wmpX="lon"
  wmpY="lat"
  colorScale={(d) => d.type === 'highway' ? 'red' : 'blue'}
  tileProvider={tiles}
/>
```

**Type:** `(datum: T) => string`

### colorScheme (optional)

D3 color scheme:

```tsx
<Map
  wmpX="lon"
  wmpY="lat"
  color="elevation"
  colorScheme="terrain"
  tileProvider={tiles}
/>
```

**Type:** `ColorScheme`

### continuity (optional)

Control where path breaks:

```tsx
<Map
  wmpX="lon"
  wmpY="lat"
  continuity={(d) => d.connected}
  tileProvider={tiles}
/>
```

**Type:** `TypedAccessor<T, boolean>`

### outline (optional)

Add dark outline to path:

```tsx
<Map
  wmpX="lon"
  wmpY="lat"
  outline
  tileProvider={tiles}
/>
```

**Type:** `boolean`
**Default:** `false`

### legend (optional)

Show/hide color legend:

```tsx
<Map
  wmpX="lon"
  wmpY="lat"
  color="speed"
  legend={false}
  tileProvider={tiles}
/>
```

**Type:** `boolean`
**Default:** `true`

### hoverLabel (optional)

Hover tooltip function:

```tsx
<Map
  wmpX="lon"
  wmpY="lat"
  hoverLabel={(d) => `${d.location}: ${d.value}`}
  tileProvider={tiles}
  zoomable
/>
```

**Type:** `HoverLabel<T>`

### coordinateTransform (optional)

Custom coordinate transformation:

```tsx
<Map
  wmpX="lon"
  wmpY="lat"
  coordinateTransform={(lon, lat) => ({
    x: customProjectionX(lon, lat),
    y: customProjectionY(lon, lat),
  })}
  tileProvider={tiles}
/>
```

**Type:** `(wmpX: number, wmpY: number) => { x: number, y: number }`

Default is Web Mercator projection.

### children (optional)

Additional map elements:

```tsx
<Map wmpX="lon" wmpY="lat" tileProvider={tiles}>
  <circle cx={100} cy={100} r={20} fill="red" />
</Map>
```

**Type:** `React.ReactNode`

## Coordinate System

Maps use Web Mercator projection (EPSG:3857):

- **X (longitude):** -180° to 180°
- **Y (latitude):** -85° to 85°

Data is automatically transformed from lat/lon to screen coordinates.

## Zoom and Pan

When `zoomable={true}`:

### Pan
- **Mouse:** Click and drag
- **Touch:** Single finger drag

### Zoom
- **Mouse:** Scroll wheel
- **Touch:** Pinch gesture
- **Buttons:** Click + / - in top-left

### State Management

Zoom and pan state is managed internally using React.useReducer (src/Map.tsx:130-169):

- `staticOffset` / `staticZoom`: Committed state
- `dynamicOffset` / `dynamicZoom`: During gesture
- Reconciled after gesture completes

## Examples

### GPS Track

```tsx
<Data value={gpsTrack}>
  <Map
    wmpX="longitude"
    wmpY="latitude"
    color="speed"
    colorScheme="RdYlGn"
    tileProvider={osmTiles}
    strokeWidth={4}
    zoomable
  />
</Data>
```

### Multiple Routes

```tsx
<Data value={routes}>
  <Grouped by="routeId">
    <Map
      wmpX="lon"
      wmpY="lat"
      tileProvider={tiles}
      strokeWidth={3}
    />
  </Grouped>
</Data>
```

Each route gets a different color automatically.

### With Markers

```tsx
<Map wmpX="lon" wmpY="lat" tileProvider={tiles} zoomable>
  {landmarks.map((landmark, i) => (
    <circle
      key={i}
      cx={projectedX(landmark.lon)}
      cy={projectedY(landmark.lat)}
      r={5}
      fill="red"
      stroke="white"
      strokeWidth={2}
    />
  ))}
</Map>
```

### Static Map (No Tiles)

```tsx
<Map
  wmpX="lon"
  wmpY="lat"
  tileProvider={{ template: '', attribution: '' }}  // Empty provider
  strokeWidth={2}
/>
```

Just shows the data overlay without base map tiles.

## Performance

### Tile Loading

Tiles are loaded on-demand based on:
- Current zoom level
- Visible viewport
- Tile provider URL template

See src/Tiles.tsx for tile management.

### Path Rendering

Uses `LineSegments` with `resolution={5}` to filter points based on pixel distance, improving performance for dense GPS tracks.

### Zoom Performance

During zoom/pan:
- Legend hides (to reduce rendering)
- Transform applied to entire SVG group
- Tiles load for new zoom level after gesture completes

## TypeScript

```tsx
interface GPSPoint {
  longitude: number
  latitude: number
  speed: number
  timestamp: number
}

<Data value={points}>
  <Map<GPSPoint>
    wmpX="longitude"
    wmpY="latitude"
    color="speed"
    tileProvider={tiles}
    zoomable
  />
</Data>
```

## Tile Providers

### OpenStreetMap

```tsx
const osmTiles = {
  template: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '© OpenStreetMap contributors',
}
```

Free, no API key required. Please follow their [tile usage policy](https://operations.osmfoundation.org/policies/tiles/).

### Stamen Maps

```tsx
const stamenTerrain = {
  template: 'https://stamen-tiles.a.ssl.fastly.net/terrain/{z}/{x}/{y}.jpg',
  attribution: 'Map tiles by Stamen Design, under CC BY 3.0',
}
```

### CartoDB

```tsx
const cartoLight = {
  template: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
  attribution: '© OpenStreetMap, © CartoDB',
}
```

Replace `{s}` with `a`, `b`, `c`, or `d` for load balancing.

## Limitations

### No Marker Clustering

For many markers, you'll need to implement clustering yourself or filter data.

### Web Mercator Only

Coordinate transform is hardcoded to Web Mercator. For other projections, provide a custom `coordinateTransform`.

### Tile Caching

Tiles are not cached across component unmounts. For better performance, consider implementing tile caching.

## Component Structure

Internally, `Map` creates:

```tsx
<SizedSVG leftPad={0} rightPad={0} topPad={0} bottomPad={0}
  onDrag={onDrag} onZoom={onZoom} onHover={onHover}>
  <g transform={zoomTransform}>
    <MapCoordinates offset={offset} zoom={zoom} wmpX={wmpX} wmpY={wmpY} ...>
      <Tiles tileProvider={tileProvider} />
      <LineSegments ... />
      <Hover ... />
      {legend ? <ColorLegend top right background /> : null}
      {children}
      {zoomable ? <ZoomButtons zoomBy={zoomBy} /> : null}
    </MapCoordinates>
  </g>
</SizedSVG>
```

See src/Map.tsx for the implementation.

## Related Components

- [MapCoordinates](../core-concepts/coordinates.md) - Coordinate transformation
- [Tiles](../primitives/shapes.md) - Tile rendering
- [LineSegments](../primitives/paths.md) - Path rendering
- [useMapGestures](../core-concepts/sizing.md) - Gesture handling
