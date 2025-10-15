import { cors } from 'hono/cors';
import { requestId } from 'hono/request-id';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { env } from '../configs/env';
import { logger } from '../middlewares/logger';
import { HTTP_STATUS } from '../types/enum';
import { createApp } from '../utils/route';
import telegramRoutes from './telegram.route';

const api = createApp();

// Middlewares
api.use(cors());
api.use(requestId());
api.use(logger({ name: 'global', pretty: env.ENV === 'development' }));

// Routes
export const routes = api.route('/', telegramRoutes).onError((error, c) => {
  const status = 'status' in error ? error.status : undefined;

  const statusCode =
    typeof status === 'number'
      ? (status as ContentfulStatusCode)
      : HTTP_STATUS.INTERNAL_SERVER_ERROR;

  return c.json(
    {
      message: error.message ? error.message : undefined,
      stack: env.ENV === 'development' ? error.stack : undefined,
    },
    statusCode,
  );
});

export default api;
