import { en } from "./dictionaries/en";
import { id } from "./dictionaries/id";

// Flat keys namespaced by feature (`library.*`, `schedule.*`, `errors.*`…).
export const dictionaries = { id, en } as const;

export type Language = keyof typeof dictionaries;
export type TranslationKey = keyof typeof id;
