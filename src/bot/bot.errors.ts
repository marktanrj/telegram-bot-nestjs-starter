import { Injectable, Logger } from '@nestjs/common';
import { BotError as GrammyBotError } from 'grammy';
import { Context } from './bot.types';
import { BotUtils } from './bot.utils';
import { BotError } from '../common/error';

@Injectable()
export class BotErrorService {
  private readonly logger = new Logger(BotErrorService.name);

  constructor(private botUtils: BotUtils) {}

  async handleError(error: GrammyBotError<Context>) {
    await this.botUtils.resetStateWithCtx(error.ctx);

    const errorMsg =
      error.error instanceof BotError
        ? error.error.reply
        : 'An error has occurred, please try again';

    error.ctx
      .reply(errorMsg, {
        parse_mode: 'HTML',
        message_thread_id: error.ctx.message?.message_thread_id,
      })
      .catch((error) => this.logger.error(error));

    this.logger.error(error.message, error.stack);
  }
}
