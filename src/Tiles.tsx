import React from "react";
import CoordinateContext from "./CoordinateContext";
import { Scale } from "./common";
import Bluebird from "bluebird";

export type TileProvider = (x: number, y: number, z: number) => string;

interface TilesProps {
  tileProvider: TileProvider;
  zoomable: boolean;
}

interface Tile {
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

function tiles(
  xScale: Scale<unknown>,
  yScale: Scale<unknown>,
  zoom: number,
  tileProvider: TileProvider,
  expand: number = 0
): Tile[] {
  const z = zoom;
  const zoomMultiplier = Math.pow(2, zoom);

  const minX = Math.floor(
    (xScale.min - xScale.range * expand) * zoomMultiplier
  );
  const minY = Math.floor(
    (yScale.min - yScale.range * expand) * zoomMultiplier
  );
  const maxX = Math.floor(
    (xScale.max + xScale.range * expand) * zoomMultiplier
  );
  const maxY = Math.floor(
    (yScale.max + yScale.range * expand) * zoomMultiplier
  );

  let images: Tile[] = [],
    x,
    y;

  for (y = minY; y <= maxY; y++)
    for (x = minX; x <= maxX; x++) {
      const position = {
        wmpX: x / zoomMultiplier,
        wmpY: y / zoomMultiplier,
      };

      const nextPosition = {
        wmpX: (x + 1) / zoomMultiplier,
        wmpY: (y + 1) / zoomMultiplier,
      };

      const pixelX = xScale(position);
      const pixelY = yScale(position);

      const nextPixelX = xScale(nextPosition);
      const nextPixelY = yScale(nextPosition);

      if (
        pixelX !== null &&
        pixelY !== null &&
        nextPixelX !== null &&
        nextPixelY !== null
      ) {
        const imageUrl = tileProvider(x, y, z);
        images.push({
          url: imageUrl,
          x: pixelX,
          y: pixelY,
          width: Math.abs(nextPixelX - pixelX),
          height: Math.abs(nextPixelY - pixelY),
        });
      }
    }

  return images;
}

async function preloadTile(tile: Tile): Promise<Tile> {
  if (cache.has(tile.url)) return Promise.resolve(tile);
  else {
    cache.add(tile.url);
    return new Promise((y) => {
      const i = new Image();
      i.onload = y;
      i.src = tile.url;
    }).then(() => tile);
  }
}

const cache = new Set<string>();

async function preload(tiles: Tile[]): Promise<void> {
  await Bluebird.mapSeries(
    tiles,
    (t: Tile) =>
      new Promise((y) =>
        window.requestAnimationFrame(async () => {
          await preloadTile(t);
          y(null);
        })
      )
  );
}

function Tiles({ tileProvider, zoomable = false }: TilesProps) {
  const { xScale, yScale, width } = React.useContext(CoordinateContext);

  const zoom = Math.min(
    Math.ceil(Math.log2(width / 256 / xScale.range) + 0.25),
    16
  );

  preload(tiles(xScale, yScale, zoom, tileProvider));

  React.useEffect(() => {
    if (zoomable) {
      setTimeout(() => {
        preload([
          ...tiles(xScale, yScale, zoom, tileProvider, 0.5), //pan
          ...(zoom < 16
            ? tiles(xScale, yScale, zoom + 1, tileProvider, -0.25)
            : []), //zoom in
          ...tiles(xScale, yScale, zoom - 1, tileProvider, 0.5), //zoom out
        ]);
      }, 100);
    }
  }, [zoom, xScale, yScale, tileProvider, zoomable]);

  return React.useMemo(() => {
    if (typeof xScale === "undefined" || typeof yScale === "undefined")
      return null;

    return (
      <g className="tiles">
        {tiles(xScale, yScale, zoom, tileProvider, zoomable ? 0.5 : 0).map(
          (t) => (
            <image
              key={t.url}
              xlinkHref={t.url}
              x={t.x}
              y={t.y}
              width={t.width}
              height={t.height}
            />
          )
        )}
      </g>
    );
  }, [xScale, yScale, zoom, tileProvider, zoomable]);
}

export default Tiles;
