export type Locale = 'ko';

const dictionaries = {
  ko: () => import('./ko.json').then((module) => module.default),
};

export const getDictionary = async (locale: Locale) => dictionaries[locale](); 