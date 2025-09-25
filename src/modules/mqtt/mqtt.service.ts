import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ActionEntity } from '../action/action.entity';
import { ActuatorEntity } from '../actuator/actuator.entity';
import { ACTION_TOPIC } from '../../constants';
import {
  firstValueFrom,
  Subject,
  filter,
  take,
  timeout,
  TimeoutError,
} from 'rxjs';
import { IAckPayload } from './mqtt.interface';

@Injectable()
export class MqttService implements OnModuleInit {
  private readonly messageSubject = new Subject<{
    topic: string;
    message: any;
  }>();

  constructor(@Inject('MQTT_SERVICE') private readonly client: ClientProxy) {}

  async onModuleInit() {
    // Connect to MQTT broker when module initializes
    await this.client.connect();
  }

  async triggerAction(
    action: ActionEntity,
    actuator: ActuatorEntity,
    messageId: number,
  ) {
    await firstValueFrom(
      this.client.emit(ACTION_TOPIC, {
        state: action.state,
        actuatorId: actuator.id,
        messageId,
      }),
    );
  }

  async waitForTopicMessage(
    topic: string,
    timeoutMs: number = 5000,
    messageId: number,
  ): Promise<IAckPayload> {
    try {
      console.log(
        `Waiting for message on topic: ${topic} with messageId: ${messageId}`,
      );

      await firstValueFrom(this.client.emit('subscribe', { topic }));

      const messageData = await firstValueFrom(
        this.messageSubject.pipe(
          filter((data) => {
            const message = data.message as { messageId?: number };
            console.log(
              `Checking message on topic: ${data.topic}, messageId: ${message?.messageId}`,
            );
            return data.topic === topic && message?.messageId === messageId;
          }),
          take(1),
          timeout(timeoutMs),
        ),
      );

      console.log('Received matching message:', messageData.message);
      return {
        messageId,
        isSuccess: true,
        ...messageData.message,
      } as IAckPayload;
    } catch (error) {
      if (error instanceof TimeoutError) {
        console.log(
          `Timeout waiting for messageId ${messageId} on topic ${topic}`,
        );
        return {
          messageId,
          isSuccess: false,
        };
      }
      throw error instanceof Error ? error : new Error(String(error));
    }
  }

  handleIncomingMessage(topic: string, message: unknown) {
    this.messageSubject.next({ topic, message });
  }
}
