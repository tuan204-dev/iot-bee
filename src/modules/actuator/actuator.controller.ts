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
import { ActuatorService } from './actuator.service';
import { ActuatorEntity } from './actuator.entity';

@Controller('actuators')
export class ActuatorController {
  constructor(private readonly actuatorService: ActuatorService) {}

  @Get()
  async findAll(): Promise<ActuatorEntity[]> {
    return this.actuatorService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ActuatorEntity | null> {
    return this.actuatorService.findOne(+id);
  }

  @Get('device/:deviceId')
  async findByDeviceId(
    @Param('deviceId') deviceId: string,
  ): Promise<ActuatorEntity[]> {
    return this.actuatorService.findByDeviceId(+deviceId);
  }

  @Post()
  async create(
    @Body() createActuatorDto: Partial<ActuatorEntity>,
  ): Promise<ActuatorEntity> {
    return this.actuatorService.create(createActuatorDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateActuatorDto: Partial<ActuatorEntity>,
  ): Promise<ActuatorEntity | null> {
    return this.actuatorService.update(+id, updateActuatorDto);
  }

  @Patch(':id/state')
  async updateState(
    @Param('id') id: string,
    @Body('state') state: string,
  ): Promise<ActuatorEntity | null> {
    return this.actuatorService.updateState(+id, state);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.actuatorService.remove(+id);
  }
}
