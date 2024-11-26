import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Kysely, ParseJSONResultsPlugin, PostgresDialect, sql } from 'kysely';
import { Pool } from 'pg';
import { Database } from '../database';

@Injectable()
export class DbService implements OnModuleInit {
  private readonly logger = new Logger(DbService.name);

  db: Kysely<Database>;

  constructor() {
    this.setUpDatabase();
  }

  async onModuleInit() {
    this.checkExtensions();
  }

  setUpDatabase() {
    const dialect = new PostgresDialect({
      pool: new Pool(this.getDatabaseConfig()),
    });

    this.db = new Kysely<Database>({
      dialect,
      plugins: [new ParseJSONResultsPlugin()],
    }).withSchema('public');
  }

  getDatabaseConfig() {
    return {
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT),
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      ssl: process.env.CA_CERT
        ? {
            rejectUnauthorized: false,
            ca: process.env.CA_CERT,
          }
        : false,
    };
  }

  async checkExtensions() {
    try {
      await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`.execute(this.db);
      await sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`.execute(this.db);
      this.logger.log('Extensions checked');
    } catch (error) {
      this.logger.error('Error ensuring extension:', error);
    }
  }
}
