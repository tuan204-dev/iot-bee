import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActionHistoryEntity } from './action-history.entity';
import { ActionHistoryController } from './action-history.controller';
import { ActionHistoryService } from './action-history.service';

@Module({
  imports: [TypeOrmModule.forFeature([ActionHistoryEntity])],
  controllers: [ActionHistoryController],
  providers: [ActionHistoryService],
  exports: [ActionHistoryService],
})
export class ActionHistoryModule {}
