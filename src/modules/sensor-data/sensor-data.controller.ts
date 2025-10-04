import { Body, Controller, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { SearchSensorDataDto } from './dto/search-sensor-data.dto';
import { SensorDataService } from './sensor-data.service';

@Controller('sensor-data')
export class SensorDataController {
  constructor(private readonly sensorDataService: SensorDataService) {}

  @Post('search')
  async searchSensorData(@Body() body: SearchSensorDataDto) {
    return this.sensorDataService.findSensorData(body);
  }

  @Post('/download-csv')
  async downloadCsv(@Res() res: Response, @Body() body: SearchSensorDataDto) {
    const result = await this.sensorDataService.downloadCsv(body);

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
