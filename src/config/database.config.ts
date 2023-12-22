import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as process from 'process';

export class DatabaseConfig {
  static getTypeOrmModuleOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      synchronize: Boolean(process.env.POSTGRES_AUTO_SYNC_ENTITY),
      ssl: true,
    } as TypeOrmModuleOptions;
  }
}
