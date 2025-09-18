import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class MqttService {
  constructor(@Inject('MQTT_SERVICE') private readonly client: ClientProxy) {}

  publishMessage() {
    this.client.emit('test', { value: 251 });
    return { status: 'ok', message: 'Published to MQTT' };
  }
}
