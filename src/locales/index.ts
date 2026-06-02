import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import en from './en.json';
import fr from './fr.json';

export const supportedLanguages = ['en', 'fr'] as const;

export type SupportedLanguage = (typeof supportedLanguages)[number];

void i18n
	.use(LanguageDetector)
	.use(initReactI18next)
	.init({
		resources: {
			en: {
				translation: en,
			},
			fr: {
				translation: fr,
			},
		},

		fallbackLng: 'en',
		supportedLngs: supportedLanguages,
		nonExplicitSupportedLngs: true,

		interpolation: {
			escapeValue: false,
		},

		detection: {
			order: ['localStorage', 'navigator', 'htmlTag'],
			lookupLocalStorage: 'topRobbersLng',
			caches: ['localStorage'],
		},
	});

export default i18n;
