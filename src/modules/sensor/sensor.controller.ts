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

  @Get(':id')
  @ApiOperation({ summary: 'Get a sensor by ID' })
  @ApiParam({ name: 'id', description: 'Sensor ID' })
  async findOne(@Param('id') id: string): Promise<SensorEntity | null> {
    return this.sensorService.findOne(+id);
  }

  @Get('device/:deviceId')
  @ApiOperation({ summary: 'Get all sensors for a device' })
  @ApiParam({ name: 'deviceId', description: 'Device ID' })
  async findByDeviceId(
    @Param('deviceId') deviceId: string,
  ): Promise<SensorEntity[]> {
    return this.sensorService.findByDeviceId(+deviceId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new sensor' })
  async create(
    @Body() createSensorDto: Partial<SensorEntity>,
  ): Promise<SensorEntity> {
    return this.sensorService.create(createSensorDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a sensor' })
  @ApiParam({ name: 'id', description: 'Sensor ID' })
  async update(
    @Param('id') id: string,
    @Body() updateSensorDto: Partial<SensorEntity>,
  ): Promise<SensorEntity | null> {
    return this.sensorService.update(+id, updateSensorDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a sensor' })
  @ApiParam({ name: 'id', description: 'Sensor ID' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.sensorService.remove(+id);
  }
}
