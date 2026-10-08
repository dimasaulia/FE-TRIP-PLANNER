import { dictionaries, type Language, type TranslationKey } from "./dictionaries";

export type TranslateVars = Record<string, string | number>;

export const DEFAULT_LANGUAGE: Language = "id";

/** Pure lookup with `{name}` placeholders; safe on the server (metadata) too. */
export function translate(language: Language, key: TranslationKey, vars?: TranslateVars) {
  const template: string = dictionaries[language][key] ?? dictionaries[DEFAULT_LANGUAGE][key] ?? key;
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) => (name in vars ? String(vars[name]) : match));
}
