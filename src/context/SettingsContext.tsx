import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

import dayjs from 'dayjs';
import 'dayjs/locale/cs';
import 'dayjs/locale/en';

import type { Settings, Category, Language } from '../types/settings.ts';
import { t, getDatePickerAdapterLocale } from '../i18n/translations';

interface SettingsContextType extends Settings {
  addCategory: (newCat: Category) => void;
  removeCategory: (name: string) => void;
  updateCategory: (name: string, updates: Partial<Pick<Category, 'iconName' | 'color'>>) => void;
  updateLanguage: (language: Language) => void;
  // updateCurrency: (currency: string) => void;

  exportAllData: () => void;
  importAllData: (jsonData: string) => boolean;
}

const INITIAL_CATEGORIES: Category[] = [
  { name: 'Potraviny', iconName: 'Utensils', color: '#4caf50' },
  { name: 'Doprava', iconName: 'Car', color: '#2196f3' },
  { name: 'Bydlení', iconName: 'Home', color: '#ff9800' },
  { name: 'Zábava', iconName: 'Gamepad2', color: '#9c27b0' },
  { name: 'Zdraví', iconName: 'HeartPulse', color: '#f44336' },
  { name: 'Ostatní', iconName: 'CircleEllipsis', color: '#9e9e9e' },
];

const FIXED_CURRENCY = 'CZK';

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const normalizeSettings = (saved: Partial<Settings> | null): Settings => ({
  categories: INITIAL_CATEGORIES,
  language: 'cs',
  ...(saved ?? {}),
  defaultCurrency: FIXED_CURRENCY, // NOTE: Při využití updateCurrency v budoucnu nezapomenout změnit
});

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const saved = localStorage.getItem('tracker_settings');
      const parsedSettings = saved ? JSON.parse(saved) : null;
      const normalized = normalizeSettings(parsedSettings); // Doplnění případných chybějících hodnot
      
      dayjs.locale(getDatePickerAdapterLocale(normalized.language));
      
      return normalized;
    } catch {
      const fallback = normalizeSettings(null);
      dayjs.locale(getDatePickerAdapterLocale(fallback.language));
      return fallback;
    }
  });

  useEffect(() => {
    localStorage.setItem('tracker_settings', JSON.stringify(settings));
  }, [settings]);

  // Funkce zabaleny do useCallback, aby neměnily referenci.
  const addCategory = useCallback((newCat: Category) => {
    setSettings(prev => {
      if (prev.categories.some(c => c.name === newCat.name)) return prev;
      return { ...prev, categories: [...prev.categories, newCat] };
    });
  }, []);

  const removeCategory = useCallback((name: string) => {
    setSettings(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c.name !== name)
    }));
  }, []);

  const updateCategory = useCallback((name: string, updates: Partial<Pick<Category, 'iconName' | 'color'>>) => {
    setSettings(prev => ({
      ...prev,
      categories: prev.categories.map(category => (
        category.name === name
          ? { ...category, ...updates }
          : category
      ))
    }));
  }, []);

  const updateLanguage = useCallback((language: Language) => {
    // Nutnost úpravy dayjs před překreslením, jinak se "Tento týden" promítne až při změně filtrů
    dayjs.locale(getDatePickerAdapterLocale(language));
    
    setSettings(prev => ({ ...prev, language }));
  }, []);

  // TODO: Zakomentováno pro budoucí použití
  // const updateCurrency = useCallback((currency: string) => {
  //   setSettings(prev => ({ ...prev, defaultCurrency: currency }));
  // }, []);

  const exportAllData = useCallback(() => {
    try {
      const allData = {
        expenses: JSON.parse(localStorage.getItem('tracker_expenses') || '[]'),
        settings: settings
      };
      
      // Data vložíme do Binary large objectu
      const blob = new Blob([JSON.stringify(allData, null, 2)], { type: "application/json" });
      // Vytvoření odkazu na blob
      const url = URL.createObjectURL(blob);
      
      // Simulace kliknutí  
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.href = url;
      downloadAnchorNode.download = `expenditure_tracker_backup_${new Date().toISOString().slice(0, 10)}.json`;
      
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      document.body.removeChild(downloadAnchorNode);
      
      // Úklid
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(t(settings.language, 'settings.exportFailedLog'), error);
      alert(t(settings.language, 'settings.exportFailedAlert'));
    }
  }, [settings]);

  const importAllData = useCallback((jsonData: string): boolean => {
    try {
      const data = JSON.parse(jsonData);
      if (data && Array.isArray(data.expenses) && data.settings) {
        localStorage.setItem('tracker_expenses', JSON.stringify(data.expenses));
        
        const normalized = normalizeSettings(data.settings);
        localStorage.setItem('tracker_settings', JSON.stringify(normalized)); 
        setSettings(normalized);

        window.location.reload();
        return true;
      }
      return false;
    } catch (e) {
      console.error(t(settings.language, 'settings.importInvalidLog'), e);
      return false;
    }
  }, [settings.language]);

  // Memoizace, aby se předešlo zbytečnému rerenderingu
  // Při re-renderu z libovolného důvodu se vytváří nový context objekt,
  // i když se v expenses nic nezměnilo. Tahle memoizace tomu zabrání.
  const contextValue = useMemo(() => ({
    ...settings,
    addCategory,
    removeCategory,
    updateCategory,
    updateLanguage,
    // updateCurrency,
    exportAllData,
    importAllData
  }), [
    settings, addCategory, removeCategory, updateCategory, updateLanguage, 
    /* updateCurrency, */ exportAllData, importAllData
  ]);

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('SETTINGS_CONTEXT_MISSING');
  return context;
};