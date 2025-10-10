import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { SensorService } from './sensor.service';
import { SensorEntity } from './sensor.entity';

@ApiTags('sensor')
@Controller('sensors')
export class SensorController {
  constructor(private readonly sensorService: SensorService) {}

  @Get()
  @ApiOperation({ summary: 'Get all sensors' })
  async findAll(): Promise<SensorEntity[]> {
    return this.sensorService.findAll();
  }
}
