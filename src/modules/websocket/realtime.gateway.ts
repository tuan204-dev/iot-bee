import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import type { ISensorDataPayload } from '../sensor-data/sensor-data.interface';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/realtime',
})
export class RealtimeGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private connectedClients: Set<string> = new Set();

  handleConnection(client: Socket) {
    this.connectedClients.add(client.id);

    client.emit('connection_status', {
      status: 'connected',
      clientId: client.id,
      timestamp: new Date().toISOString(),
    });
  }

  handleDisconnect(client: Socket) {
    this.connectedClients.delete(client.id);
  }

  broadcastSensorData(data: ISensorDataPayload) {
    const payload = {
      ...data,
      timestamp: new Date().toISOString(),
      source: 'mqtt',
    };

    this.server.emit('sensor_data', payload);
  }

  broadcastTemperature(temp: number) {
    const payload = {
      type: 'temperature',
      value: temp,
      unit: '°C',
      timestamp: new Date().toISOString(),
    };

    this.server.emit('temperature', payload);
  }

  broadcastHumidity(humidity: number) {
    const payload = {
      type: 'humidity',
      value: humidity,
      unit: '%',
      timestamp: new Date().toISOString(),
    };

    this.server.emit('humidity', payload);
  }

  broadcastLight(light: number) {
    const payload = {
      type: 'light',
      value: light,
      unit: 'lux',
      timestamp: new Date().toISOString(),
    };

    this.server.emit('light', payload);
  }

  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }
}
