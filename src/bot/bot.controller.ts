import { Controller, Logger, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';
import { BotService } from './bot.service';
import { ConfigService } from '@nestjs/config';
import { BotErrorService } from './bot.errors';

@Controller('bot')
export class BotController {
  private readonly logger = new Logger(BotController.name);
  private readonly secretToken: string;

  constructor(
    private botService: BotService,
    private botErrorService: BotErrorService,
    private configService: ConfigService,
  ) {
    this.secretToken = this.configService.getOrThrow<string>('TELEGRAM_BOT_SECRET_TOKEN');
  }

  @Post('webhook')
  async webhook(@Req() req: Request, @Res() res: Response) {
    const secretToken = req.header('X-Telegram-Bot-Api-Secret-Token');

    if (secretToken !== this.secretToken) {
      this.logger.warn('Unauthorized webhook request');
      throw new UnauthorizedException('Invalid secret token');
    }

    try {
      await this.botService.handleRequest(req.body);
      res.sendStatus(200);
    } catch (error) {
      try {
        await this.botErrorService.handleError.bind(this.botErrorService);
      } catch (sendError) {
        this.logger.error('Error sending error message:', sendError);
      }

      res.sendStatus(200);
    }
  }
}
