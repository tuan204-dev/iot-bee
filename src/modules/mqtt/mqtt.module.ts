import { Module } from '@nestjs/common';
import { MqttService } from './mqtt.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MqttController } from './mqtt.controller';
import { SensorDataModule } from '../sensor-data/sensor-data.module';
import { WebSocketModule } from '../websocket/websocket.module';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'MQTT_SERVICE',
        transport: Transport.MQTT,
        options: {
          url: 'mqtt://localhost:1883',
          username: 'user',
          password: '123456',
          subscriptions: [
            { topic: 'realtime_data', qos: 1 },
            { topic: 'ack', qos: 1 },
            { topic: '+', qos: 1 }, // Subscribe to all single-level topics
            { topic: '#', qos: 1 }, // Subscribe to all multi-level topics
          ],
        },
      },
    ]),
    SensorDataModule,
    WebSocketModule,
  ],
  controllers: [MqttController],
  providers: [MqttService],
  exports: [MqttService],
})
export class MqttModule {}
