import { Context as GrammyContext, SessionFlavor } from 'grammy';

/**
 * Route paths
 * https://grammy.dev/plugins/router
 */
export enum ScreenRoute {
  IDLE = 'IDLE',
}

export interface BotSessionData {
  screen?: ScreenRoute;
}

export interface CustomData {
  data: {
    user: any;
    [x: string]: any;
  };
}

export type Context = GrammyContext & SessionFlavor<BotSessionData> & CustomData;
