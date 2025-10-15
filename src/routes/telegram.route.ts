import { zValidator } from '@hono/zod-validator';
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
      const { telegram } = c.var;

      const update = c.req.valid('json');

      if (update.message) {
        const message = update.message;

        // Text message
        if ('text' in message) {
          await telegram.handleTextMessage(message);
        }
        // Voice message
        else if ('voice' in message || 'audio' in message) {
          await telegram.handleAudioMessage(message);
        }
      }

      return c.newResponse(null, HTTP_STATUS.OK);
    },
  )
  .onError((error, c) => {
    c.var.logger.error('Error handling request', {
      error: { name: error.name, message: error.message },
    });
    return c.newResponse(null, HTTP_STATUS.OK);
  });

export default routes;
