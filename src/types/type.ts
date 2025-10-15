import type { RequestIdVariables } from 'hono/request-id';
import type z from 'zod';
import type { LoggerEnv } from '../middlewares/logger';
import type { envSchema } from './schema';

export type Bindings = Cloudflare.Env & z.infer<typeof envSchema>;

export type Env = {
  Bindings: Bindings;
  Variables: RequestIdVariables;
} & LoggerEnv;
