import { Injectable, Inject, forwardRef } from '@nestjs/common';
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
    @Inject(forwardRef(() => MqttService))
    private readonly mqttService: MqttService,
    @InjectRepository(ActionEntity)
    private readonly actionRepository: Repository<ActionEntity>,
    @InjectRepository(ActuatorEntity)
    private readonly actuatorRepository: Repository<ActuatorEntity>,
    @InjectRepository(ActionHistoryEntity)
    private readonly actionHistoryRepository: Repository<ActionHistoryEntity>,
  ) {}

  async triggerAction(payload: TriggerActionDto, noSave?: boolean) {
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

      if (noSave) {
        const messageId = Date.now();
        await this.mqttService.triggerAction(action, actuator, messageId);
        const { isSuccess } = await this.mqttService.waitForTopicMessage(
          'ack',
          10000,
          messageId,
        );
        if (!isSuccess) {
          return { status: false, message: 'Action failed' };
        }
        return { status: true, message: 'Action triggered' };
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
        return { status: false, message: 'Action failed' };
      }

      await this.actionHistoryRepository.update(actionHistoryId, {
        status: 'success',
      });

      return { status: true, message: 'Action triggered' };
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  async getLastDeviceActions() {
    const allActuators = await this.actuatorRepository.find();

    const lastActions = await Promise.all(
      allActuators.map((actuator) =>
        this.actionHistoryRepository.findOne({
          where: {
            actuator_id: actuator.id,
            status: 'success',
          },
          order: { timestamp: 'DESC' },
        }),
      ),
    );

    const lastActionInfos = await Promise.all(
      lastActions.map(async (actionHistory) => {
        const action = await this.actionRepository.findOne({
          where: {
            id: actionHistory?.action_id,
          },
        });

        return {
          ...action,
          actuatorId: actionHistory?.actuator_id,
        };
      }),
    );

    return lastActionInfos;
  }

  async handleDeviceReconnect() {
    const lastActions = await this.getLastDeviceActions();

    await Promise.all(
      lastActions.map(async (action) => {
        await this.triggerAction(
          {
            actionId: String(action.id),
            actuatorId: String(action.actuatorId),
          },
          true,
        );
      }),
    );
  }

  async pingToESP() {
    try {
      // Generate unique message ID for this ping
      const messageId = Date.now().toString();

      // Send ping message via MQTT
      await this.mqttService.sendPing(messageId);

      // Wait for pong response with 10 second timeout
      const { isSuccess } = await this.mqttService.waitForTopicMessage(
        'pong',
        5000,
        messageId,
      );

      return {
        status: isSuccess,
        message: isSuccess
          ? 'ESP responded successfully'
          : 'ESP did not respond within 10 seconds',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error pinging ESP:', error);
      return {
        status: false,
        message: 'Error occurred while pinging ESP',
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      };
    }
  }
}
