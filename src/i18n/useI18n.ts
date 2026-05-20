import { useMemo } from 'react';

import { useSettings } from '../context/SettingsContext';
import { t, formatNumber, formatDate, getLocale, supportedLanguages, 
  getDatePickerAdapterLocale, getMuiLocaleText
} from './translations';
import type { TranslationKey } from './translations';

export const useI18n = () => {
  const { language } = useSettings();

  return useMemo(() => ({
    language,
    locale: getLocale(language),
    supportedLanguages,
    getLanguageLabel: (code: string) => {
      const key = `language.${code}` as TranslationKey;
      const label = t(language, key);
      return label === key ? code : label;
    },
    t: (key: TranslationKey, vars?: Record<string, string | number>) => t(language, key, vars),
    formatNumber: (value: number, options?: Intl.NumberFormatOptions) =>
      formatNumber(language, value, options),
    // Přijímáme i string a number pro lepší kompatibilitu s daty z API/Contextu
    formatDate: (value: Date | string | number, options?: Intl.DateTimeFormatOptions) =>
      formatDate(language, value, options),
    muiLocaleText: getMuiLocaleText(language),
    datePickerAdapterLocale: getDatePickerAdapterLocale(language)
  }), [language]); // Hook se přepočítá pouze při změně jazyka
};