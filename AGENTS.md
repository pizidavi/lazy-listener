# AGENTS.md

## What

Telegram bot: voice → text transcription. Private chats + groups.

**Stack:** HonoJS, Wrangler (Cloudflare Workers), Bun, TypeScript

## Data Flow

Webhook → Validate → Download audio → Transcribe (Whisper) → Refine (Gemma) → Reply

## Structure

- `configs/`: constants, env
- `libs/`: external API clients
- `middlewares/`: route checks
- `routes/`: route definitions
- `types/`: type definitions
- `utils/`: shared functions

## Patterns

- Service Injection: `registerService` → `c.var`
- Error Handling: Throw `Exception` with HTTP status; routes catch → 200 OK to Telegram
- AI: `ai.run(model, input)`; models hardcoded
- Validation: Zod schemas in `src/types/schema.ts`
- Logging: `c.var.logger` (from middleware)
- i18n: `t(language, key)` from `src/locale/`

## Conventions

- File Structure: group by purpose
- Async/Await: all I/O async; `Promise.resolve().then()` for error chains
- Refinement Prompt: customize in `src/utils/prompt.ts`; respond with refined text or "No content"

## Runtime

1. Telegram → webhook (`POST /webhook`)
2. Middleware checks `X-Telegram-Bot-Api-Secret-Token` vs `TELEGRAM_WEBHOOK_SECRET`
3. Zod validates JSON; checks voice/audio `file_id`
4. Process:
   - Send typing action
   - Get download URL → download file
   - Transcribe with Whisper
   - Refine with Gemma (if enough content)
   - Reply with refined text
   - Error: react with emoji + log

## Commands

- `lint`: check linting
- `typecheck`: check types

## Agents Keyguard

- Always run `typecheck` + `lint` before completing task
- Ask user if info missing
