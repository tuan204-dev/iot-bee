import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SensorDataEntity } from './sensor-data.entity';
import { ISearchSensorDataParams } from './sensor-data.interface';

@Injectable()
export class SensorDataService {
  constructor(
    @InjectRepository(SensorDataEntity)
    private readonly sensorDataRepository: Repository<SensorDataEntity>,
  ) {}
  async saveTempData(data: number) {
    try {
      const sensorData = this.sensorDataRepository.create({
        value: data,
        unit: '°C',
        sensor_id: 1,
        timestamp: new Date(),
      });

      return this.sensorDataRepository.save(sensorData);
    } catch (e) {
      console.error('Error saving temperature data:', e);
      return null;
    }
  }

  async saveHumidityData(data: number) {
    try {
      const sensorData = this.sensorDataRepository.create({
        value: data,
        unit: '%',
        sensor_id: 1,
        timestamp: new Date(),
      });
      return this.sensorDataRepository.save(sensorData);
    } catch (e) {
      console.error('Error saving humidity data:', e);
      return null;
    }
  }

  async saveLightData(data: number) {
    try {
      const sensorData = this.sensorDataRepository.create({
        value: data,
        unit: 'lx',
        sensor_id: 1,
        timestamp: new Date(),
      });
      return this.sensorDataRepository.save(sensorData);
    } catch (e) {
      console.error('Error saving light data:', e);
      return null;
    }
  }

  async findSensorData(params: ISearchSensorDataParams) {
    try {
      const { page, size, startDate, endDate, unit } = params ?? {};

      const res = await this.sensorDataRepository
        .createQueryBuilder('sensor_data')
        .where({
          ...(startDate && { timestamp: { $gte: startDate } }),
          ...(endDate && { timestamp: { $lte: endDate } }),
          ...(unit && { unit }),
        })
        .getManyAndCount();

      return {
        data: res[0],
        total: res[1],
      };
    } catch (e) {
      console.error('Error finding sensor data:', e);
      return [];
    }
  }
}
