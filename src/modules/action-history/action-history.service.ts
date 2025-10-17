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

    // Filter by date - Vietnamese date format (dd/MM/yyyy HH:mm:ss)
    if (body.date) {
      this.applyTimeSearch(query, body.date);
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

  async downloadCsv(params?: SearchActionHistoryDto) {
    try {
      const queryBuilder = this.actionHistoryRepository
        .createQueryBuilder('actionHistory')
        .leftJoinAndSelect('actionHistory.action', 'action')
        .leftJoinAndSelect('actionHistory.actuator', 'actuator');

      // Apply filters if params are provided
      if (params) {
        // Filter by actuator IDs
        if (params.actuatorIds && params.actuatorIds.length > 0) {
          queryBuilder.andWhere(
            'actionHistory.actuator_id IN (:...actuatorIds)',
            {
              actuatorIds: params.actuatorIds,
            },
          );
        }

        // Filter by action IDs
        if (params.actionIds && params.actionIds.length > 0) {
          queryBuilder.andWhere('actionHistory.action_id IN (:...actionIds)', {
            actionIds: params.actionIds,
          });
        }

        // Filter by status
        if (params.status) {
          queryBuilder.andWhere('actionHistory.status = :status', {
            status: params.status,
          });
        }

        // Filter by date - Vietnamese date format (dd/MM/yyyy HH:mm:ss)
        if (params.date) {
          this.applyTimeSearch(queryBuilder, params.date);
        }

        // Add sorting
        const sortBy = params.sortBy || 'timestamp';
        const sortOrder = params.sortOrder || 'DESC';
        const sortColumn = this.getSortColumn(sortBy);
        queryBuilder.orderBy(sortColumn, sortOrder);
      } else {
        // Default ordering if no params
        queryBuilder.orderBy('actionHistory.timestamp', 'DESC');
      }

      // Get all data without pagination
      const actionHistoryData = await queryBuilder.getMany();

      if (!actionHistoryData || actionHistoryData.length === 0) {
        return {
          success: false,
          message: 'No data found',
          data: null,
        };
      }

      // CSV headers
      const headers = [
        'ID',
        'Action ID',
        'Action Name',
        'Action State',
        'Actuator ID',
        'Actuator Name',
        'Status',
        'Timestamp',
      ];

      // Convert data to CSV format
      const csvRows: string[] = [];
      csvRows.push(headers.join(','));

      actionHistoryData.forEach((data) => {
        const row = [
          data.id,
          data.action_id,
          `"${(data.action?.name || 'Unknown').replace(/"/g, '""')}"`,
          `"${(data.action?.state || 'Unknown').replace(/"/g, '""')}"`,
          data.actuator_id,
          `"${(data.actuator?.name || 'Unknown').replace(/"/g, '""')}"`,
          `"${data.status.replace(/"/g, '""')}"`,
          data.timestamp.toISOString(),
        ];
        csvRows.push(row.join(','));
      });

      const csvContent = csvRows.join('\n');

      return {
        success: true,
        message: 'CSV data generated successfully',
        data: {
          content: csvContent,
          filename: `action_history_${new Date().toISOString().split('T')[0]}.csv`,
          contentType: 'text/csv',
          totalRecords: actionHistoryData.length,
        },
      };
    } catch (e) {
      console.error('Error generating CSV:', e);
      return {
        success: false,
        message: 'Error generating CSV file',
        data: null,
      };
    }
  }

  private isVietnameseDateFormat(value: string): boolean {
    const patterns = [
      /^(\d{4})$/, // yyyy
      /^(\d{1,2})\/(\d{4})$/, // MM/yyyy
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, // dd/MM/yyyy
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s(\d{1,2})$/, // dd/MM/yyyy HH
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s(\d{1,2}):(\d{1,2})$/, // dd/MM/yyyy HH:mm
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s(\d{1,2}):(\d{1,2}):(\d{1,2})$/, // dd/MM/yyyy HH:mm:ss
    ];

    return patterns.some((pattern) => pattern.test(value.trim()));
  }

  private applyTimeSearch(queryBuilder: any, timeValue: string) {
    try {
      // Remove any whitespace
      const cleanTimeValue = timeValue.trim();

      // Define patterns for Vietnamese date format (dd/MM/yyyy HH:mm:ss)
      const patterns = {
        year: /^(\d{4})$/, // yyyy
        month: /^(\d{1,2})\/(\d{4})$/, // MM/yyyy
        day: /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, // dd/MM/yyyy
        hour: /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s(\d{1,2})$/, // dd/MM/yyyy HH
        minute: /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s(\d{1,2}):(\d{1,2})$/, // dd/MM/yyyy HH:mm
        second:
          /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s(\d{1,2}):(\d{1,2}):(\d{1,2})$/, // dd/MM/yyyy HH:mm:ss
      };

      let startDate: Date | undefined;
      let endDate: Date | undefined;

      if (patterns.second.test(cleanTimeValue)) {
        // Search by exact second - dd/MM/yyyy HH:mm:ss
        const match = patterns.second.exec(cleanTimeValue);
        if (match) {
          const [, day, month, year, hour, minute, second] = match;
          startDate = new Date(
            Number(year),
            Number(month) - 1,
            Number(day),
            Number(hour),
            Number(minute),
            Number(second),
          );
          endDate = new Date(startDate.getTime() + 999); // Add 999ms for same second
        }
      } else if (patterns.minute.test(cleanTimeValue)) {
        // Search within the minute - dd/MM/yyyy HH:mm
        const match = patterns.minute.exec(cleanTimeValue);
        if (match) {
          const [, day, month, year, hour, minute] = match;
          startDate = new Date(
            Number(year),
            Number(month) - 1,
            Number(day),
            Number(hour),
            Number(minute),
            0,
          );
          endDate = new Date(
            Number(year),
            Number(month) - 1,
            Number(day),
            Number(hour),
            Number(minute),
            59,
            999,
          );
        }
      } else if (patterns.hour.test(cleanTimeValue)) {
        // Search within the hour - dd/MM/yyyy HH
        const match = patterns.hour.exec(cleanTimeValue);
        if (match) {
          const [, day, month, year, hour] = match;
          startDate = new Date(
            Number(year),
            Number(month) - 1,
            Number(day),
            Number(hour),
            0,
            0,
          );
          endDate = new Date(
            Number(year),
            Number(month) - 1,
            Number(day),
            Number(hour),
            59,
            59,
            999,
          );
        }
      } else if (patterns.day.test(cleanTimeValue)) {
        // Search within the day - dd/MM/yyyy
        const match = patterns.day.exec(cleanTimeValue);
        if (match) {
          const [, day, month, year] = match;
          startDate = new Date(
            Number(year),
            Number(month) - 1,
            Number(day),
            0,
            0,
            0,
          );
          endDate = new Date(
            Number(year),
            Number(month) - 1,
            Number(day),
            23,
            59,
            59,
            999,
          );
        }
      } else if (patterns.month.test(cleanTimeValue)) {
        // Search within the month - MM/yyyy
        const match = patterns.month.exec(cleanTimeValue);
        if (match) {
          const [, month, year] = match;
          startDate = new Date(Number(year), Number(month) - 1, 1, 0, 0, 0);
          // Get the last day of the month
          const nextMonth = new Date(Number(year), Number(month), 1);
          endDate = new Date(nextMonth.getTime() - 1);
        }
      } else if (patterns.year.test(cleanTimeValue)) {
        // Search within the year - yyyy
        const match = patterns.year.exec(cleanTimeValue);
        if (match) {
          const [, year] = match;
          startDate = new Date(Number(year), 0, 1, 0, 0, 0);
          endDate = new Date(Number(year), 11, 31, 23, 59, 59, 999);
        }
      } else {
        // If format doesn't match Vietnamese format, don't search
        console.warn(
          'Invalid date format. Expected format: dd/MM/yyyy HH:mm:ss or shorter',
        );
        return;
      }

      // Apply date range filter
      if (
        startDate &&
        endDate &&
        !Number.isNaN(startDate.getTime()) &&
        !Number.isNaN(endDate.getTime())
      ) {
        queryBuilder.andWhere(
          'actionHistory.timestamp >= :startTime AND actionHistory.timestamp <= :endTime',
          {
            startTime: startDate,
            endTime: endDate,
          },
        );
      }
    } catch (error) {
      console.error('Error parsing time search:', error);
      console.warn(
        'Expected format: dd/MM/yyyy HH:mm:ss or shorter (e.g., 17/10/2025 10:13:56)',
      );
    }
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
