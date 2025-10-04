import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SensorDataEntity } from './sensor-data.entity';
import { SearchSensorDataDto } from './dto/search-sensor-data.dto';

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
        sensor_id: 3,
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
        sensor_id: 2,
        timestamp: new Date(),
      });
      return this.sensorDataRepository.save(sensorData);
    } catch (e) {
      console.error('Error saving light data:', e);
      return null;
    }
  }

  async findSensorData(params: SearchSensorDataDto) {
    try {
      const {
        page = 1,
        size = 10,
        startDate,
        endDate,
        unit,
        startValue,
        endValue,
        sensorIds = [],
        sortBy = 'timestamp',
        sortOrder = 'DESC',
      } = params ?? {};

      const queryBuilder = this.sensorDataRepository
        .createQueryBuilder('sd')
        .leftJoinAndSelect('sd.sensor', 'sensor');

      // Filter by sensor IDs
      if (sensorIds && sensorIds.length > 0) {
        queryBuilder.andWhere('sd.sensor_id IN (:...sensorIds)', { sensorIds });
      }

      // Filter by unit
      if (unit) {
        queryBuilder.andWhere('sd.unit = :unit', { unit });
      }

      // Filter by date range
      if (startDate) {
        queryBuilder.andWhere('sd.timestamp >= :startDate', {
          startDate: new Date(startDate),
        });
      }

      if (endDate) {
        queryBuilder.andWhere('sd.timestamp <= :endDate', {
          endDate: new Date(endDate),
        });
      }

      // Filter by value range
      if (startValue !== undefined) {
        queryBuilder.andWhere('sd.value >= :startValue', { startValue });
      }

      if (endValue !== undefined) {
        queryBuilder.andWhere('sd.value <= :endValue', { endValue });
      }

      // Add sorting
      const allowedSortFields = [
        'timestamp',
        'value',
        'unit',
        'sensor_id',
        'id',
      ];
      const sortField = allowedSortFields.includes(sortBy)
        ? sortBy
        : 'timestamp';
      queryBuilder.orderBy(`sd.${sortField}`, sortOrder);

      // Add pagination
      const skip = (page - 1) * size;
      queryBuilder.skip(skip).take(size);

      // Get total count for pagination info
      const totalCount = await queryBuilder.getCount();
      const data = await queryBuilder.getMany();

      return {
        data,
        pagination: {
          page,
          size,
          total: totalCount,
          totalPages: Math.ceil(totalCount / size),
        },
      };
    } catch (e) {
      console.error('Error finding sensor data:', e);
      return {
        data: [],
        pagination: {
          page: 1,
          size: 10,
          total: 0,
          totalPages: 0,
        },
      };
    }
  }

  async downloadCsv(params?: SearchSensorDataDto) {
    try {
      const {
        startDate,
        endDate,
        unit,
        startValue,
        endValue,
        sensorIds = [],
        sortBy = 'timestamp',
        sortOrder = 'DESC',
      } = params ?? {};

      const queryBuilder = this.sensorDataRepository
        .createQueryBuilder('sd')
        .leftJoinAndSelect('sd.sensor', 'sensor');

      // Filter by sensor IDs
      if (sensorIds && sensorIds.length > 0) {
        queryBuilder.andWhere('sd.sensor_id IN (:...sensorIds)', { sensorIds });
      }

      // Filter by unit
      if (unit) {
        queryBuilder.andWhere('sd.unit = :unit', { unit });
      }

      // Filter by date range
      if (startDate) {
        queryBuilder.andWhere('sd.timestamp >= :startDate', {
          startDate: new Date(startDate),
        });
      }

      if (endDate) {
        queryBuilder.andWhere('sd.timestamp <= :endDate', {
          endDate: new Date(endDate),
        });
      }

      // Filter by value range
      if (startValue !== undefined) {
        queryBuilder.andWhere('sd.value >= :startValue', { startValue });
      }

      if (endValue !== undefined) {
        queryBuilder.andWhere('sd.value <= :endValue', { endValue });
      }

      // Add sorting
      const allowedSortFields = [
        'timestamp',
        'value',
        'unit',
        'sensor_id',
        'id',
      ];
      const sortField = allowedSortFields.includes(sortBy)
        ? sortBy
        : 'timestamp';
      queryBuilder.orderBy(`sd.${sortField}`, sortOrder);

      // Get all data without pagination
      const sensorData = await queryBuilder.getMany();

      if (!sensorData || sensorData.length === 0) {
        return {
          success: false,
          message: 'No data found',
          data: null,
        };
      }

      // CSV headers
      const headers = [
        'ID',
        'Sensor ID',
        'Sensor Name',
        'Value',
        'Unit',
        'Timestamp',
      ];

      // Convert data to CSV format
      const csvRows: string[] = [];
      csvRows.push(headers.join(','));

      sensorData.forEach((data) => {
        const row = [
          data.id,
          data.sensor_id,
          `"${(data.sensor?.name || 'Unknown').replace(/"/g, '""')}"`,
          data.value,
          `"${data.unit}"`,
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
          filename: `sensor_data_${new Date().toISOString().split('T')[0]}.csv`,
          contentType: 'text/csv',
          totalRecords: sensorData.length,
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
}
