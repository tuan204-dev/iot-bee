import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, MqttContext, Payload } from '@nestjs/microservices';
import { SensorDataService } from '../sensor-data/sensor-data.service';
import { RealtimeGateway } from '../websocket/realtime.gateway';
import type { ISensorDataPayload } from '../sensor-data/sensor-data.interface';
import { isUndefined } from 'lodash';

@Controller()
export class MqttController {
  constructor(
    private readonly sensorDataService: SensorDataService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  // Subscribe to the 'realtime_data' topic
  @EventPattern('realtime_data')
  async handleListenSensorData(
    @Payload() data: ISensorDataPayload,
    @Ctx() context: MqttContext,
  ) {
    try {
      console.log('Received data:', data);
      console.log('Topic:', context.getTopic());
      console.log(typeof data);

      if (
        isUndefined(data.temp) ||
        isUndefined(data.humidity) ||
        isUndefined(data.light)
      ) {
        console.error('Invalid data payload:', data);
        return;
      }

      // Save temperature data to the database
      await Promise.all([
        this.sensorDataService.saveTempData(data.temp),
        this.sensorDataService.saveHumidityData(data.humidity),
        this.sensorDataService.saveLightData(data.light),
      ]);

      // Broadcast real-time data via WebSocket
      this.realtimeGateway.broadcastSensorData(data);

      // Also broadcast individual sensor values
      this.realtimeGateway.broadcastTemperature(data.temp);
      this.realtimeGateway.broadcastHumidity(data.humidity);
      this.realtimeGateway.broadcastLight(data.light);

      console.log('✅ Data saved and broadcasted successfully');
    } catch (e) {
      console.error('Error processing message:', e);
    }
  }
}
