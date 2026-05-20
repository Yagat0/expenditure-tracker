import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';

import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import type { Expense } from '../types/expense';
import type { Period } from '../types/common';
import type { QuickFilters } from '../types/filters';
import { useAppState } from './AppStateContext';
import { useSettings } from './SettingsContext';

dayjs.extend(isBetween);
dayjs.extend(isSameOrBefore);

type CustomDateRange = { from: string | null; to: string | null };

interface ExpenseContextType {
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'uuid'>, customStopDate?: Date) => void;
  updateExpense: (expense: Expense) => void;
  deleteExpense: (uuid: string, deleteAllFuture?: boolean) => void;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const isDateInPeriod = (
  dateStr: string,
  period: Period,
  now: dayjs.Dayjs = dayjs(),
  customRange?: CustomDateRange
): boolean => {
  const date = dayjs(dateStr);
  if (!date.isValid()) return false;

  switch (period) {
    case 'all': return true;
    case 'today': return date.isSame(now, 'day');
    case 'thismonth': return date.isSame(now, 'month');
    case 'thisyear': return date.isSame(now, 'year');
    case 'thisweek': return date.isBetween(now.startOf('week'), now.endOf('week'), 'day', '[]');
    case 'custom': {
      const from = customRange?.from ? dayjs(customRange.from) : null;
      const to = customRange?.to ? dayjs(customRange.to) : null;
      
      if (from && from.isValid() && date.isBefore(from, 'day')) return false;
      if (to && to.isValid() && date.isAfter(to, 'day')) return false;
      return true;
    }
    default: return true;
  }
};

export const filterExpenses = (expenses: Expense[], quickFilters: QuickFilters): Expense[] => {
  const now = dayjs();
  
  return expenses.filter(exp => {
    if (quickFilters.category !== 'all' && exp.category !== quickFilters.category) return false;
    
    if (quickFilters.recurrence === 'recurrent' && exp.recurrence === 'none') return false;
    if (quickFilters.recurrence === 'nonrecurrent' && exp.recurrence !== 'none') return false;

    if (quickFilters.onlyInPastOrNow && !dayjs(exp.date).isSameOrBefore(now)) return false;

    return isDateInPeriod(exp.date, quickFilters.period, now, quickFilters.customDateRange);
  });
};

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try {
      const saved = localStorage.getItem('tracker_expenses');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return []; // Poškozený JSON v localStorage
    }
  });

  useEffect(() => {
    localStorage.setItem('tracker_expenses', JSON.stringify(expenses));
  }, [expenses]);

  // Funkce zabaleny do useCallback, aby neměnily referenci.
  const addExpense = useCallback((newExp: Omit<Expense, 'uuid'>, customStopDate?: Date) => {
    if (newExp.recurrence === 'none') {
      setExpenses(prev => [{ ...newExp, uuid: crypto.randomUUID() }, ...prev]);
      return;
    }

    const newInstances: Expense[] = [];
    const groupId = crypto.randomUUID();
    let currentDate = dayjs(newExp.date);
    const finalStopDate = customStopDate ? dayjs(customStopDate) : dayjs().add(2, 'year');

    while (currentDate.isSameOrBefore(finalStopDate)) {
      newInstances.push({
        ...newExp,
        uuid: crypto.randomUUID(),
        date: currentDate.toISOString(),
        recurringGroupId: groupId
      });

      if (newExp.recurrence === 'daily') currentDate = currentDate.add(1, 'day');
      else if (newExp.recurrence === 'weekly') currentDate = currentDate.add(1, 'week');
      else if (newExp.recurrence === 'monthly') currentDate = currentDate.add(1, 'month');
      else if (newExp.recurrence === 'yearly') currentDate = currentDate.add(1, 'year');
    }

    setExpenses(prev => [...newInstances, ...prev]);
  }, []);

  const updateExpense = useCallback((updated: Expense) => {
    setExpenses(prev => prev.map(e => e.uuid === updated.uuid ? updated : e));
  }, []);

  const deleteExpense = useCallback((uuid: string, deleteAllFuture = false) => {
    setExpenses(prev => {
      const target = prev.find(e => e.uuid === uuid);
      
      //
      if (!target || !deleteAllFuture || !target.recurringGroupId) {
        return prev.filter(e => e.uuid !== uuid);
      }
      const targetDate = dayjs(target.date);
      return prev.filter(e => {
        if (e.recurringGroupId !== target.recurringGroupId) return true; // Jiná skupina, zachovat
        return dayjs(e.date).isBefore(targetDate); // Jestliže je výdaj po targetu, smazat
      });
    });
  }, []);

  // Memoizace, aby se předešlo zbytečnému rerenderingu
  // Při re-renderu z libovolného důvodu se vytváří nový context objekt,
  // i když se v expenses nic nezměnilo. Tahle memoizace tomu zabrání.
  const contextValue = useMemo(() => ({
    expenses,
    addExpense,
    updateExpense,
    deleteExpense
  }), [expenses, addExpense, updateExpense, deleteExpense]);

  return (
    <ExpenseContext.Provider value={contextValue}>
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (!context) throw new Error('useExpenses must be used within ExpenseProvider');
  return context;
};

export const useFilteredExpenses = () => {
  const { expenses } = useExpenses();
  const { quickFilters } = useAppState();
  const { language } = useSettings();
  return useMemo(() => filterExpenses(expenses, quickFilters), [expenses, quickFilters, language]);
};

export const useSummaryAmount = (period: Period) => {
  const { expenses } = useExpenses();
  const { language } = useSettings();
  
  return useMemo(() => {
    const now = dayjs();
    return expenses
      .filter(exp => isDateInPeriod(exp.date, period, now) && dayjs(exp.date).isSameOrBefore(now))
      .reduce((sum, exp) => sum + exp.amount, 0);
  }, [expenses, period, language]);
};