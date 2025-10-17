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
        searchField,
        searchValue,
        sortBy = 'timestamp',
        sortOrder = 'DESC',
      } = params ?? {};

      const queryBuilder = this.sensorDataRepository
        .createQueryBuilder('sd')
        .leftJoinAndSelect('sd.sensor', 'sensor');

      // Apply search logic based on searchField and searchValue
      if (searchValue && searchValue.trim() !== '') {
        switch (searchField) {
          case 'all':
            // Search across all fields intelligently (include smart time search)
            // Check if searchValue matches Vietnamese date format
            if (this.isVietnameseDateFormat(searchValue)) {
              // If it's a valid date format, search in time + other fields
              const subQuery = this.sensorDataRepository
                .createQueryBuilder('sd_sub')
                .select('sd_sub.id');

              this.applyTimeSearch(subQuery, searchValue);

              queryBuilder.andWhere(
                '(CAST(sd.sensor_id AS TEXT) ILIKE :searchValue OR ' +
                  'sensor.name ILIKE :searchValue OR ' +
                  'CAST(sd.value AS TEXT) ILIKE :searchValue OR ' +
                  'sd.unit ILIKE :searchValue OR ' +
                  `sd.id IN (${subQuery.getQuery()}))`,
                {
                  searchValue: `%${searchValue}%`,
                  ...subQuery.getParameters(),
                },
              );
            } else {
              // Regular search without time
              queryBuilder.andWhere(
                '(CAST(sd.sensor_id AS TEXT) ILIKE :searchValue OR ' +
                  'sensor.name ILIKE :searchValue OR ' +
                  'CAST(sd.value AS TEXT) ILIKE :searchValue OR ' +
                  'sd.unit ILIKE :searchValue)',
                { searchValue: `%${searchValue}%` },
              );
            }
            break;

          case 'id': {
            // Search by sensor ID
            const numericId = Number.parseInt(searchValue, 10);
            if (!Number.isNaN(numericId)) {
              queryBuilder.andWhere('sd.sensor_id = :sensorId', {
                sensorId: numericId,
              });
            }
            break;
          }

          case 'name':
            // Search by sensor name
            queryBuilder.andWhere('sensor.name ILIKE :name', {
              name: `%${searchValue}%`,
            });
            break;

          case 'temp': {
            // Search by temperature value (°C)
            queryBuilder.andWhere('sd.unit = :tempUnit', { tempUnit: '°C' });
            const tempValue = Number.parseFloat(searchValue);
            if (!Number.isNaN(tempValue)) {
              queryBuilder.andWhere('sd.value = :tempValue', { tempValue });
            }
            break;
          }

          case 'humidity': {
            // Search by humidity value (%)
            queryBuilder.andWhere('sd.unit = :humidityUnit', {
              humidityUnit: '%',
            });
            const humidityValue = Number.parseFloat(searchValue);
            if (!Number.isNaN(humidityValue)) {
              queryBuilder.andWhere('sd.value = :humidityValue', {
                humidityValue,
              });
            }
            break;
          }

          case 'light': {
            // Search by light value (lx)
            queryBuilder.andWhere('sd.unit = :lightUnit', { lightUnit: 'lx' });
            const lightValue = Number.parseFloat(searchValue);
            if (!Number.isNaN(lightValue)) {
              queryBuilder.andWhere('sd.value = :lightValue', { lightValue });
            }
            break;
          }

          case 'time':
            // Flexible time search
            this.applyTimeSearch(queryBuilder, searchValue);
            break;
        }
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
          'sd.timestamp >= :startTime AND sd.timestamp <= :endTime',
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

  async downloadCsv(params?: SearchSensorDataDto) {
    try {
      const {
        searchField,
        searchValue,
        sortBy = 'timestamp',
        sortOrder = 'DESC',
      } = params ?? {};

      const queryBuilder = this.sensorDataRepository
        .createQueryBuilder('sd')
        .leftJoinAndSelect('sd.sensor', 'sensor');

      // Apply search logic based on searchField and searchValue (same as findSensorData)
      if (searchValue && searchValue.trim() !== '') {
        switch (searchField) {
          case 'all':
            // Search across all fields intelligently (include smart time search)
            // Check if searchValue matches Vietnamese date format
            if (this.isVietnameseDateFormat(searchValue)) {
              // If it's a valid date format, search in time + other fields
              const subQuery = this.sensorDataRepository
                .createQueryBuilder('sd_sub')
                .select('sd_sub.id');

              this.applyTimeSearch(subQuery, searchValue);

              queryBuilder.andWhere(
                '(CAST(sd.sensor_id AS TEXT) ILIKE :searchValue OR ' +
                  'sensor.name ILIKE :searchValue OR ' +
                  'CAST(sd.value AS TEXT) ILIKE :searchValue OR ' +
                  'sd.unit ILIKE :searchValue OR ' +
                  `sd.id IN (${subQuery.getQuery()}))`,
                {
                  searchValue: `%${searchValue}%`,
                  ...subQuery.getParameters(),
                },
              );
            } else {
              // Regular search without time
              queryBuilder.andWhere(
                '(CAST(sd.sensor_id AS TEXT) ILIKE :searchValue OR ' +
                  'sensor.name ILIKE :searchValue OR ' +
                  'CAST(sd.value AS TEXT) ILIKE :searchValue OR ' +
                  'sd.unit ILIKE :searchValue)',
                { searchValue: `%${searchValue}%` },
              );
            }
            break;

          case 'id': {
            // Search by sensor ID
            const numericId = Number.parseInt(searchValue, 10);
            if (!Number.isNaN(numericId)) {
              queryBuilder.andWhere('sd.sensor_id = :sensorId', {
                sensorId: numericId,
              });
            }
            break;
          }

          case 'name':
            // Search by sensor name
            queryBuilder.andWhere('sensor.name ILIKE :name', {
              name: `%${searchValue}%`,
            });
            break;

          case 'temp': {
            // Search by temperature value (°C)
            queryBuilder.andWhere('sd.unit = :tempUnit', { tempUnit: '°C' });
            const tempValue = Number.parseFloat(searchValue);
            if (!Number.isNaN(tempValue)) {
              queryBuilder.andWhere('sd.value = :tempValue', { tempValue });
            }
            break;
          }

          case 'humidity': {
            // Search by humidity value (%)
            queryBuilder.andWhere('sd.unit = :humidityUnit', {
              humidityUnit: '%',
            });
            const humidityValue = Number.parseFloat(searchValue);
            if (!Number.isNaN(humidityValue)) {
              queryBuilder.andWhere('sd.value = :humidityValue', {
                humidityValue,
              });
            }
            break;
          }

          case 'light': {
            // Search by light value (lx)
            queryBuilder.andWhere('sd.unit = :lightUnit', { lightUnit: 'lx' });
            const lightValue = Number.parseFloat(searchValue);
            if (!Number.isNaN(lightValue)) {
              queryBuilder.andWhere('sd.value = :lightValue', { lightValue });
            }
            break;
          }

          case 'time':
            // Flexible time search
            this.applyTimeSearch(queryBuilder, searchValue);
            break;
        }
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

      for (const data of sensorData) {
        const row = [
          data.id,
          data.sensor_id,
          `"${(data.sensor?.name || 'Unknown').replaceAll('"', '""')}"`,
          data.value,
          `"${data.unit}"`,
          data.timestamp.toISOString(),
        ];
        csvRows.push(row.join(','));
      }

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
