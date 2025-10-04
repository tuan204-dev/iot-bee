import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SensorEntity } from './sensor.entity';

@Injectable()
export class SensorService {
  constructor(
    @InjectRepository(SensorEntity)
    private readonly sensorRepository: Repository<SensorEntity>,
  ) {}

  async findAll(): Promise<SensorEntity[]> {
    return this.sensorRepository.find({
      relations: ['device'],
    });
  }

  async findOne(id: number): Promise<SensorEntity | null> {
    return this.sensorRepository.findOne({
      where: { id },
      relations: ['device', 'sensorData'],
    });
  }

  async findByDeviceId(deviceId: number): Promise<SensorEntity[]> {
    return this.sensorRepository.find({
      where: { device_id: deviceId },
      relations: ['device', 'sensorData'],
    });
  }

  async create(createSensorDto: Partial<SensorEntity>): Promise<SensorEntity> {
    const sensor = this.sensorRepository.create(createSensorDto);
    return this.sensorRepository.save(sensor);
  }

  async update(
    id: number,
    updateSensorDto: Partial<SensorEntity>,
  ): Promise<SensorEntity | null> {
    await this.sensorRepository.update(id, updateSensorDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.sensorRepository.delete(id);
  }
}
