import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeviceEntity } from './device.entity';
import { MqttService } from '../mqtt/mqtt.service';

@Injectable()
export class DeviceService {
  constructor(
    @InjectRepository(DeviceEntity)
    public repo: Repository<DeviceEntity>,
    private readonly mqttService: MqttService,
  ) {}

  // Test MQTT connection
  testMqtt() {
    return this.mqttService.publishMessage();
  }
}
