import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ActionEntity } from '../action/action.entity';
import { ActuatorEntity } from '../actuator/actuator.entity';
import { ACTION_TOPIC } from '../../constants';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class MqttService {
  constructor(@Inject('MQTT_SERVICE') private readonly client: ClientProxy) {}

  publishMessage() {
    this.client.emit('test', { value: 251 });
    return { status: 'ok', message: 'Published to MQTT' };
  }

  async triggerAction(action: ActionEntity, actuator: ActuatorEntity) {
    const res: unknown = await firstValueFrom(
      this.client.emit(ACTION_TOPIC, {
        state: action.state,
        actuatorId: actuator.id,
      }),
    );

    console.log(res);
  }
}
