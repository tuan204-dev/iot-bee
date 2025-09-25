import { Module } from '@nestjs/common';
import { DeviceController } from './device.controller';
import { DeviceService } from './device.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceEntity } from './device.entity';
import { MqttModule } from '../mqtt/mqtt.module';
import { ActionEntity } from '../action/action.entity';
import { ActuatorEntity } from '../actuator/actuator.entity';
import { ActionHistoryEntity } from '../action-history/action-history.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DeviceEntity,
      ActionEntity,
      ActuatorEntity,
      ActionHistoryEntity,
    ]),
    MqttModule, // Import shared MQTT module
  ],
  controllers: [DeviceController],
  providers: [DeviceService],
})
export class DeviceModule {}
