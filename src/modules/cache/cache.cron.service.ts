import { Injectable } from '@nestjs/common';
import { CacheService } from './cache.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class CacheCronService {
  constructor(private cacheService: CacheService) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async cleanExpired() {
    await this.cacheService.cleanExpired();
  }
}
