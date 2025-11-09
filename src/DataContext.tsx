import React from "react";
import { attributeValue, TypedAccessor } from "./common";
import _ from "lodash";
export const DataContext = React.createContext<unknown>([]);
export const Data = DataContext.Provider;

function isStringIndexed(d: unknown): d is { [index: string]: unknown } {
  return typeof d === "object" && !Array.isArray(d);
}

export function useDataObject(): { [index: string]: unknown } | null {
  const data = React.useContext(DataContext);
  if (isStringIndexed(data)) return data;
  else return null;
}

export function useDataArray<T>(): T[] {
  const data = React.useContext(DataContext);
  if (Array.isArray(data)) return data as T[];
  else return [];
}

export function useDataDimensions<T>(): string[] {
  const data = useDataArray<T>();
  if (data.length && typeof data[0] === "object" && data[0] !== null) {
    return Object.keys(data[0] as object).filter(
      (k) =>
        data[0][k as keyof T] !== null &&
        typeof data[0][k as keyof T] !== "undefined"
    );
  } else {
    return [];
  }
}

export const DataFrame = ({
  part,
  children,
}: {
  part: string;
  children: React.ReactNode | ((data: unknown[]) => React.ReactNode);
}) => {
  const allData = useDataObject();

  if (allData && part in allData) {
    const data = allData[part] as unknown[];
    return (
      <DataContext.Provider value={data}>
        {typeof children === "function" ? children(data) : children}
      </DataContext.Provider>
    );
  } else {
    console.error(`data key '${part}' not found`);
    return null;
  }
};

interface SubsetProps {
  children?: React.ReactNode;
  filter: (value: unknown) => boolean;
}

export const Subset = ({ filter, children }: SubsetProps) => {
  const allData = React.useContext(DataContext) as unknown[];
  const data = allData.filter(filter);
  return <DataContext.Provider value={data}>{children}</DataContext.Provider>;
};

interface GroupedProps<T> {
  by: TypedAccessor<T, any>;
  children: React.ReactNode;
}

export function Grouped<T>({ by, children }: GroupedProps<T>) {
  const data = useDataArray<T>();
  const grouped = _.groupBy(data, (d) => attributeValue(d, by));
  return (
    <>
      {Object.keys(grouped).map((key, index) => {
        const group: T[] = grouped[key];
        return (
          <DataContext.Provider
            key={key}
            value={Object.assign(group, { groupIndex: index, group: key })}
          >
            {children}
          </DataContext.Provider>
        );
      })}
    </>
  );
}

export default DataContext;
