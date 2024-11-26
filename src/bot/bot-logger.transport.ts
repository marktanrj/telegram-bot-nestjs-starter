import Transport from 'winston-transport';
import { BotService } from './bot.service';

interface BotLoggerOptions {
  botService: BotService;
  debounceInterval?: number;
  allowedLevels?: string[];
}

/**
 * Winston transport for logging to a Telegram chat
 * Uses debounce to prevent spamming the chat since Telegram has a rate limit of 20 messages per minute
 */
export class BotLoggerTransport extends Transport {
  private botService: BotService;
  private logQueue: string[] = [];
  private timer: NodeJS.Timeout | null = null;
  private readonly debounceInterval: number;
  private readonly allowedLevels: Set<string>;

  constructor(opts: BotLoggerOptions) {
    super(opts as any);
    this.botService = opts.botService;
    this.debounceInterval = opts.debounceInterval || 3000;
    this.allowedLevels = new Set(
      opts.allowedLevels || ['error', 'warn', 'info', 'debug', 'verbose'],
    );
    this.startDebounceTimer();
  }

  private startDebounceTimer() {
    this.timer = setInterval(() => this.sendQueuedLogs(), this.debounceInterval);
  }

  private stopDebounceTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private async sendQueuedLogs() {
    if (this.logQueue.length === 0) return;

    const message = this.logQueue.join('\n\n');
    this.logQueue = []; // Clear the queue

    try {
      await this.botService.sendMessageToLogs(message);
    } catch (error) {
      console.error('Failed to send logs to Telegram:', error);
    }
  }

  log(info: any, callback: () => void) {
    if (!this.allowedLevels.has(info.level)) {
      callback();
      return;
    }

    setImmediate(() => {
      this.emit('logged', info);
    });

    const { level, message, timestamp } = info;
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    this.logQueue.push(logMessage);

    callback();
  }

  close() {
    this.stopDebounceTimer();
    if (this.logQueue.length > 0) {
      this.sendQueuedLogs().catch(console.error);
    }
  }
}
