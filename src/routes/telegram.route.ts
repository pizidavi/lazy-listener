import { zValidator } from '@hono/zod-validator';
import { waitUntil } from 'cloudflare:workers';
import { protectTelegramRoute } from '../middlewares/protect-telegram-route';
import { registerService } from '../middlewares/register-services';
import { telegramService } from '../services/telegram.service';
import { HTTP_STATUS } from '../types/enum';
import { telegramUpdateSchema } from '../types/schema';
import { createRoute } from '../utils/route';

const routes = createRoute('telegram-routes')
  .use(registerService('telegram', telegramService))
  .post(
    '/webhook',
    protectTelegramRoute(),
    zValidator('json', telegramUpdateSchema),
    async (c): Promise<Response> => {
      const { logger, telegram } = c.var;

      const update = c.req.valid('json');

      const chatId = update.message?.chat.id;
      const fromId = update.message?.from?.id;
      if (chatId !== undefined)
        logger.assign({ chatId, fromId: fromId !== chatId ? fromId : undefined });

      if (update.message) {
        const message = update.message;

        // Text message
        if ('text' in message) {
          waitUntil(telegram.handleTextMessage(message));
        }
        // Voice message
        else if ('voice' in message || 'audio' in message) {
          waitUntil(telegram.handleAudioMessage(message));
        }
        // Other
        else {
          logger.info('Unsupported message type received', { message });
        }
      } else {
        logger.info('Unsupported update type received', { update });
      }

      return c.newResponse(null, HTTP_STATUS.OK);
    },
  )
  .onError((error, c) => {
    c.var.logger.error('Error handling request', {
      error: { name: error.name, message: error.message, stack: error.stack },
    });
    return c.newResponse(null, HTTP_STATUS.OK);
  });

export default routes;
