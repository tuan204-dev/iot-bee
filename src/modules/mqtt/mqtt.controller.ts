import { Controller, Inject, forwardRef } from '@nestjs/common';
import { Ctx, EventPattern, MqttContext, Payload } from '@nestjs/microservices';
import { ApiTags } from '@nestjs/swagger';
import { isUndefined } from 'lodash';
import type { ISensorDataPayload } from '../sensor-data/sensor-data.interface';
import { SensorDataService } from '../sensor-data/sensor-data.service';
import { RealtimeGateway } from '../websocket/realtime.gateway';
import { MqttService } from './mqtt.service';
import { type IDeviceStatusPayload } from './mqtt.interface';
import { DeviceService } from '../device/device.service';

@ApiTags('mqtt')
@Controller()
export class MqttController {
  constructor(
    private readonly sensorDataService: SensorDataService,
    private readonly realtimeGateway: RealtimeGateway,
    private readonly mqttService: MqttService,
    @Inject(forwardRef(() => DeviceService))
    private readonly deviceService: DeviceService,
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
        isUndefined(data.temperature) ||
        isUndefined(data.humidity) ||
        isUndefined(data.light)
      ) {
        console.error('Invalid data payload:', data);
        return;
      }

      // Save temperature data to the database
      await Promise.all([
        this.sensorDataService.saveTempData(data.temperature),
        this.sensorDataService.saveHumidityData(data.humidity),
        this.sensorDataService.saveLightData(data.light),
      ]);

      // Broadcast real-time data via WebSocket
      this.realtimeGateway.broadcastSensorData(data);

      // Also broadcast individual sensor values
      this.realtimeGateway.broadcastTemperature(data.temperature);
      this.realtimeGateway.broadcastHumidity(data.humidity);
      this.realtimeGateway.broadcastLight(data.light);

      console.log('✅ Data saved and broadcasted successfully');
    } catch (e) {
      console.error('Error processing message:', e);
    }
  }

  // Subscribe to the 'device_status' topic
  @EventPattern('device_status')
  async handleListenDeviceStatus(@Payload() data: IDeviceStatusPayload) {
    try {
      if (data.isConnected) {
        await this.deviceService.handleDeviceReconnect();
      }
    } catch (e) {
      console.error('Error processing device status message:', e);
    }
  }

  // Generic handler for any topic that needs to be listened to
  @EventPattern('+')
  handleGenericTopic(@Payload() data: unknown, @Ctx() context: MqttContext) {
    try {
      const topic = context.getTopic();
      console.log(`Received message on topic: ${topic}`, data);

      // Forward all messages to service for potential listeners
      this.mqttService.handleIncomingMessage(topic, data);
    } catch (e) {
      console.error('Error processing generic message:', e);
    }
  }
}
