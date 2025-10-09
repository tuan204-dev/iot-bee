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

  private static readonly samplingInterval = 2; //second

  //   duration is second
  async getRecentSensorData() {
    try {
      // Fixed to 5 minutes (300 seconds)
      const fixedDuration = 300; // 5 minutes in seconds
      const now = new Date();
      const startTime = new Date(now.getTime() - fixedDuration * 1000);

      // Query to get all data in the last 5 minutes
      const recentData = await this.sensorDataRepository
        .createQueryBuilder('sd')
        .leftJoinAndSelect('sd.sensor', 'sensor')
        .where('sd.timestamp >= :startTime', { startTime })
        .andWhere('sd.timestamp <= :endTime', { endTime: now })
        .orderBy('sd.timestamp', 'ASC')
        .getMany();

      // Calculate number of intervals for 5 minutes
      const intervalCount = Math.ceil(
        fixedDuration / SensorDataService.samplingInterval,
      );

      // Generate time slots based on sampling interval
      const generateTimeSlots = () => {
        const slots: Date[] = [];
        for (let i = intervalCount - 1; i >= 0; i--) {
          const slotTime = new Date(
            now.getTime() - i * SensorDataService.samplingInterval * 1000,
          );
          slots.push(slotTime);
        }
        return slots;
      };

      const timeSlots = generateTimeSlots();

      // Group data by sensor type and time intervals
      const intervalData: Record<
        string,
        Record<string, { values: number[]; count: number }>
      > = {
        temperature: {},
        humidity: {},
        light: {},
      };

      // Initialize all time slots for each sensor type
      ['temperature', 'humidity', 'light'].forEach((sensorType) => {
        timeSlots.forEach((slotTime) => {
          const slotKey = slotTime.toISOString();
          intervalData[sensorType][slotKey] = { values: [], count: 0 };
        });
      });

      // Group data by time interval and sensor type
      recentData.forEach((data: SensorDataEntity) => {
        const dataTime = new Date(data.timestamp);

        // Find the closest time slot for this data point
        let closestSlot = timeSlots[0];
        let minDiff = Math.abs(dataTime.getTime() - timeSlots[0].getTime());

        timeSlots.forEach((slot) => {
          const diff = Math.abs(dataTime.getTime() - slot.getTime());
          if (diff < minDiff) {
            minDiff = diff;
            closestSlot = slot;
          }
        });

        // Only include if within half of sampling interval
        const maxDiff = (SensorDataService.samplingInterval * 1000) / 2;
        if (minDiff <= maxDiff) {
          const slotKey = closestSlot.toISOString();

          let sensorType = '';
          if (data.unit === '°C') {
            sensorType = 'temperature';
          } else if (data.unit === '%') {
            sensorType = 'humidity';
          } else if (data.unit === 'lx') {
            sensorType = 'light';
          }

          if (sensorType && intervalData[sensorType][slotKey]) {
            intervalData[sensorType][slotKey].values.push(data.value);
            intervalData[sensorType][slotKey].count++;
          }
        }
      });

      // Calculate averages and format result
      const result: Record<string, any[]> = {
        temperature: [],
        humidity: [],
        light: [],
      };

      Object.keys(intervalData).forEach((sensorType) => {
        timeSlots.forEach((slotTime) => {
          const slotKey = slotTime.toISOString();
          const slotData = intervalData[sensorType][slotKey];

          // Calculate average or return 0 if no data
          const average =
            slotData.values.length > 0
              ? slotData.values.reduce((sum, val) => sum + val, 0) /
                slotData.values.length
              : 0; // Return 0 if no data

          result[sensorType].push({
            timestamp: slotTime.toISOString(),
            value: Math.round(average * 100) / 100, // Round to 2 decimal places
          });
        });
      });

      return {
        success: true,
        data: result,
        message: 'Sensor data retrieved successfully',
        duration_seconds: fixedDuration,
        sampling_interval_seconds: SensorDataService.samplingInterval,
        total_intervals: intervalCount,
        retrieved_at: now.toISOString(),
      };
    } catch (e) {
      console.error('Error fetching recent sensor data:', e);
      return {
        success: false,
        data: {
          temperature: [],
          humidity: [],
          light: [],
        },
        message: 'Error fetching recent sensor data',
        error: e instanceof Error ? e.message : 'Unknown error',
      };
    }
  }
}
