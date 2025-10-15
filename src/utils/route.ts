import { Hono } from 'hono';
import { logger } from '../middlewares/logger';
import type { Env } from '../types/type';

export const createApp = () =>
  new Hono<Env>({
    strict: false,
  });

export const createRoute = (name: string) => createApp().use(logger({ name }));
