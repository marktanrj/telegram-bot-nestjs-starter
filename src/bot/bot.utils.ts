import { Injectable, Logger } from '@nestjs/common';
import { Context, ScreenRoute } from './bot.types';
import { sql } from 'kysely';
import { DbService } from '../database/db.service';

@Injectable()
export class BotUtils {
  private readonly logger = new Logger(BotUtils.name);

  constructor(private dbService: DbService) {}

  async resetStateWithCtx(ctx: Context) {
    ctx.session = { screen: ScreenRoute.IDLE };
    await this.resetStateWithId(ctx.from.id.toString());
  }

  async resetStateWithId(id: string) {
    await sql`DELETE FROM "sessions" WHERE "key" = ${id}`.execute(this.dbService.db);
  }

  deleteOldCbMessage(ctx: Context) {
    if (ctx.callbackQuery) {
      try {
        ctx.deleteMessage();
      } catch (error) {
        this.logger.error(error);
      }
    }
  }

  removeButtonsFromOldMessage(ctx: Context) {
    if (ctx.callbackQuery) {
      try {
        ctx.editMessageReplyMarkup(undefined);
      } catch (error) {
        this.logger.error(error);
      }
    }
  }

  answerCallbackQuery(ctx: Context) {
    if (ctx.callbackQuery) {
      ctx.answerCallbackQuery().catch((error) => this.logger.error(error));
    }
  }

  validateRoute(ctx: Context, route: ScreenRoute) {
    if (ctx.session.screen !== route) {
      throw new Error(`Invalid route: ${ctx.session.screen} !== ${route}`);
    }
  }
}

export const getCommandFromText = (text: string) => {
  const textArr = text.split(' ');
  const commandRaw = textArr.shift().replace('/', '').toLowerCase();
  const command = commandRaw.split('@')[0];
  return command;
};
