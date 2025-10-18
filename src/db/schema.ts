import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const transcriptionStats = sqliteTable('transcription_stats', {
  date: text('date', { length: 10 }).primaryKey(), // YYYY-MM-DD
  transcriptionCounter: integer('transcription_counter').default(0).notNull(),
});
