import { createMiddleware } from 'hono/factory';
import { env } from '../configs/env';
import { Logger } from '../libs/logger';
import type { Config } from '../libs/logger/types/types';

export type LoggerEnv = {
  Variables: {
    logger: Logger;
  };
};

export const logger = (config: Config) =>
  createMiddleware<LoggerEnv>(async (c, next) => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, @typescript-eslint/strict-boolean-expressions
    if (c.var.logger) {
      // root logger
      c.set('logger', c.var.logger.child(config));
      return next();
    }

    const requestId = c.get('requestId') || crypto.randomUUID();
    const logger = new Logger(config, { requestId });
    c.set('logger', logger);

    const jsonBody =
      env.ENV !== 'production' ? await c.req.json().catch(() => undefined) : undefined;
    logger.log({
      message: 'Incoming request',
      request: {
        method: c.req.method,
        path: c.req.path,
        jsonBody,
      },
    });

    const start = Date.now();
    await next();
    const duration = Date.now() - start;

    logger.log({
      message: 'Outgoing response',
      response: {
        status: c.res.status,
        ok: c.error ? false : c.res.ok,
        time: duration,
        error: c.error,
      },
    });
  });
