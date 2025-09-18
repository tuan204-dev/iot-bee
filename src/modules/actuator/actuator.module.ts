import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActuatorEntity } from './actuator.entity';
import { ActuatorController } from './actuator.controller';
import { ActuatorService } from './actuator.service';

@Module({
  imports: [TypeOrmModule.forFeature([ActuatorEntity])],
  controllers: [ActuatorController],
  providers: [ActuatorService],
  exports: [ActuatorService],
})
export class ActuatorModule {}
