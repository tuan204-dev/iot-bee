import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { SearchSensorDataDto } from './dto/search-sensor-data.dto';
import { SensorDataService } from './sensor-data.service';

@ApiTags('sensor-data')
@Controller('sensor-data')
export class SensorDataController {
  constructor(private readonly sensorDataService: SensorDataService) {}

  @Post('search')
  @ApiOperation({ summary: 'Search sensor data with filters' })
  async searchSensorData(@Body() body: SearchSensorDataDto) {
    return this.sensorDataService.findSensorData(body);
  }

  @Post('/download-csv')
  @ApiOperation({ summary: 'Download sensor data as CSV file' })
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

  @Get('recent')
  @ApiOperation({ summary: 'Get recent sensor data with specified duration' })
  async getRecentSensorData() {
    return this.sensorDataService.getRecentSensorData();
  }
}
