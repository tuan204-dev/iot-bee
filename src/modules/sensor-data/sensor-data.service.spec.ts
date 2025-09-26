import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SensorDataService } from './sensor-data.service';
import { SensorDataEntity } from './sensor-data.entity';
import { ISearchSensorDataParams } from './sensor-data.interface';

describe('SensorDataService', () => {
  let service: SensorDataService;
  let repository: Repository<SensorDataEntity>;

  const mockRepository = {
    createQueryBuilder: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getCount: jest.fn().mockResolvedValue(10),
    getMany: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SensorDataService,
        {
          provide: getRepositoryToken(SensorDataEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<SensorDataService>(SensorDataService);
    repository = module.get<Repository<SensorDataEntity>>(
      getRepositoryToken(SensorDataEntity),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findSensorData', () => {
    beforeEach(() => {
      mockRepository.createQueryBuilder.mockReturnValue(mockRepository);
    });

    it('should return sensor data with pagination', async () => {
      const params: ISearchSensorDataParams = {
        page: 1,
        size: 10,
        sensorIds: ['1'],
        unit: '°C',
      };

      const result = await service.findSensorData(params);

      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('sd');
      expect(mockRepository.leftJoinAndSelect).toHaveBeenCalledWith(
        'sd.sensor',
        'sensor',
      );
      expect(mockRepository.andWhere).toHaveBeenCalledWith(
        'sd.sensor_id IN (:...sensorIds)',
        { sensorIds: ['1'] },
      );
      expect(mockRepository.andWhere).toHaveBeenCalledWith('sd.unit = :unit', {
        unit: '°C',
      });
      expect(result).toEqual({
        data: [],
        pagination: {
          page: 1,
          size: 10,
          total: 10,
          totalPages: 1,
        },
      });
    });

    it('should handle date range filters', async () => {
      const params: ISearchSensorDataParams = {
        startDate: 1640995200000, // 2022-01-01
        endDate: 1672531200000, // 2023-01-01
      };

      await service.findSensorData(params);

      expect(mockRepository.andWhere).toHaveBeenCalledWith(
        'sd.timestamp >= :startDate',
        {
          startDate: new Date(1640995200000),
        },
      );
      expect(mockRepository.andWhere).toHaveBeenCalledWith(
        'sd.timestamp <= :endDate',
        {
          endDate: new Date(1672531200000),
        },
      );
    });

    it('should handle value range filters', async () => {
      const params: ISearchSensorDataParams = {
        startValue: 10,
        endValue: 30,
      };

      await service.findSensorData(params);

      expect(mockRepository.andWhere).toHaveBeenCalledWith(
        'sd.value >= :startValue',
        { startValue: 10 },
      );
      expect(mockRepository.andWhere).toHaveBeenCalledWith(
        'sd.value <= :endValue',
        { endValue: 30 },
      );
    });

    it('should return error response on exception', async () => {
      mockRepository.createQueryBuilder.mockImplementation(() => {
        throw new Error('Database error');
      });

      const result = await service.findSensorData({});

      expect(result).toEqual({
        data: [],
        pagination: {
          page: 1,
          size: 10,
          total: 0,
          totalPages: 0,
        },
      });
    });
  });
});
