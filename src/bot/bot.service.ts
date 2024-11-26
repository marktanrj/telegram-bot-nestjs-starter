import { PsqlAdapter } from '@grammyjs/storage-psql';
import { Inject, Injectable, Logger, OnModuleInit, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { Bot, session } from 'grammy';
import { Update } from 'grammy/types';
import { Client } from 'pg';
import { DbService } from '../database/db.service';
import { BotMiddlewares } from './bot.middlewares';
import { getStartMessage } from './bot.texts';
import { BotSessionData, Context, ScreenRoute } from './bot.types';
import { BotUtils } from './bot.utils';
import { BotErrorService } from './bot.errors';

export const botInitialState: BotSessionData = {
  screen: ScreenRoute.IDLE, // manually manage and lock screen for user
};

@Injectable()
export class BotService implements OnModuleInit {
  private readonly logger = new Logger(BotService.name);

  bot: Bot;
  logsChatId: string;
  botToken: string;
  private secretToken: string;

  constructor(
    private configService: ConfigService,
    private dbService: DbService,
    @Inject(forwardRef(() => BotMiddlewares))
    private botMiddlewares: BotMiddlewares,
    @Inject(forwardRef(() => BotUtils))
    private botUtils: BotUtils,
    @Inject(forwardRef(() => BotErrorService))
    private botErrorService: BotErrorService,
  ) {
    this.botToken = this.configService.getOrThrow<string>('TELEGRAM_BOT_TOKEN');
    this.bot = new Bot<Context>(this.botToken);
    this.logsChatId = this.configService.getOrThrow<string>('TELEGRAM_LOGS_CHAT');
    this.secretToken = this.configService.getOrThrow<string>('TELEGRAM_BOT_SECRET_TOKEN');
  }

  async onModuleInit() {
    await this.setupSession();
    await this.setupMiddlewares();
    await this.registerListeners();
  }

  async setupMiddlewares() {
    this.botMiddlewares.registerMiddlewares(this.bot);
  }

  async registerListeners() {
    // put all bot listeners here to prioritize routes
    // this.someBotService.registerBotListeners();

    this.bot.command('start', this.startCommand.bind(this));
    this.bot.command(['help'], this.startCommand.bind(this));
    this.bot.command(['ginfo'], this.handleGroupInfo.bind(this));

    this.bot.catch(this.botErrorService.handleError.bind(this.botErrorService));
  }

  async setupSession() {
    const config = this.dbService.getDatabaseConfig();
    const client = new Client(config);
    await client.connect();

    // session might store group chat session data
    this.bot.use(
      session({
        initial: (): BotSessionData => botInitialState,
        storage: await PsqlAdapter.create({
          tableName: 'sessions',
          client,
        }),
      }),
    );
  }

  async setWebhook() {
    try {
      this.logger.log('Setting webhook..');
      const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
      const url = this.configService.get<string>('TELEGRAM_BOT_WEBHOOK_URL');
      await axios.post(`https://api.telegram.org/bot${token}/setWebhook`, {
        url,
        secret_token: this.secretToken,
      });
      this.logger.log(`Webhook set for bot: ${url}`);
    } catch (error: any) {
      this.logger.error(error);
    }
  }

  async sendMessage(userId: string | number, message: string) {
    this.bot.api.sendMessage(userId, message).catch(() => {
      console.log('Error sending message');
    });
  }

  async sendMessageToLogs(message: string) {
    await this.sendMessage(this.logsChatId, message);
  }

  async handleRequest(body: Update) {
    if (!this.bot.isInited()) {
      await this.bot.init();
    }
    await this.bot.handleUpdate(body);
  }

  // for development
  async startBotWithPolling() {
    this.logger.log('Starting bot with polling..');
    await this.bot.start({
      drop_pending_updates: true,
      timeout: 10,
    });
  }

  async startCommand(ctx: Context) {
    this.botUtils.deleteOldCbMessage(ctx);

    const message = getStartMessage();

    await ctx
      .reply(message, {
        parse_mode: 'HTML',
        message_thread_id: ctx.message?.message_thread_id,
        link_preview_options: { is_disabled: true },
      })
      .catch((error) => this.logger.error(error));
  }

  async leaveChat(chatId: string) {
    try {
      await this.bot.api.leaveChat(chatId);
    } catch (error) {
      this.logger.error(error);
    }
  }

  private async handleGroupInfo(ctx: Context) {
    const chatId = ctx.chat.id;
    const threadId = ctx.message?.message_thread_id;

    const stack = [];

    stack.push(`<b>Chat ID:</b> ${chatId}`);
    if (threadId) {
      stack.push(`<b>Thread ID:</b> ${threadId}`);
    }
    const message = stack.join('\n');

    ctx
      .reply(message, {
        parse_mode: 'HTML',
        message_thread_id: ctx.message?.message_thread_id,
        link_preview_options: { is_disabled: true },
      })
      .catch((error) => this.logger.error(error));
  }
}
