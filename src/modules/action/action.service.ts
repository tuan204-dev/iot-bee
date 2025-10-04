import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActionEntity } from './action.entity';

@Injectable()
export class ActionService {
  constructor(
    @InjectRepository(ActionEntity)
    private readonly actionRepository: Repository<ActionEntity>,
  ) {}

  async findAll(): Promise<ActionEntity[]> {
    return this.actionRepository.find({
      relations: ['device'],
    });
  }

  async findOne(id: number): Promise<ActionEntity | null> {
    return this.actionRepository.findOne({
      where: { id },
      relations: ['device', 'actionHistories'],
    });
  }

  async findByDeviceId(deviceId: number): Promise<ActionEntity[]> {
    return this.actionRepository.find({
      where: { device_id: deviceId },
      relations: ['device', 'actionHistories'],
    });
  }

  async create(createActionDto: Partial<ActionEntity>): Promise<ActionEntity> {
    const action = this.actionRepository.create(createActionDto);
    return this.actionRepository.save(action);
  }

  async update(
    id: number,
    updateActionDto: Partial<ActionEntity>,
  ): Promise<ActionEntity | null> {
    await this.actionRepository.update(id, updateActionDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.actionRepository.delete(id);
  }
}
