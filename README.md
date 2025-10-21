# Lazy Listener 🤖

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

A Telegram bot that transcribes voice messages into text. Works in private chats and groups.\
Built with [HonoJS](https://hono.dev) and deployed on [Cloudflare Workers](https://workers.cloudflare.com).

## How it works

- The bot downloads the audio file from Telegram.
- It transcribes audio using OpenAI's `Whisper Large V3 Turbo` model. 🎧
- The raw transcription is then cleaned and lightly refactored by Google's `Gemma 3 12b IT` model. ✨

## Costs

Processing a voice message costs approximately **$0.00082 per minute** of audio.

**Breakdown:**

_Assumes average speech rate of 130 words/min (~277 LLM tokens)_

- **Whisper Large V3 Turbo**: 46.63 neurons per audio minute
- **Gemma 3 12b IT**: ~27.88 neurons per minute
  - Input: ~442 tokens (277 for speech + 165 system prompt) → 13.87 neurons
  - Output: ~277 tokens → 14.01 neurons

**Total**: ~74.51 neurons/min ≈ **$0.00082/min** (at 1000 neurons = $0.011)

The free Cloudflare Worker AI plan offers 10,000 neurons per day, equivalent to over 2 hours of audio messages.

## Development

### Requirements

- A Cloudflare Workers account
- A Telegram bot token (create one with @BotFather)
- [Mise](https://github.com/jdx/mise) (_optional_) for managing tool versions

###

1. Install project tools (if you're using Mise):

   ```bash
   mise install
   ```

2. Install dependencies:

   ```bash
   bun install
   ```

3. Create a `.env` file with:
   - `ENV` (_optional_): `development|preview|production` (defaults to `production`)
   - `TELEGRAM_BOT_TOKEN`: your Telegram bot token
   - `TELEGRAM_WEBHOOK_SECRET`: secret used to validate incoming webhook requests (see Telegram's [setWebhook docs](https://core.telegram.org/bots/api#setwebhook))

4. Set Telegram bot webhook:

   ```bash
   curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook" \
     -H "Content-Type: application/json" \
     -d "{\"url\":\"https://your-domain.example.com/webhook\",\"secret_token\":\"${TELEGRAM_WEBHOOK_SECRET}\",\"allowed_updates\":[\"message\",\"callback_query\"]}"
   ```

5. Start the dev server:

   ```bash
   bun dev
   ```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
