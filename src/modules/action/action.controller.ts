import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ActionEntity } from './action.entity';
import { ActionService } from './action.service';

@ApiTags('action')
@Controller('actions')
export class ActionController {
  constructor(private readonly actionService: ActionService) {}

  @Get()
  @ApiOperation({ summary: 'Get all actions' })
  async findAll(): Promise<ActionEntity[]> {
    return this.actionService.findAll();
  }
}
