import { translations as westernTranslations } from './western.js';
import { translations as southernTranslations } from './southern.js';
import { translations as northernTranslations } from './northern.js';
import { translations as centralTranslations } from './central.js';
import { translations as balkanTranslations } from './balkan.js';
import { translations as edgeTranslations } from './edge.js';

export const translations = {
  ...westernTranslations,
  ...southernTranslations,
  ...northernTranslations,
  ...centralTranslations,
  ...balkanTranslations,
  ...edgeTranslations,
};
