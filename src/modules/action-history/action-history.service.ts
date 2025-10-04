import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActionHistoryEntity } from './action-history.entity';
import { SearchActionHistoryDto } from './dto/search-action-history.dto';

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

  async search(body: SearchActionHistoryDto) {
    const query = this.actionHistoryRepository
      .createQueryBuilder('actionHistory')
      .leftJoinAndSelect('actionHistory.action', 'action')
      .leftJoinAndSelect('actionHistory.actuator', 'actuator');

    // Filter by actuator IDs
    if (body.actuatorIds && body.actuatorIds.length > 0) {
      query.andWhere('actionHistory.actuator_id IN (:...actuatorIds)', {
        actuatorIds: body.actuatorIds,
      });
    }

    // Filter by action IDs
    if (body.actionIds && body.actionIds.length > 0) {
      query.andWhere('actionHistory.action_id IN (:...actionIds)', {
        actionIds: body.actionIds,
      });
    }

    // Filter by status
    if (body.status) {
      query.andWhere('actionHistory.status = :status', {
        status: body.status,
      });
    }

    // Search by action name (queryName)
    if (body.queryName) {
      query.andWhere('action.name LIKE :queryName', {
        queryName: `%${body.queryName}%`,
      });
    }

    // Filter by date range
    if (body.startDate) {
      const startDate = new Date(body.startDate);
      query.andWhere('actionHistory.timestamp >= :startDate', {
        startDate,
      });
    }

    if (body.endDate) {
      const endDate = new Date(body.endDate);
      query.andWhere('actionHistory.timestamp <= :endDate', {
        endDate,
      });
    }

    // Dynamic ordering
    const sortBy = body.sortBy || 'timestamp';
    const sortOrder = body.sortOrder || 'DESC';

    // Map sortBy to actual column names
    const sortColumn = this.getSortColumn(sortBy);
    query.orderBy(sortColumn, sortOrder);

    // Pagination
    const page = body.page || 1;
    const size = body.size || 10;
    const skip = (page - 1) * size;

    query.skip(skip).take(size);

    // Execute query and get total count
    const [data, total] = await query.getManyAndCount();

    return {
      data,
      pagination: {
        page,
        size,
        total,
        totalPages: Math.ceil(total / size),
      },
    };
  }

  private getSortColumn(sortBy: string): string {
    const sortMapping: { [key: string]: string } = {
      timestamp: 'actionHistory.timestamp',
      status: 'actionHistory.status',
      actionName: 'action.name',
      actionState: 'action.state',
      actuatorId: 'actionHistory.actuator_id',
      actionId: 'actionHistory.action_id',
    };

    return sortMapping[sortBy] || 'actionHistory.timestamp';
  }
}
