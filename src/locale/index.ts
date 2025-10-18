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

export const t = (
  lang: LANGUAGE | (string & {}),
  key: FlattenJSON<typeof english>,
  values?: Record<string, string | number>,
): string => {
  const path = key.split(':');

  // Try the requested language
  let result = getTranslatedString((locale as Record<string, any>)[lang], path, values);
  if (result) return result;

  // Fallback to English
  result = getTranslatedString(locale[LANGUAGE.ENGLISH], path, values);
  if (result) return result;

  return key;
};

const getTranslatedString = (
  localeObj: any,
  path: string[],
  replacements?: Record<string, string | number>,
): string | null => {
  let obj = localeObj;
  for (const p of path) obj = obj?.[p];

  if (obj) {
    let result = obj;
    if (replacements)
      for (const [k, v] of Object.entries(replacements))
        result = result.replace(new RegExp(`{{${k}}}`, 'g'), String(v));
    return result;
  }
  return null;
};
