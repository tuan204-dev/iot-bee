import { Body, Controller, Get, Post } from '@nestjs/common';
import { MqttService } from '../mqtt/mqtt.service';
import { DeviceService } from './device.service';
import { TriggerActionDto } from './dto/trigger-action.dto';

@Controller('devices')
export class DeviceController {
  constructor(
    private readonly deviceService: DeviceService,
    private readonly mqttService: MqttService,
  ) {}

  @Post('trigger')
  async triggerAction(@Body() body: TriggerActionDto) {
    return this.deviceService.triggerAction(body);
  }

  @Get('/last-actions')
  async getLastDeviceActions() {
    return this.deviceService.getLastDeviceActions();
  }

  @Get('/ping')
  async ping() {
    return this.deviceService.pingToESP();
  }
}
