import { Body, Controller, Post } from '@nestjs/common';
import { type ISearchSensorDataParams } from './sensor-data.interface';
import { SensorDataService } from './sensor-data.service';

@Controller('sensor-data')
export class SensorDataController {
  constructor(private readonly sensorDataService: SensorDataService) {}

  @Post()
  async findSensorData(@Body() body: ISearchSensorDataParams) {
    return this.sensorDataService.findSensorData(body);
  }
}
