import type { TelegramChatMember, TelegramFile, TelegramResponse } from './types';

const TELEGRAM_API = 'https://api.telegram.org';
const MAX_MESSAGE_LENGTH = 2048;

export class TelegramClient {
  private readonly token: string;

  constructor(token: string) {
    this.token = token;
  }

  async getFileUrl(fileId: string): Promise<string> {
    const response = await fetch(`${TELEGRAM_API}/bot${this.token}/getFile?file_id=${fileId}`);

    if (!response.ok) {
      throw new Error(`Failed to get file info: ${response.statusText}`);
    }

    const data: TelegramResponse<TelegramFile> = await response.json();

    if (!data.ok || !data.result.file_path) {
      throw new Error('File path not found in response');
    }

    return `${TELEGRAM_API}/file/bot${this.token}/${data.result.file_path}`;
  }

  async downloadFile(url: string): Promise<Response> {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }

    return response;
  }

  async sendMessage(
    chatId: number,
    text: string,
    options?: {
      reply_to_message_id?: number;
      disable_notification?: boolean;
      link_preview_options?: {
        is_disabled: boolean;
      };
      parse_mode?: 'Markdown' | 'HTML';
    },
  ): Promise<void> {
    // Split text into chunks
    const chunks: string[] = [];
    let remainingText = text;

    while (remainingText.length > 0) {
      if (remainingText.length <= MAX_MESSAGE_LENGTH) {
        chunks.push(remainingText);
        break;
      }

      // Find the best split point (try to split at word boundary)
      let splitIndex = MAX_MESSAGE_LENGTH;
      const lastSpace = remainingText.lastIndexOf(' ', MAX_MESSAGE_LENGTH);
      const lastNewline = remainingText.lastIndexOf('\n', MAX_MESSAGE_LENGTH);

      if (lastNewline > 0) {
        splitIndex = lastNewline;
      } else if (lastSpace > 0) {
        splitIndex = lastSpace;
      }

      chunks.push(remainingText.slice(0, splitIndex).trim());
      remainingText = remainingText.slice(splitIndex).trim();
    }

    // Send each chunk
    for (let i = 0; i < chunks.length; i++) {
      const isFirstMessage = i === 0;
      const response = await fetch(`${TELEGRAM_API}/bot${this.token}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: chunks[i],
          parse_mode: 'Markdown',
          ...(isFirstMessage
            ? options
            : {
                ...options,
                reply_to_message_id: undefined, // Only reply to the original message with the first chunk
              }),
        }),
      });

      if (!response.ok) {
        const cause = await response.text().catch(() => null);
        throw new Error(
          `Failed to send message chunk ${i + 1}/${chunks.length}: ${response.statusText}`,
          { cause },
        );
      }
    }
  }

  async sendChatAction(chatId: number, action: string): Promise<void> {
    const response = await fetch(`${TELEGRAM_API}/bot${this.token}/sendChatAction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        action,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to send chat action: ${response.statusText}`);
    }
  }

  async setMessageReaction(chatId: number, messageId: number, emoji: string): Promise<void> {
    const response = await fetch(`${TELEGRAM_API}/bot${this.token}/setMessageReaction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: messageId,
        reaction: [{ type: 'emoji', emoji }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to set message reaction: ${response.statusText}`);
    }
  }

  async getChatAdministrators(chatId: number): Promise<number[]> {
    const response = await fetch(`${TELEGRAM_API}/bot${this.token}/getChatAdministrators`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to get chat administrators: ${response.statusText}`);
    }

    const data: TelegramResponse<TelegramChatMember[]> = await response.json();

    if (!data.ok) {
      throw new Error(`Failed to get chat administrators: ${data.description}`);
    }

    return data.result.map(member => member.user.id);
  }
}
