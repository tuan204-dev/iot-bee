import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MqttService } from '../mqtt/mqtt.service';
import { DeviceEntity } from './device.entity';
import { TriggerActionDto } from './dto/trigger-action.dto';
import { ActionEntity } from '../action/action.entity';
import { ActuatorEntity } from '../actuator/actuator.entity';

@Injectable()
export class DeviceService {
  constructor(
    @InjectRepository(DeviceEntity)
    public repo: Repository<DeviceEntity>,
    private readonly mqttService: MqttService,
    @InjectRepository(ActionEntity)
    private readonly actionRepository: Repository<ActionEntity>,
    @InjectRepository(ActuatorEntity)
    private readonly actuatorRepository: Repository<ActuatorEntity>,
  ) {}

  // Test MQTT connection
  testMqtt() {
    return this.mqttService.publishMessage();
  }

  async triggerAction(payload: TriggerActionDto) {
    try {
      const { actionId, actuatorId } = payload;

      const action = await this.actionRepository.findOne({
        where: {
          id: parseInt(actionId, 10),
        },
      });

      if (!action) {
        throw new Error('Action not found');
      }

      const actuator = await this.actuatorRepository.findOne({
        where: {
          id: parseInt(actuatorId, 10),
        },
      });

      if (!actuator) {
        throw new Error('Actuator not found');
      }

      await this.mqttService.triggerAction(action, actuator);

      return { status: 'ok', message: 'Action triggered' };
    } catch (e) {
      console.log(e);
      throw e;
    }
  }
}
