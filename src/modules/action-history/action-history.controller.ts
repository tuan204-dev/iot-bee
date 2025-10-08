import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { ActionHistoryService } from './action-history.service';
import { ActionHistoryEntity } from './action-history.entity';
import { SearchActionHistoryDto } from './dto/search-action-history.dto';

@ApiTags('action-history')
@Controller('action-histories')
export class ActionHistoryController {
  constructor(private readonly actionHistoryService: ActionHistoryService) {}

  @Get()
  @ApiOperation({ summary: 'Get all action histories' })
  async findAll(): Promise<ActionHistoryEntity[]> {
    return this.actionHistoryService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an action history by ID' })
  @ApiParam({ name: 'id', description: 'Action history ID' })
  async findOne(@Param('id') id: string): Promise<ActionHistoryEntity | null> {
    return this.actionHistoryService.findOne(+id);
  }

  @Get('action/:actionId')
  @ApiOperation({ summary: 'Get action histories by action ID' })
  @ApiParam({ name: 'actionId', description: 'Action ID' })
  async findByActionId(
    @Param('actionId') actionId: string,
  ): Promise<ActionHistoryEntity[]> {
    return this.actionHistoryService.findByActionId(+actionId);
  }

  @Get('actuator/:actuatorId')
  @ApiOperation({ summary: 'Get action histories by actuator ID' })
  @ApiParam({ name: 'actuatorId', description: 'Actuator ID' })
  async findByActuatorId(
    @Param('actuatorId') actuatorId: string,
  ): Promise<ActionHistoryEntity[]> {
    return this.actionHistoryService.findByActuatorId(+actuatorId);
  }

  @Get('download-csv')
  @ApiOperation({ summary: 'Download all action history as CSV' })
  async downloadCsv(@Res() res: Response) {
    const result = await this.actionHistoryService.downloadCsv();

    if (!result.success || !result.data) {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }

    // Set headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${result.data.filename}"`,
    );
    res.setHeader('Content-Length', Buffer.byteLength(result.data.content));

    return res.send(result.data.content);
  }

  @Post('download-csv')
  @ApiOperation({ summary: 'Download action history as CSV with filters' })
  async downloadCsvWithParams(
    @Res() res: Response,
    @Body() params: SearchActionHistoryDto,
  ) {
    const result = await this.actionHistoryService.downloadCsv(params);

    if (!result.success || !result.data) {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }

    // Set headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${result.data.filename}"`,
    );
    res.setHeader('Content-Length', Buffer.byteLength(result.data.content));

    return res.send(result.data.content);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new action history' })
  async create(
    @Body() createActionHistoryDto: Partial<ActionHistoryEntity>,
  ): Promise<ActionHistoryEntity> {
    return this.actionHistoryService.create(createActionHistoryDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an action history' })
  @ApiParam({ name: 'id', description: 'Action history ID' })
  async update(
    @Param('id') id: string,
    @Body() updateActionHistoryDto: Partial<ActionHistoryEntity>,
  ): Promise<ActionHistoryEntity | null> {
    return this.actionHistoryService.update(+id, updateActionHistoryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an action history' })
  @ApiParam({ name: 'id', description: 'Action history ID' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.actionHistoryService.remove(+id);
  }

  @Post('/search')
  @ApiOperation({ summary: 'Search action histories with filters' })
  async search(@Body() body: SearchActionHistoryDto) {
    return this.actionHistoryService.search(body);
  }
}
