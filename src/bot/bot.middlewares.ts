import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isAfter } from 'date-fns';
import { Bot, matchFilter, NextFunction } from 'grammy';
import { Context } from './bot.types';
import { APP_ENV } from '../configuration/configuration.module';
import { UserRepository } from '../modules/user/user.repository';
import _ from 'lodash';

@Injectable()
export class BotMiddlewares {
  private readonly logger = new Logger(BotMiddlewares.name);

  deployedDate = new Date();

  isWhitelistEnabled = true;

  currentEnv;

  constructor(
    private configService: ConfigService,
    private userRepository: UserRepository,
  ) {
    this.currentEnv = this.configService.get<APP_ENV>('NODE_ENV');
  }

  async registerMiddlewares(bot: Bot) {
    bot.use(this.onlyAllowDMs.bind(this));
    bot.use(this.removeOldRequestsAfterDeploy.bind(this));
    bot.filter(
      matchFilter(['::bot_command', 'msg:text', 'callback_query:data']),
      this.userMiddleware.bind(this),
    );
  }

  async removeOldRequestsAfterDeploy(ctx: Context, next: NextFunction) {
    if (ctx.message) {
      const messageDate = new Date(ctx.message.date * 1000);
      const isAfterDeployed = isAfter(new Date(messageDate), this.deployedDate);
      if (!isAfterDeployed) {
        return;
      }
    }
    await next();
  }

  async userMiddleware(ctx: Context, next: NextFunction) {
    const user = await this.userRepository.getOrCreateUserWithCtx(ctx);

    _.set(ctx, 'data.user', user);

    await next();
  }

  async onlyAllowDMs(ctx: Context, next: NextFunction) {
    const notDm = ['channel', 'supergroup', 'group'].includes(ctx.chat?.type);

    if (notDm) {
      return;
    }
    await next();
  }
}
