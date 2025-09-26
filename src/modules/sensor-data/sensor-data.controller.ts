import { Body, Controller, Post } from '@nestjs/common';
import { SearchSensorDataDto } from './dto/search-sensor-data.dto';
import { SensorDataService } from './sensor-data.service';

@Controller('sensor-data')
export class SensorDataController {
  constructor(private readonly sensorDataService: SensorDataService) {}

  @Post('search')
  async searchSensorData(@Body() body: SearchSensorDataDto) {
    return this.sensorDataService.findSensorData(body);
  }
}
