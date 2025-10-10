import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ActuatorEntity } from './actuator.entity';
import { ActuatorService } from './actuator.service';

@ApiTags('actuator')
@Controller('actuators')
export class ActuatorController {
  constructor(private readonly actuatorService: ActuatorService) {}

  @Get()
  @ApiOperation({ summary: 'Get all actuators' })
  async findAll(): Promise<ActuatorEntity[]> {
    return this.actuatorService.findAll();
  }
}
