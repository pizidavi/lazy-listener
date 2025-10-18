# Project overview

This document provides context about the project for the different agents.

## What is it

A Telegram bot that transcribes voice messages into text. Works in private chats and groups.

The project is built with a modern tech stack, including:

- Backend: HonoJS, Wrangler for Cloudflare worker
- Tooling: Bun, Prettier, ESLint, Typescript

## Architecture

## Data Flow

Webhook → Validate → Download audio → Transcribe (Whisper) → Refine (Gemma) → Reply

## AI models used

- Transcription: Whisper Turbo 3 (used in code as `@cf/openai/whisper-large-v3-turbo`).
- Refinement: Gemma 3 (used in code as `@cf/google/gemma-3-12b-it`).

## Project structure

- `configs`: the constants and env for the app
- `libs`: build-in services to contact external api
- `middlewares`: backend middlewares to check the various route
- `routes`: were the routes are defined
- `types`: were the types are defined
- `utils`: function in common for the app

### Key Patterns

- **Service Injection**: Use `registerService` middleware to inject clients into `c.var`
- **Error Handling**: Throw `Exception` with HTTP status; routes catch and return 200 OK to Telegram
- **AI Integration**: Call `ai.run(model, input)` for transcription/refinement; models hardcoded as `@cf/openai/whisper-large-v3-turbo` and `@cf/google/gemma-3-12b-it`
- **Validation**: Zod schemas in `src/types/schema.ts` for env and requests
- **Logging**: Use `c.var.logger` (from middleware) for structured logs
- **Internationalization**: `t(language, key)` from `src/locale/` for user messages

### Conventions

- **File Structure**: Group by purpose (routes, services, libs, middlewares, utils)
- **Async/Await**: All I/O operations async; use Promise.resolve().then() for error handling chains
- **Commands**: Only `/start` and `/help` in groups (admin-only), all in private
- **Audio Handling**: Support `voice` and `audio` message types; send typing action before processing
- **Refinement Prompt**: Customize in `src/utils/prompt.ts`; respond with only refined text or "No content"

### Workflows

- **Development**: `bun dev` (wrangler dev) for local testing
- **Deployment**: `mise run deploy` to Cloudflare
- **Type Generation**: `bun run cf:typegen` for Cloudflare bindings, always to run after changing `wrangler.jsonc`

## How it works

This section explains the runtime flow implemented in the code (see `src/services/telegram.service.ts` and `src/libs/ai/index.ts`):

1. Telegram sends an update to the worker webhook endpoint (`POST /webhook`). The worker middleware checks the `X-Telegram-Bot-Api-Secret-Token` header against `TELEGRAM_WEBHOOK_SECRET` and rejects unauthorized requests.
2. The route validates the incoming JSON using Zod and checks that the update includes a voice (or audio) object with a `file_id`.
3. The processing performs these steps:
   - Sends a chat action (typing) to inform the user the bot started processing.
   - Uses the Telegram API client to get a download URL for the `file_id` and downloads the file.
   - Calls the Cloudflare AI binding to transcribe the audio using the Whisper Turbo 3 model (in the code the model is referenced as `@cf/openai/whisper-large-v3-turbo`). The raw transcription text is returned.
   - If the transcription has enough content, the code then calls the Gemma 3 model (in the code referenced as `@cf/google/gemma-3-12b-it`) to lightly refactor/clean the text using a system prompt from `src/utils/prompt.ts`.
   - Finally, the worker sends the refined text back to the original chat as a reply. If an error occurs, the bot reacts to the message with a shrug/emoji and logs the error.

Edge cases handled by the project:

- Requests without the expected secret header are rejected (HTTP 401).
- Non-message updates or messages without a supported audio/voice file are ignored and return HTTP 200.
- Very short or empty transcriptions are treated as failures and do not result in replies.
