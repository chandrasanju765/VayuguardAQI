// This file has types for global objects

export interface IndianCity {
  id: string;
  name: string;
  state: string;
}

export type IndianCitiesData = IndianCity[];

// Export AQICN types
export * from "./aqicn";
