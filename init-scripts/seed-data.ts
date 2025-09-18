import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

interface InitDataItem {
  table: string;
  initData: any[];
}

async function bootstrap() {
  console.log('🚀 Starting data initialization...');

  try {
    // Create NestJS application
    const app = await NestFactory.create(AppModule);

    // Get the DataSource from the app
    const dataSource = app.get(DataSource);

    // Load init data from JSON file
    const initDataPath = path.join(
      process.cwd(),
      'init-scripts',
      'init-data.json',
    );

    if (!fs.existsSync(initDataPath)) {
      console.error(`❌ Init data file not found at: ${initDataPath}`);
      process.exit(1);
    }

    const initDataContent = fs.readFileSync(initDataPath, 'utf8');
    const initData: InitDataItem[] = JSON.parse(initDataContent);

    // Process each table's data
    for (const tableData of initData) {
      await seedTable(dataSource, tableData);
    }

    console.log('✅ Data initialization completed successfully!');
    await app.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during data initialization:', error);
    process.exit(1);
  }
}

async function seedTable(dataSource: DataSource, tableData: InitDataItem) {
  const { table, initData } = tableData;

  if (table === 'devices') {
    await seedDevices(dataSource, initData);
  } else {
    console.warn(`⚠️ Unknown table: ${table}`);
  }
}

async function seedDevices(dataSource: DataSource, devicesData: any[]) {
  console.log('📦 Seeding devices table...');

  for (const deviceData of devicesData) {
    // Check if device already exists
    const existingDevice = await dataSource.query(
      'SELECT * FROM devices WHERE name = $1 AND type = $2',
      [deviceData.name, deviceData.type],
    );

    if (existingDevice.length === 0) {
      // Insert new device
      await dataSource.query(
        'INSERT INTO devices (type, name) VALUES ($1, $2)',
        [deviceData.type, deviceData.name],
      );
      console.log(`✅ Created device: ${deviceData.name} (${deviceData.type})`);
    } else {
      console.log(
        `ℹ️ Device already exists: ${deviceData.name} (${deviceData.type})`,
      );
    }
  }

  console.log('✅ Devices seeding completed');
}

bootstrap();
