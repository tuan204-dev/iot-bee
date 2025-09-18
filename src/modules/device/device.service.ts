import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeviceEntity } from './device.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DeviceService {
  constructor(
    @InjectRepository(DeviceEntity)
    public repo: Repository<DeviceEntity>,
  ) {}
}
