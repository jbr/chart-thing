import React from "react";
import DataContext, { useDataArray } from "./DataContext";
import { attributeValue, TypedAccessor } from "./common";
export function SplitData<T>({
  on,
  children,
}: {
  on: TypedAccessor<T, boolean>;
  children: React.ReactNode;
}) {
  const allData = useDataArray<T>();
  const split = React.useMemo(
    () =>
      allData.reduce(
        (sections, point) => {
          const value = attributeValue(point, on);
          if (!!value || sections.length === 0) {
            return [...sections, [point]];
          } else {
            return [
              ...sections.slice(0, -1),
              [...sections[sections.length - 1], point],
            ];
          }
        },

        [] as T[][]
      ),
    [allData, on]
  );

  return split.map((section, index) => (
    <DataContext.Provider key={index} value={section}>
      {typeof children === "function"
        ? children(index, section, split)
        : children}
    </DataContext.Provider>
  ));
}
export default SplitData;
