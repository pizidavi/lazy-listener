import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import type { Context } from 'hono';
import { transcriptionStats } from '../db/schema';
import { AiClient } from '../libs/ai';
import { TelegramClient } from '../libs/telegram';
import { t } from '../locale';
import { HTTP_STATUS } from '../types/enum';
import { Exception } from '../types/error';
import type {
  TelegramMessageAudioUpdate,
  TelegramMessageTextUpdate,
  TelegramMessageVoiceUpdate,
} from '../types/request';
import type { Env } from '../types/type';

export const telegramService = (context: Context<Env>) => {
  const { logger } = context.var;

  const db = drizzle(context.env.DB);
  const aiClient = new AiClient(context.env.AI);
  const telegramClient = new TelegramClient(context.env.TELEGRAM_BOT_TOKEN);

  const handleTextMessage = async (message: TelegramMessageTextUpdate) => {
    const chatId = message.chat.id;
    const chatType = message.chat.type;
    const fromId = message.from?.id;
    const language = message.from?.language_code ?? 'en';
    const text = message.text.trim();

    // In group chats, only respond to commands from admin users
    if (chatType !== 'private') {
      if (fromId === undefined)
        throw new Exception(HTTP_STATUS.FORBIDDEN, 'Message from unknown user in group');

      const adminUserIds = await telegramClient.getChatAdministrators(chatId);
      if (!adminUserIds.includes(fromId))
        throw new Exception(HTTP_STATUS.FORBIDDEN, 'Message from non-admin user in group');
    }

    // Start command
    if (text.startsWith('/start')) {
      await telegramClient.sendMessage(chatId, t(language, 'messages:welcome'));
      logger.info('Handled /start command');
    }
    // Help command
    else if (text.startsWith('/help')) {
      await telegramClient.sendMessage(chatId, t(language, 'messages:help'), {
        link_preview_options: { is_disabled: true },
      });
      logger.info('Handled /help command');
    }
    // Stats command
    else if (text.startsWith('/stats')) {
      const today = new Date().toISOString().split('T')[0];

      const totalResult = await db
        .select({ total: sql<number>`sum(${transcriptionStats.transcriptionCounter})` })
        .from(transcriptionStats);

      const todayResult = await db
        .select({ count: transcriptionStats.transcriptionCounter })
        .from(transcriptionStats)
        .where(sql`${transcriptionStats.date} = ${today}`);

      const totalTranscriptions = totalResult[0]?.total ?? 0;
      const todayTranscriptions = todayResult[0]?.count ?? 0;

      const message = t(language, 'messages:stats', { totalTranscriptions, todayTranscriptions });
      await telegramClient.sendMessage(chatId, message);
      logger.info('Handled /stats command');
    }
  };

  const handleAudioMessage = async (
    message: TelegramMessageVoiceUpdate | TelegramMessageAudioUpdate,
  ) => {
    const chatId = message.chat.id;
    const chatType = message.chat.type;
    const messageId = message.message_id;
    const language = message.from?.language_code ?? 'en';
    const fileId = 'voice' in message ? message.voice.file_id : message.audio.file_id;
    const fileDuration = 'voice' in message ? message.voice.duration : message.audio.duration;

    // Rate limiting based on user ID or chat ID
    const { success } = await context.env.AUDIO_LIMIT.limit({
      key: (message.from?.id ?? chatId).toString(),
    });
    if (!success) {
      logger.info('Rate limited', { limiter: 'audio' });
      await telegramClient.setMessageReaction(chatId, messageId, '👾').catch(() => {
        logger.error('Failed to send message reaction');
      });
      throw new Exception(HTTP_STATUS.TOO_MANY_REQUESTS, 'Rate limit exceeded');
    }

    // Reject if audio message is sent in non-private chat
    if ('audio' in message && chatType !== 'private')
      throw new Exception(HTTP_STATUS.CONFLICT, 'Audio messages are only allowed in private chats');

    // Reject if audio is too long
    if (fileDuration > context.env.MAX_AUDIO_DURATION_SECONDS) {
      await telegramClient.setMessageReaction(chatId, messageId, '🤯').catch(() => {
        logger.error('Failed to send message reaction');
      });
      throw new Exception(HTTP_STATUS.PAYLOAD_TOO_LARGE, 'Audio duration exceeds maximum limit');
    }

    logger.debug(
      `Received ${'voice' in message ? 'voice' : 'audio'} message. Starting processing...`,
    );

    // Notify user that processing has started
    await telegramClient.sendChatAction(chatId, 'typing').catch(() => {
      logger.error('Failed to send chat action');
    });

    // Get file URL and download
    const fileUrl = await telegramClient.getFileUrl(fileId);
    const fileResponse = await telegramClient.downloadFile(fileUrl);

    const transcription = await Promise.resolve()
      .then(async () => {
        // Transcribe audio
        const rawTranscription = await aiClient.transcribeAudio(fileResponse);
        if (rawTranscription.length < 5)
          throw new Exception(HTTP_STATUS.FAILED_DEPENDENCY, 'Failed to transcribe audio');
        logger.debug('Transcription done', { textLength: rawTranscription.length });

        // Refine transcription
        const refinedText = await (async () => {
          if (rawTranscription.length <= 2000) {
            return await aiClient.refineText(rawTranscription);
          } else {
            logger.info('Transcription too long, summarizing instead of refining');

            // For long transcriptions, summarize instead of refining
            const text = await aiClient.summarizeText(rawTranscription);
            return `${text}\n\n_${t(language, 'messages:message_too_long')}_`;
          }
        })();
        if (refinedText.length < 5 || refinedText === 'No content')
          throw new Exception(HTTP_STATUS.FAILED_DEPENDENCY, 'Failed to refine transcription');

        logger.debug('Refinement done', { textLength: refinedText.length });
        return refinedText;
      })
      .catch(async e => {
        await telegramClient.setMessageReaction(chatId, messageId, '🤨').catch(() => {
          logger.error('Failed to send message reaction');
        });
        throw e;
      });

    // Send the result
    await telegramClient.sendMessage(chatId, transcription, {
      reply_to_message_id: messageId,
      disable_notification: true,
    });

    // Increment transcription counter
    const today = new Date().toISOString().split('T')[0];
    await db
      .insert(transcriptionStats)
      .values({ date: today, transcriptionCounter: 1 })
      .onConflictDoUpdate({
        target: transcriptionStats.date,
        set: { transcriptionCounter: sql`${transcriptionStats.transcriptionCounter} + 1` },
      })
      .catch((e: unknown) => {
        logger.error('Failed to increment stats', { error: e });
      });

    logger.info('Successfully processed audio message');
  };

  return {
    handleTextMessage,
    handleAudioMessage,
  };
};
