import { Module } from '@nestjs/common';
import { DeviceController } from './device.controller';
import { DeviceService } from './device.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceEntity } from './device.entity';
import { MqttModule } from '../mqtt/mqtt.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DeviceEntity]),
    MqttModule, // Import shared MQTT module
  ],
  controllers: [DeviceController],
  providers: [DeviceService],
})
export class DeviceModule {}
