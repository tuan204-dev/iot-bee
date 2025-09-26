export interface ISensorDataPayload {
  temperature: number;
  humidity: number;
  light: number;
}

export interface ISearchSensorDataParams {
  sensorIds?: string[]; // sensor ids
  unit?: string;
  startDate?: number; // timestamp
  endDate?: number; // timestamp
  startValue?: number;
  endValue?: number;
  size?: number;
  page?: number;
}
