export const colorSchemes = {
  BrBG: "brown-blue-green",
  PRGn: "purple-red-green",
  PiYG: "pink-yellow-green",
  PuOr: "purple-orange",
  RdBu: "red-blue",
  RdGy: "red-gray",
  RdYlBu: "red-yellow-blue",
  RdYlGn: "red-yellow-green",
  YlOrRd: "yelllow-orange-red",
  spectral: true,
  viridis: true,
  inferno: true,
  magma: true,
  plasma: true,
  warm: true,
  cool: true,
  cubehelixDefault: true,
  rainbow: true,
  sinebow: true,
  turbo: true,
};

export const DEFAULT_COLOR_SCHEME = "turbo";
export default colorSchemes;
export type ColorScheme = keyof typeof colorSchemes;
