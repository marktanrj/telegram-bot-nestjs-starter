import { Injectable } from '@nestjs/common';
import { NewCache } from './cache.model';
import { DbService } from '../../database/db.service';

@Injectable()
export class CacheService {
  constructor(private dbService: DbService) {}

  async set<T>(key: string, value: T, ttl: number): Promise<void> {
    const expiresAt = new Date(Date.now() + ttl);
    const newCache: NewCache = {
      key,
      value: JSON.stringify(value), // stringify because array will throw error
      ttl,
      expiresAt,
      updatedAt: new Date(),
    };

    await this.dbService.db
      .insertInto('cache')
      .values(newCache)
      .onConflict((oc) => oc.column('key').doUpdateSet(newCache))
      .execute();
  }

  async get<T>(key: string): Promise<T | null> {
    const result = await this.dbService.db
      .selectFrom('cache')
      .selectAll()
      .where('key', '=', key)
      .where('expiresAt', '>', new Date())
      .executeTakeFirst();

    if (!result) return null;

    return result.value as T; // json already automatically parsed
  }

  async delete(key: string): Promise<void> {
    await this.dbService.db.deleteFrom('cache').where('key', '=', key).execute();
  }

  async cleanExpired(): Promise<void> {
    await this.dbService.db.deleteFrom('cache').where('expiresAt', '<=', new Date()).execute();
  }

  async removeCacheableCache(propertyKey: string, args: any[]): Promise<void> {
    const cacheKey = `${propertyKey}:${JSON.stringify(args)}`;
    await this.delete(cacheKey);
  }
}
