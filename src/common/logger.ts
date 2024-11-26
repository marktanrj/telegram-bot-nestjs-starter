import { WinstonModule } from 'nest-winston';
import winston from 'winston';
import { BotLoggerTransport } from '../bot/bot-logger.transport';
import { BotService } from '../bot/bot.service';

export const getLogger = (params: { botService: BotService }) => {
  const { botService } = params;

  return WinstonModule.createLogger({
    format: winston.format.combine(
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
      }),
      winston.format.ms(),
      winston.format.json(),
    ),
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.ms(),
          winston.format.colorize(),
          winston.format.printf(({ timestamp, level, message, ms }) => {
            return `[${timestamp}] ${level}: ${message} ${ms}`;
          }),
        ),
      }),
      new BotLoggerTransport({
        botService,
      }),
    ],
  });
};
