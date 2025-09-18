import { registerAs } from '@nestjs/config';

export const PG_CONFIG_NAME = 'postgres';
export default registerAs(PG_CONFIG_NAME, () => ({
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_USERNAME: process.env.DB_USERNAME,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,
}));
