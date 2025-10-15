# Lazy Listener 🤖

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

A Telegram bot that transcribes voice messages into text. Works in private chats and groups.\
Built with [HonoJS](https://hono.dev) and deployed to [Cloudflare Workers](https://workers.cloudflare.com).

## How it works

- The bot downloads the audio file from Telegram.
- It transcribes audio using OpenAI's `Whisper Large V3 Turbo` model. 🎧
- The raw transcription is then lightly cleaned/refactored by Google's `Gemma 3` for readability. ✨

## Quick start

### Requirements

- A Cloudflare Workers account
- A Telegram bot token (create one with @BotFather)
- [Mise](https://github.com/jdx/mise) (_optional_) for managing tool versions

### Environment configuration

Create a `.env` file in root with:

- `TELEGRAM_BOT_TOKEN`: your Telegram bot token
- `TELEGRAM_WEBHOOK_SECRET`: secret used to validate incoming webhook requests (see Telegram's [setWebhook docs](https://core.telegram.org/bots/api#setwebhook))
- `ENV` (_optional_): `development|preview|production` (defaults to `production`)

Set Telegram bot webhook:

```bash
curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook" \
  -H "Content-Type: application/json" \
  -d "{\"url\":\"https://your-domain.example.com/webhook\",\"secret_token\":\"${TELEGRAM_WEBHOOK_SECRET}\",\"allowed_updates\":[\"message\",\"callback_query\"]}"
```

### Development (local)

1. Install project tools (if you're using Mise):

   ```bash
   mise install
   ```

2. Install dependencies:

   ```bash
   bun install
   ```

3. Create a `.env` file with the required environment variables listed above.

4. Start the dev server:

   ```bash
   bun dev
   ```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
