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
        sensor_id: 2,
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
      const {
        page = 1,
        size = 10,
        startDate,
        endDate,
        unit,
        startValue,
        endValue,
        sensorIds = [],
      } = params ?? {};

      const queryBuilder = this.sensorDataRepository
        .createQueryBuilder('sd')
        .leftJoinAndSelect('sd.sensor', 'sensor')
        .orderBy('sd.timestamp', 'DESC');

      // Filter by sensor IDs
      if (sensorIds.length > 0) {
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
}
