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
import { ActionService } from './action.service';
import { ActionEntity } from './action.entity';

@ApiTags('action')
@Controller('actions')
export class ActionController {
  constructor(private readonly actionService: ActionService) {}

  @Get()
  @ApiOperation({ summary: 'Get all actions' })
  async findAll(): Promise<ActionEntity[]> {
    return this.actionService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an action by ID' })
  @ApiParam({ name: 'id', description: 'Action ID' })
  async findOne(@Param('id') id: string): Promise<ActionEntity | null> {
    return this.actionService.findOne(+id);
  }

  @Get('device/:deviceId')
  @ApiOperation({ summary: 'Get all actions for a device' })
  @ApiParam({ name: 'deviceId', description: 'Device ID' })
  async findByDeviceId(
    @Param('deviceId') deviceId: string,
  ): Promise<ActionEntity[]> {
    return this.actionService.findByDeviceId(+deviceId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new action' })
  async create(
    @Body() createActionDto: Partial<ActionEntity>,
  ): Promise<ActionEntity> {
    return this.actionService.create(createActionDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an action' })
  @ApiParam({ name: 'id', description: 'Action ID' })
  async update(
    @Param('id') id: string,
    @Body() updateActionDto: Partial<ActionEntity>,
  ): Promise<ActionEntity | null> {
    return this.actionService.update(+id, updateActionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an action' })
  @ApiParam({ name: 'id', description: 'Action ID' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.actionService.remove(+id);
  }
}
