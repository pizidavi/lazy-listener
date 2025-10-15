import type { z } from 'zod';
import type {
  telegramMessageAudioUpdateSchema,
  telegramMessageTextUpdateSchema,
  telegramMessageUpdateSchema,
  telegramMessageVoiceUpdateSchema,
  telegramUpdateSchema,
} from './schema';

export type TelegramMessageTextUpdate = z.infer<typeof telegramMessageTextUpdateSchema>;

export type TelegramMessageVoiceUpdate = z.infer<typeof telegramMessageVoiceUpdateSchema>;

export type TelegramMessageAudioUpdate = z.infer<typeof telegramMessageAudioUpdateSchema>;

export type TelegramMessageUpdate = z.infer<typeof telegramMessageUpdateSchema>;

export type TelegramUpdateRequest = z.infer<typeof telegramUpdateSchema>;
