import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { ActionService } from './action.service';
import { ActionEntity } from './action.entity';

@Controller('actions')
export class ActionController {
  constructor(private readonly actionService: ActionService) {}

  @Get()
  async findAll(): Promise<ActionEntity[]> {
    return this.actionService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ActionEntity | null> {
    return this.actionService.findOne(+id);
  }

  @Get('device/:deviceId')
  async findByDeviceId(
    @Param('deviceId') deviceId: string,
  ): Promise<ActionEntity[]> {
    return this.actionService.findByDeviceId(+deviceId);
  }

  @Post()
  async create(
    @Body() createActionDto: Partial<ActionEntity>,
  ): Promise<ActionEntity> {
    return this.actionService.create(createActionDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateActionDto: Partial<ActionEntity>,
  ): Promise<ActionEntity | null> {
    return this.actionService.update(+id, updateActionDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.actionService.remove(+id);
  }
}
