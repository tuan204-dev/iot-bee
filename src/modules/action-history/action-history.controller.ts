import { Body, Controller, Post, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { ActionHistoryService } from './action-history.service';
import { SearchActionHistoryDto } from './dto/search-action-history.dto';

@ApiTags('action-history')
@Controller('action-histories')
export class ActionHistoryController {
  constructor(private readonly actionHistoryService: ActionHistoryService) {}

  @Post('/search')
  @ApiOperation({ summary: 'Search action histories with filters' })
  async search(@Body() body: SearchActionHistoryDto) {
    return this.actionHistoryService.search(body);
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
}
