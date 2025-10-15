import { z } from 'zod';

export const envSchema = z.object({
  ENV: z.enum(['development', 'preview', 'production']).default('production'),
  TELEGRAM_BOT_TOKEN: z.string().min(1),
  TELEGRAM_WEBHOOK_SECRET: z.string().min(12),
});

export const telegramMessageBaseUpdateSchema = z.object({
  message_id: z.number(),
  chat: z.object({
    id: z.number(),
    type: z.string(),
  }),
  from: z
    .object({
      id: z.number(),
      username: z.string().optional(),
      language_code: z.string().optional(),
    })
    .optional(),
});

export const telegramMessageTextUpdateSchema = telegramMessageBaseUpdateSchema.extend({
  text: z.string(),
});

export const telegramMessageVoiceUpdateSchema = telegramMessageBaseUpdateSchema.extend({
  voice: z.object({
    file_id: z.string(),
    duration: z.number(),
  }),
});

export const telegramMessageAudioUpdateSchema = telegramMessageBaseUpdateSchema.extend({
  audio: z.object({
    file_id: z.string(),
    duration: z.number(),
  }),
});

export const telegramMessageUpdateSchema = telegramMessageTextUpdateSchema
  .or(telegramMessageVoiceUpdateSchema)
  .or(telegramMessageAudioUpdateSchema)
  .or(telegramMessageBaseUpdateSchema);

export const telegramUpdateSchema = z.object({
  update_id: z.number(),
  message: telegramMessageUpdateSchema.optional().catch(undefined),
});
