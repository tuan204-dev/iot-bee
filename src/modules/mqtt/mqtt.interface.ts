export interface IAckPayload {
  messageId: number | string;
  isSuccess: boolean;
}

export interface IDeviceStatusPayload {
  isConnected: boolean;
  timestamp: number;
}
