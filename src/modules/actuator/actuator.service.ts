import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActuatorEntity } from './actuator.entity';

@Injectable()
export class ActuatorService {
  constructor(
    @InjectRepository(ActuatorEntity)
    private readonly actuatorRepository: Repository<ActuatorEntity>,
  ) {}

  async findAll(): Promise<ActuatorEntity[]> {
    return this.actuatorRepository.find({
      relations: ['device'],
    });
  }

  async findOne(id: number): Promise<ActuatorEntity | null> {
    return this.actuatorRepository.findOne({
      where: { id },
      relations: ['device', 'actionHistories'],
    });
  }

  async findByDeviceId(deviceId: number): Promise<ActuatorEntity[]> {
    return this.actuatorRepository.find({
      where: { device_id: deviceId },
      relations: ['device', 'actionHistories'],
    });
  }

  async create(
    createActuatorDto: Partial<ActuatorEntity>,
  ): Promise<ActuatorEntity> {
    const actuator = this.actuatorRepository.create(createActuatorDto);
    return this.actuatorRepository.save(actuator);
  }

  async update(
    id: number,
    updateActuatorDto: Partial<ActuatorEntity>,
  ): Promise<ActuatorEntity | null> {
    await this.actuatorRepository.update(id, updateActuatorDto);
    return this.findOne(id);
  }

  async updateState(id: number, state: string): Promise<ActuatorEntity | null> {
    await this.actuatorRepository.update(id, { state });
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.actuatorRepository.delete(id);
  }
}
