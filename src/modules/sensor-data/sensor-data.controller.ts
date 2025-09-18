import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { SensorDataService } from './sensor-data.service';
import { SensorDataEntity } from './sensor-data.entity';

@Controller('sensor-data')
export class SensorDataController {
  constructor(private readonly sensorDataService: SensorDataService) {}

  @Get()
  async findAll(): Promise<SensorDataEntity[]> {
    return this.sensorDataService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<SensorDataEntity | null> {
    return this.sensorDataService.findOne(+id);
  }

  @Get('sensor/:sensorId')
  async findBySensorId(
    @Param('sensorId') sensorId: string,
  ): Promise<SensorDataEntity[]> {
    return this.sensorDataService.findBySensorId(+sensorId);
  }

  @Get('sensor/:sensorId/latest')
  async findLatestBySensorId(
    @Param('sensorId') sensorId: string,
  ): Promise<SensorDataEntity | null> {
    return this.sensorDataService.findLatestBySensorId(+sensorId);
  }

  @Post()
  async create(
    @Body() createSensorDataDto: Partial<SensorDataEntity>,
  ): Promise<SensorDataEntity> {
    return this.sensorDataService.create(createSensorDataDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateSensorDataDto: Partial<SensorDataEntity>,
  ): Promise<SensorDataEntity | null> {
    return this.sensorDataService.update(+id, updateSensorDataDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.sensorDataService.remove(+id);
  }
}
