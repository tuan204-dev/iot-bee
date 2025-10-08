import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Patch,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { ActuatorService } from './actuator.service';
import { ActuatorEntity } from './actuator.entity';

@ApiTags('actuator')
@Controller('actuators')
export class ActuatorController {
  constructor(private readonly actuatorService: ActuatorService) {}

  @Get()
  @ApiOperation({ summary: 'Get all actuators' })
  async findAll(): Promise<ActuatorEntity[]> {
    return this.actuatorService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an actuator by ID' })
  @ApiParam({ name: 'id', description: 'Actuator ID' })
  async findOne(@Param('id') id: string): Promise<ActuatorEntity | null> {
    return this.actuatorService.findOne(+id);
  }

  @Get('device/:deviceId')
  @ApiOperation({ summary: 'Get all actuators for a device' })
  @ApiParam({ name: 'deviceId', description: 'Device ID' })
  async findByDeviceId(
    @Param('deviceId') deviceId: string,
  ): Promise<ActuatorEntity[]> {
    return this.actuatorService.findByDeviceId(+deviceId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new actuator' })
  async create(
    @Body() createActuatorDto: Partial<ActuatorEntity>,
  ): Promise<ActuatorEntity> {
    return this.actuatorService.create(createActuatorDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an actuator' })
  @ApiParam({ name: 'id', description: 'Actuator ID' })
  async update(
    @Param('id') id: string,
    @Body() updateActuatorDto: Partial<ActuatorEntity>,
  ): Promise<ActuatorEntity | null> {
    return this.actuatorService.update(+id, updateActuatorDto);
  }

  @Patch(':id/state')
  @ApiOperation({ summary: 'Update actuator state' })
  @ApiParam({ name: 'id', description: 'Actuator ID' })
  async updateState(
    @Param('id') id: string,
    @Body('state') state: string,
  ): Promise<ActuatorEntity | null> {
    return this.actuatorService.updateState(+id, state);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an actuator' })
  @ApiParam({ name: 'id', description: 'Actuator ID' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.actuatorService.remove(+id);
  }
}
