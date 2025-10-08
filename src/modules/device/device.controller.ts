import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MqttService } from '../mqtt/mqtt.service';
import { DeviceService } from './device.service';
import { TriggerActionDto } from './dto/trigger-action.dto';

@ApiTags('device')
@Controller('devices')
export class DeviceController {
  constructor(
    private readonly deviceService: DeviceService,
    private readonly mqttService: MqttService,
  ) {}

  @Post('trigger')
  @ApiOperation({ summary: 'Trigger an action on a device' })
  async triggerAction(@Body() body: TriggerActionDto) {
    return this.deviceService.triggerAction(body);
  }

  @Get('/last-actions')
  @ApiOperation({ summary: 'Get last actions for all devices' })
  async getLastDeviceActions() {
    return this.deviceService.getLastDeviceActions();
  }

  @Get('/ping')
  @ApiOperation({ summary: 'Ping ESP device' })
  async ping() {
    return this.deviceService.pingToESP();
  }
}
