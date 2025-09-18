import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { SensorService } from './sensor.service';
import { SensorEntity } from './sensor.entity';

@Controller('sensors')
export class SensorController {
  constructor(private readonly sensorService: SensorService) {}

  @Get()
  async findAll(): Promise<SensorEntity[]> {
    return this.sensorService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<SensorEntity | null> {
    return this.sensorService.findOne(+id);
  }

  @Get('device/:deviceId')
  async findByDeviceId(
    @Param('deviceId') deviceId: string,
  ): Promise<SensorEntity[]> {
    return this.sensorService.findByDeviceId(+deviceId);
  }

  @Post()
  async create(
    @Body() createSensorDto: Partial<SensorEntity>,
  ): Promise<SensorEntity> {
    return this.sensorService.create(createSensorDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateSensorDto: Partial<SensorEntity>,
  ): Promise<SensorEntity | null> {
    return this.sensorService.update(+id, updateSensorDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.sensorService.remove(+id);
  }
}
