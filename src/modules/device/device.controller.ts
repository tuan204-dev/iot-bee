import { Controller, Get } from '@nestjs/common';
import { DeviceService } from './device.service';
import { MqttService } from '../mqtt/mqtt.service';

@Controller('devices')
export class DeviceController {
  constructor(
    private readonly deviceService: DeviceService,
    private readonly mqttService: MqttService,
  ) {}

  @Get()
  publish() {
    return this.mqttService.publishMessage();
  }
}
