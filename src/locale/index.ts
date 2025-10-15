import { LANGUAGE } from '../types/enum';
import english from './english.json';
import italian from './italian.json';

const locale = {
  [LANGUAGE.ENGLISH]: english,
  [LANGUAGE.ITALIAN]: italian,
} as const satisfies Record<LANGUAGE, typeof english & typeof italian>;

type FlattenJSON<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? `${K}:${FlattenJSON<T[K]>}`
          : `${K}`
        : never;
    }[keyof T]
  : never;

export const t = (lang: LANGUAGE | (string & {}), key: FlattenJSON<typeof english>): string => {
  const path = key.split(':');
  let obj = (locale as Record<string, any>)[lang] ?? locale[LANGUAGE.ENGLISH];

  for (const p of path) obj = obj?.[p];
  if (obj) return obj;

  // Fallback to English if translation not found
  obj = locale.en;
  for (const p of path) obj = obj?.[p];
  return obj ?? key;
};
