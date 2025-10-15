import type { Context } from 'hono';
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

  const aiClient = new AiClient(context.env.AI);
  const telegramClient = new TelegramClient(context.env.TELEGRAM_BOT_TOKEN);

  const handleTextMessage = async (message: TelegramMessageTextUpdate) => {
    const chatId = message.chat.id;
    const chatType = message.chat.type;
    const fromId = message.from?.id;
    const language = message.from?.language_code ?? 'en';
    const text = message.text.trim();

    // Only respond to commands from admin user in groups
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
    }
    // Help command
    else if (text.startsWith('/help')) {
      await telegramClient.sendMessage(chatId, t(language, 'messages:help'), {
        link_preview_options: { is_disabled: true },
      });
    }
  };

  const handleAudioMessage = async (
    message: TelegramMessageVoiceUpdate | TelegramMessageAudioUpdate,
  ) => {
    const chatId = message.chat.id;
    const messageId = message.message_id;
    const fileId = 'voice' in message ? message.voice.file_id : message.audio.file_id;

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

        // Refine transcription
        const refinedText = await aiClient.refineText(rawTranscription);
        if (refinedText.length < 5 || refinedText === 'No content')
          throw new Exception(HTTP_STATUS.FAILED_DEPENDENCY, 'Failed to refine transcription');

        return refinedText;
      })
      .catch(async e => {
        await telegramClient.setMessageReaction(chatId, messageId, '🤨');
        throw e;
      });

    // Send the result
    await telegramClient.sendMessage(chatId, transcription, {
      reply_to_message_id: messageId,
      disable_notification: true,
    });
  };

  return {
    handleTextMessage,
    handleAudioMessage,
  };
};
