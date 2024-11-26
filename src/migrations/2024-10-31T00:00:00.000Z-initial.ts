import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('user')
    .addColumn('id', 'varchar', (col) => col.primaryKey())
    .addColumn('username', 'varchar', (col) => col.notNull())
    .addColumn('firstName', 'varchar')
    .addColumn('lastName', 'varchar')
    .addColumn('languageCode', 'varchar')
    .addColumn('role', 'varchar', (col) => col.notNull().defaultTo('GENERAL'))
    .addColumn('status', 'varchar', (col) => col.notNull().defaultTo('ACTIVE'))
    .addColumn('hasPrivateChat', 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn('lastActiveDate', 'timestamp', (col) => col.notNull())
    .addColumn('updatedAt', 'timestamp', (col) => {
      return col.defaultTo(sql`now()`).notNull();
    })
    .addColumn('createdAt', 'timestamp', (col) => {
      return col.defaultTo(sql`now()`).notNull();
    })
    .execute();

  await db.schema.createIndex('idx_user_username').on('user').column('username').execute();

  await db.schema.createIndex('idx_user_role').on('user').column('role').execute();

  await db.schema.createIndex('idx_user_status').on('user').column('status').execute();

  await db.schema
    .createTable('cache')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`uuid_generate_v4()`))
    .addColumn('key', 'varchar', (col) => col.notNull().unique())
    .addColumn('value', 'json', (col) => col.notNull())
    .addColumn('ttl', 'integer')
    .addColumn('updatedAt', 'timestamp', (col) => {
      return col.defaultTo(sql`now()`).notNull();
    })
    .addColumn('createdAt', 'timestamp', (col) => {
      return col.defaultTo(sql`now()`).notNull();
    })
    .addColumn('expiresAt', 'timestamp', (col) => col.notNull())
    .execute();

  await db.schema
    .createIndex('idx_cache_expiresAt_index')
    .on('cache')
    .column('expiresAt')
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('cache').execute();
  await db.schema.dropTable('user').execute();
}
