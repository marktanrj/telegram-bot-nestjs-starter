import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BotService } from './bot/bot.service';
import { APP_ENV } from './configuration/configuration.module';
import { getLogger } from './common/logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const env = configService.getOrThrow<APP_ENV>('NODE_ENV');
  const botService = app.get(BotService);

  app.useLogger(getLogger({ botService }));
  app.enableShutdownHooks();

  if (env === APP_ENV.DEV) {
    botService.startBotWithPolling();
  } else if (env === APP_ENV.PROD || env === APP_ENV.STAGING) {
    botService.setWebhook();
  }

  await app.listen(4000);
}
bootstrap();
