export interface ISensorDataPayload {
  temp: number;
  humidity: number;
  light: number;
}

export interface ISearchSensorDataParams {
  type?: string;
  unit?: string;
  startDate?: string;
  endDate?: string;
  size?: number;
  page?: number;
}
