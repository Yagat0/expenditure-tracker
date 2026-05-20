import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';

import dayjs from 'dayjs';

import type { Expense } from '../types/expense';
import type { QuickFilters } from '../types/filters';
import type { Period } from '../types/common';

interface AppStateContextType {
  quickFilters: QuickFilters;
  setQuickFilters: (filters: Partial<QuickFilters>) => void;
  
  summaryPeriod: Period;
  setSummaryPeriod: (period: Period) => void;

  isWizardOpen: boolean;
  expenseToEdit?: Expense;
  openWizard: (expense?: Expense) => void;
  closeWizard: () => void;

  deleteExpenseTarget: { uuid: string, isRecurring: boolean } | null;
  openDeleteExpenseDialog: (uuid: string, isRecurring: boolean) => void;
  closeDeleteExpenseDialog: () => void;

  isSettingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
  
  statsDate: string; 
  setStatsDate: (date: string) => void;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [quickFilters, setQuickFiltersState] = useState<QuickFilters>({
    period: 'all',
    category: 'all',
    recurrence: 'all',
    onlyInPastOrNow: true,
    customDateRange: { from: null, to: null }
  });

  const [summaryPeriod, setSummaryPeriod] = useState<Period>('thismonth');
  
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | undefined>(undefined);

  const [deleteExpenseTarget, setDeleteExpenseTarget] = useState<{ uuid: string, isRecurring: boolean } | null>(null);
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [statsDate, setStatsDate] = useState<string>(() => dayjs().startOf('month').toISOString());

  // Funkce zabaleny do useCallback, aby neměnily referenci.
  const setQuickFilters = useCallback((newFilters: Partial<QuickFilters>) => {
    setQuickFiltersState(prev => ({ ...prev, ...newFilters }));
  }, []);

  const openWizard = useCallback((expense?: Expense) => {
    setExpenseToEdit(expense);
    setIsWizardOpen(true);
  }, []);

  const closeWizard = useCallback(() => {
    setIsWizardOpen(false);
    setExpenseToEdit(undefined);
  }, []);

  const openDeleteExpenseDialog = useCallback((uuid: string, isRecurring: boolean) => {
    setDeleteExpenseTarget({ uuid, isRecurring });
  }, []);

  const closeDeleteExpenseDialog = useCallback(() => {
    setDeleteExpenseTarget(null);
  }, []);

  const openSettings = useCallback(() => {
    setIsSettingsOpen(true);
  }, []);

  const closeSettings = useCallback(() => {
    setIsSettingsOpen(false);
  }, []);

  // Memoizace, aby se předešlo zbytečnému rerenderingu
  // Při re-renderu z libovolného důvodu se vytváří nový context objekt,
  // i když se v expenses nic nezměnilo. Tahle memoizace tomu zabrání.
  const contextValue = useMemo(() => ({
    quickFilters, 
    setQuickFilters,
    
    summaryPeriod, 
    setSummaryPeriod,
    
    isWizardOpen, 
    expenseToEdit, 
    openWizard, 
    closeWizard,
    
    deleteExpenseTarget, 
    openDeleteExpenseDialog, 
    closeDeleteExpenseDialog,

    isSettingsOpen,
    openSettings,
    closeSettings,
    
    statsDate, 
    setStatsDate
  }), [
    quickFilters, setQuickFilters,
    summaryPeriod, setSummaryPeriod,
    isWizardOpen, expenseToEdit, openWizard, closeWizard,
    deleteExpenseTarget, openDeleteExpenseDialog, closeDeleteExpenseDialog,
    isSettingsOpen, openSettings, closeSettings,
    statsDate, setStatsDate
  ]);

  return (
    <AppStateContext.Provider value={contextValue}>
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) throw new Error('APP_STATE_CONTEXT_MISSING');
  return context;
};