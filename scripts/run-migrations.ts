import { promises as fs } from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { FileMigrationProvider, Kysely, Migrator, PostgresDialect } from 'kysely';
import { Pool } from 'pg';

async function migrateToLatest() {
  if (process.env.NODE_ENV === 'development') {
    dotenv.config({ path: '.env' });
  } else if (process.env.NODE_ENV === 'staging') {
    dotenv.config({ path: '.env.staging' });
  } else if (process.env.NODE_ENV === 'production') {
    dotenv.config({ path: '.env.production' });
  }

  const migrationFolderPath = path.join(__dirname, '..', 'src', 'migrations');

  console.log(`Running migrations on ${process.env.NODE_ENV}..`);
  const database = new Kysely({
    dialect: new PostgresDialect({
      pool: new Pool({
        host: process.env.DATABASE_HOST,
        port: process.env.DATABASE_PORT,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
      }),
    }),
  });

  const migrator = new Migrator({
    db: database,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: migrationFolderPath,
    }),
  });

  const { error, results } = await migrator.migrateToLatest();

  results?.forEach((migrationResult) => {
    if (migrationResult.status === 'Success') {
      console.log(`migration "${migrationResult.migrationName}" was executed successfully`);
    } else if (migrationResult.status === 'Error') {
      console.error(`failed to execute migration "${migrationResult.migrationName}"`);
    }
  });

  if (error) {
    console.error('Failed to migrate');
    console.error(error);
    process.exit(1);
  }

  await database.destroy();
}

migrateToLatest();
