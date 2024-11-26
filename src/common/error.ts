export interface ErrorOptions {
  reply?: string;
  log?: string;
  code?: string;
}

export class BotError extends Error {
  public readonly reply?: string;
  public readonly log?: string;
  public readonly code?: string;
  public readonly data?: any;

  constructor(options: ErrorOptions) {
    super(options.log || options.reply || 'An error occurred');
    this.reply = options.reply;
    this.log = options.log;
    this.code = options.code;
  }
}
