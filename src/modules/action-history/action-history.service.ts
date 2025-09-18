import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActionHistoryEntity } from './action-history.entity';

@Injectable()
export class ActionHistoryService {
  constructor(
    @InjectRepository(ActionHistoryEntity)
    private readonly actionHistoryRepository: Repository<ActionHistoryEntity>,
  ) {}

  async findAll(): Promise<ActionHistoryEntity[]> {
    return this.actionHistoryRepository.find({
      relations: ['action', 'actuator'],
      order: { timestamp: 'DESC' },
    });
  }

  async findOne(id: number): Promise<ActionHistoryEntity | null> {
    return this.actionHistoryRepository.findOne({
      where: { id },
      relations: ['action', 'actuator'],
    });
  }

  async findByActionId(actionId: number): Promise<ActionHistoryEntity[]> {
    return this.actionHistoryRepository.find({
      where: { action_id: actionId },
      relations: ['action', 'actuator'],
      order: { timestamp: 'DESC' },
    });
  }

  async findByActuatorId(actuatorId: number): Promise<ActionHistoryEntity[]> {
    return this.actionHistoryRepository.find({
      where: { actuator_id: actuatorId },
      relations: ['action', 'actuator'],
      order: { timestamp: 'DESC' },
    });
  }

  async create(
    createActionHistoryDto: Partial<ActionHistoryEntity>,
  ): Promise<ActionHistoryEntity> {
    const actionHistory = this.actionHistoryRepository.create(
      createActionHistoryDto,
    );
    return this.actionHistoryRepository.save(actionHistory);
  }

  async update(
    id: number,
    updateActionHistoryDto: Partial<ActionHistoryEntity>,
  ): Promise<ActionHistoryEntity | null> {
    await this.actionHistoryRepository.update(id, updateActionHistoryDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.actionHistoryRepository.delete(id);
  }
}
