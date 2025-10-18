# Privacy Policy

This privacy policy explains how we handle user data, what information we collect, and how we protect your privacy.

## Data Collection and Usage

- **No Personal Data Storage**: We do not store any personal information, user data, or audio files. All processing is done in memory and data is discarded immediately after transcription.
- **Chat ID and User ID**: We temporarily use chat IDs and user IDs solely for rate-limiting purposes to prevent abuse and ensure fair usage. These IDs are not stored permanently.
- **Logging**: Chat IDs may appear in logs for debugging and operational purposes. Logs are retained for a limited time and are not used for any other purpose.
- **Audio Processing**: Voice messages are downloaded temporarily from Telegram's servers, transcribed using [AI models](#ai-models), and the resulting text is sent back. No audio files are saved or retained.

## Data Sharing

We do not share, sell, or disclose any user data to third parties. All processing occurs on Cloudflare Workers, and we adhere to Cloudflare's privacy practices.

## AI Models

The bot uses the following AI models hosted on Cloudflare:

- Transcription: `@cf/openai/whisper-large-v3-turbo`
- Refinement: `@cf/google/gemma-3-12b-it`

These models process the audio and text data in a secure, ephemeral manner without storing inputs or outputs.

## Telegram Integration

This bot operates within Telegram's ecosystem. Your interactions are subject to Telegram's [Privacy Policy](https://telegram.org/privacy).

## Contact

If you have any questions about this privacy policy or the bot's operation, please contact the bot administrator through Telegram.

## Changes to This Policy

This privacy policy may be updated occasionally. Any changes will be reflected in the bot's repository or communicated through the bot.
