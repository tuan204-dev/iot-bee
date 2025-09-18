import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SensorDataEntity } from './sensor-data.entity';

@Injectable()
export class SensorDataService {
  constructor(
    @InjectRepository(SensorDataEntity)
    private readonly sensorDataRepository: Repository<SensorDataEntity>,
  ) {}

  async findAll(): Promise<SensorDataEntity[]> {
    return this.sensorDataRepository.find({
      relations: ['sensor'],
      order: { timestamp: 'DESC' },
    });
  }

  async findOne(id: number): Promise<SensorDataEntity | null> {
    return this.sensorDataRepository.findOne({
      where: { id },
      relations: ['sensor'],
    });
  }

  async findBySensorId(sensorId: number): Promise<SensorDataEntity[]> {
    return this.sensorDataRepository.find({
      where: { sensor_id: sensorId },
      relations: ['sensor'],
      order: { timestamp: 'DESC' },
    });
  }

  async findLatestBySensorId(
    sensorId: number,
  ): Promise<SensorDataEntity | null> {
    return this.sensorDataRepository.findOne({
      where: { sensor_id: sensorId },
      relations: ['sensor'],
      order: { timestamp: 'DESC' },
    });
  }

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
}
