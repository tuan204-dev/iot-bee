import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { ActionHistoryService } from './action-history.service';
import { ActionHistoryEntity } from './action-history.entity';
import { SearchActionHistoryDto } from './dto/search-action-history.dto';

@Controller('action-histories')
export class ActionHistoryController {
  constructor(private readonly actionHistoryService: ActionHistoryService) {}

  @Get()
  async findAll(): Promise<ActionHistoryEntity[]> {
    return this.actionHistoryService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ActionHistoryEntity | null> {
    return this.actionHistoryService.findOne(+id);
  }

  @Get('action/:actionId')
  async findByActionId(
    @Param('actionId') actionId: string,
  ): Promise<ActionHistoryEntity[]> {
    return this.actionHistoryService.findByActionId(+actionId);
  }

  @Get('actuator/:actuatorId')
  async findByActuatorId(
    @Param('actuatorId') actuatorId: string,
  ): Promise<ActionHistoryEntity[]> {
    return this.actionHistoryService.findByActuatorId(+actuatorId);
  }

  @Post()
  async create(
    @Body() createActionHistoryDto: Partial<ActionHistoryEntity>,
  ): Promise<ActionHistoryEntity> {
    return this.actionHistoryService.create(createActionHistoryDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateActionHistoryDto: Partial<ActionHistoryEntity>,
  ): Promise<ActionHistoryEntity | null> {
    return this.actionHistoryService.update(+id, updateActionHistoryDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.actionHistoryService.remove(+id);
  }

  @Post('/search')
  async search(@Body() body: SearchActionHistoryDto) {
    return this.actionHistoryService.search(body);
  }
}
