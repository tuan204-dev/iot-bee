import { Body, Controller, Post } from '@nestjs/common';
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
}
