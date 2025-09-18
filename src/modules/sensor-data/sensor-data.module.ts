import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SensorDataEntity } from './sensor-data.entity';
import { SensorDataController } from './sensor-data.controller';
import { SensorDataService } from './sensor-data.service';

@Module({
  imports: [TypeOrmModule.forFeature([SensorDataEntity])],
  controllers: [SensorDataController],
  providers: [SensorDataService],
  exports: [SensorDataService],
})
export class SensorDataModule {}
