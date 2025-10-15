//@ts-expect-error missing types
import { Buffer } from 'node:buffer';
import { buildTextPrompt } from '../../utils/prompt';

export class AiClient {
  private readonly ai: Ai;

  constructor(ai: Ai) {
    this.ai = ai;
  }

  async transcribeAudio(audioResponse: Response): Promise<string> {
    const mp3Buffer = await audioResponse.arrayBuffer();
    const base64 = Buffer.from(mp3Buffer, 'binary').toString('base64');

    const result = await this.ai.run('@cf/openai/whisper-large-v3-turbo', {
      audio: base64,
    });

    return result.text.trim();
  }

  async refineText(rawText: string): Promise<string> {
    const messages = [
      { role: 'system', content: buildTextPrompt() },
      { role: 'user', content: rawText },
    ];

    const response = await this.ai.run('@cf/google/gemma-3-12b-it', {
      messages,
    });

    return response.response.trim();
  }
}
