import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { AppService } from './app.service';
import { ConfigurationModule } from './configuration/configuration.module';
import { BotController } from './bot/bot.controller';
import { BotMiddlewares } from './bot/bot.middlewares';
import { BotService } from './bot/bot.service';
import { BotUtils } from './bot/bot.utils';
import { BotError } from 'grammy';
import { CacheService } from './modules/cache/cache.service';
import { UserRepository } from './modules/user/user.repository';
import { DbService } from './database/db.service';
import { CacheCronService } from './modules/cache/cache.cron.service';
import { BotErrorService } from './bot/bot.errors';

@Module({
  imports: [ConfigurationModule, ScheduleModule.forRoot()],
  controllers: [AppController, BotController],
  providers: [
    AppService,
    DbService,
    BotService,
    BotUtils,
    BotMiddlewares,
    BotError,
    BotErrorService,
    CacheService,
    CacheCronService,
    UserRepository,
  ],
})
export class AppModule {}
