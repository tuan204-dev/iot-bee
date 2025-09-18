import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, MqttContext, Payload } from '@nestjs/microservices';
import { SensorDataService } from '../sensor-data/sensor-data.service';
import type { ISensorDataPayload } from '../sensor-data/sensor-data.interface';
import { isUndefined } from 'lodash';

@Controller()
export class MqttController {
  constructor(private readonly sensorDataService: SensorDataService) {}

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
    } catch (e) {
      console.error('Error processing message:', e);
    }
  }
}
