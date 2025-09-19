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
          url: 'mqtt://localhost:32768',
          username: 'user',
          password: '123456789',
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
