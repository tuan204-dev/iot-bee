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

  async create(
    createSensorDataDto: Partial<SensorDataEntity>,
  ): Promise<SensorDataEntity> {
    const sensorData = this.sensorDataRepository.create(createSensorDataDto);
    return this.sensorDataRepository.save(sensorData);
  }

  async update(
    id: number,
    updateSensorDataDto: Partial<SensorDataEntity>,
  ): Promise<SensorDataEntity | null> {
    await this.sensorDataRepository.update(id, updateSensorDataDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.sensorDataRepository.delete(id);
  }
}
