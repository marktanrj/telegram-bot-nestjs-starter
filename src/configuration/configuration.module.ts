import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

const ENV = process.env.NODE_ENV;

process.env.TZ = 'GMT';

export enum APP_ENV {
  TEST = 'test',
  DEV = 'development',
  STAGING = 'staging',
  PROD = 'production',
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: (() => {
        if (ENV === 'development' || ENV === 'test') {
          return '.env';
        } else if (ENV === 'staging') {
          return '.env.staging';
        } else if (ENV === 'production') {
          return '.env.production';
        }
      })(),
      load: [
        () => ({
          // add configuration here
        }),
      ],
    }),
  ],
  exports: [ConfigModule],
})
export class ConfigurationModule {}
