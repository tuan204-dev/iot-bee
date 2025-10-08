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

  @Get('download-csv')
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
