import { Logger } from '@nestjs/common';

export function RetryOnError(maxRetries: number = 3, delay: number = 1000) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const logger = new Logger(`${target.constructor.name}:${propertyKey}`);

    descriptor.value = async function (...args: any[]) {
      let retries = 0;
      while (retries < maxRetries) {
        try {
          return await originalMethod.apply(this, args);
        } catch (error) {
          retries++;
          logger.warn(`Operation failed. Retry attempt ${retries} of ${maxRetries}`);
          if (retries === maxRetries) {
            logger.error(`Failed after ${maxRetries} attempts`, error.stack);
            throw error;
          }
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    };

    return descriptor;
  };
}
