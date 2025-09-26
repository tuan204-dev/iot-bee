import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MqttService } from '../mqtt/mqtt.service';
import { DeviceEntity } from './device.entity';
import { TriggerActionDto } from './dto/trigger-action.dto';
import { ActionEntity } from '../action/action.entity';
import { ActuatorEntity } from '../actuator/actuator.entity';
import { ActionHistoryEntity } from '../action-history/action-history.entity';

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
    @InjectRepository(ActionHistoryEntity)
    private readonly actionHistoryRepository: Repository<ActionHistoryEntity>,
  ) {}

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

      const actionHistory = this.actionHistoryRepository.create({
        action_id: action.id,
        actuator_id: actuator.id,
        timestamp: new Date(),
        status: 'pending',
      });

      const { id: actionHistoryId } =
        await this.actionHistoryRepository.save(actionHistory);

      await this.mqttService.triggerAction(action, actuator, actionHistoryId);

      const { isSuccess } = await this.mqttService.waitForTopicMessage(
        'ack',
        10000,
        actionHistoryId,
      );

      if (!isSuccess) {
        await this.actionHistoryRepository.update(actionHistoryId, {
          status: 'failed',
        });
        return { status: 'error', message: 'Action failed' };
      }

      await this.actionHistoryRepository.update(actionHistoryId, {
        status: 'success',
      });

      return { status: 'ok', message: 'Action triggered' };
    } catch (e) {
      console.log(e);
      throw e;
    }
  }
}
