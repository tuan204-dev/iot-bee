import { Client } from 'pg';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function cleanDatabase() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    await client.connect();
    // Drop all tables with CASCADE to handle foreign key constraints
    const tables = [
      'action_histories',
      'sensor_data',
      'actions',
      'actuators',
      'sensors',
      'devices',
    ];

    for (const table of tables) {
      try {
        await client.query(`DROP TABLE IF EXISTS "${table}" CASCADE`);
      } catch (error) {
        console.log(`ℹ️ Table ${table} does not exist or already dropped`);
      }
    }
  } catch (error) {
    console.error('❌ Error during database cleanup:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

cleanDatabase();
