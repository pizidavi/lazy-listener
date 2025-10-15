import { createMiddleware } from 'hono/factory';
import { HTTP_STATUS } from '../types/enum';
import { Exception } from '../types/error';
import type { Env } from '../types/type';

export const protectTelegramRoute = () =>
  createMiddleware<Env>(async (c, next) => {
    const { logger } = c.var;

    // Verify the request comes from Telegram
    const secretHeader = c.req.header('X-Telegram-Bot-Api-Secret-Token');
    if (!secretHeader || secretHeader !== c.env.TELEGRAM_WEBHOOK_SECRET) {
      logger.warn('Unauthorized webhook request', { secretHeader });
      throw new Exception(HTTP_STATUS.UNAUTHORIZED);
    }

    return next();
  });
