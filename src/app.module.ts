import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceModule } from './modules/device/device.module';
import { SensorModule } from './modules/sensor/sensor.module';
import { SensorDataModule } from './modules/sensor-data/sensor-data.module';
import { ActuatorModule } from './modules/actuator/actuator.module';
import { ActionModule } from './modules/action/action.module';
import { ActionHistoryModule } from './modules/action-history/action-history.module';
import pgConfig from './config/db.conf';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [pgConfig],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('postgres.DB_HOST'),
        port: parseInt(configService.get<string>('postgres.DB_PORT') || '5432'),
        username: configService.get<string>('postgres.DB_USERNAME'),
        password: configService.get<string>('postgres.DB_PASSWORD'),
        database: configService.get<string>('postgres.DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true, // Set to false in production
        logging: true,
      }),
      inject: [ConfigService],
    }),
    DeviceModule,
    SensorModule,
    SensorDataModule,
    ActuatorModule,
    ActionModule,
    ActionHistoryModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
