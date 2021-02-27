import React from "react";

export interface CoordinateContextValue {
  width: number;
  height: number;
  [index: string]: any;
}

const CoordinateContext = React.createContext<CoordinateContextValue>({
  width: 0,
  height: 0,
});

export default CoordinateContext;
