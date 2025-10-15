import { Hono } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { BASE_API_PATH } from './configs/constant';
import apiRoute from './routes/__root';
import { HTTP_STATUS } from './types/enum';

const app = new Hono();

// Routes
app.route(BASE_API_PATH, apiRoute);

// Handle
app.notFound(c => {
  return c.text('Path does not exists', HTTP_STATUS.NOT_FOUND);
});

app.onError((error, c) => {
  const status = 'status' in error ? error.status : undefined;

  const statusCode =
    typeof status === 'number'
      ? (status as ContentfulStatusCode)
      : HTTP_STATUS.INTERNAL_SERVER_ERROR;

  return c.text('Unhandle error', statusCode);
});

export default app;
