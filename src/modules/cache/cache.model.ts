import { ColumnType, Generated, Insertable, Selectable, Updateable } from 'kysely';

export interface CacheTable {
  id: Generated<string>;

  // Cache key
  key: string;

  // Cache value (stored as JSON)
  value: ColumnType<JsonValue, string | JsonValue, string | JsonValue>;

  // Metadata
  ttl: number | null; // Time to live in seconds

  createdAt: ColumnType<Date, string | undefined, never>;
  updatedAt: ColumnType<Date, Date | null, Date | null>;

  expiresAt: Date | null;
}

// Define a type for JSON values
type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export type Cache = Selectable<CacheTable>;
export type NewCache = Insertable<CacheTable>;
export type UpdateCache = Updateable<CacheTable>;
