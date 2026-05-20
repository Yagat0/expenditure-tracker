import React, { useMemo } from 'react';

import { Box, Stack } from '@mui/material';

import { KpiCard } from '../components/statistics/KpiCard';
import { UpcomingBills } from '../components/statistics/UpcomingBills';
import { MonthSelector } from '../components/expense_display/MonthSelector';
import { CategoryPieChart } from '../components/statistics/CategoryPieChart';
import { useExpenses } from '../context/ExpenseContext';
import { useSettings } from '../context/SettingsContext';
import SpentBarChart from '../components/statistics/spentBarChart';
import { useAppState } from '../context/AppStateContext';
import { useI18n } from '../i18n/useI18n';

import dayjs from 'dayjs';

export const StatisticsPage: React.FC = () => {
  const { statsDate } = useAppState();
  const { expenses } = useExpenses();
  const { defaultCurrency } = useSettings();
  const { t, formatNumber } = useI18n();

  const targetDate = useMemo(() => dayjs(statsDate), [statsDate]);

  // Filtr pro vybrání výdajů pouze ze současného měsíce
  const monthlyExpenses = useMemo(() => {
    return expenses.filter(e => {
      return dayjs(e.date).isSame(targetDate, 'month');
    });
  }, [expenses, targetDate]);

  // KPI - celkem utraceno za měsíc + KPI - výpočet denního průměru
  const { totalAmount, dailyAverage } = useMemo(() => {
    const total = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);
    
    const now = dayjs();
    const isCurrentMonth = targetDate.isSame(now, 'month');
    const daysInMonth = targetDate.daysInMonth();
    const elapsedDays = Math.max(1, isCurrentMonth ? now.date() : daysInMonth);
    
    return {
      totalAmount: total,
      dailyAverage: total > 0 ? (total / elapsedDays).toFixed(2) : '0'
    };
  }, [monthlyExpenses, targetDate]);

  //KPI - nejdražší kategorie
  const mostExpensiveCategory = useMemo(() => {
    if (monthlyExpenses.length === 0) return '-';

    // Vytvoří slovník kategorie - výše výdajů v dané kategorii
    const grouped = monthlyExpenses.reduce((acc: Record<string, number>, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {});

    let maxCat = '-';
    let maxAmount = -1;

    // Získání nejdražší kategorie ze slovníku
    for (const [cat, amount] of Object.entries(grouped)) {
      if (amount > maxAmount) {
        maxAmount = amount;
        maxCat = cat;
      }
    }
    return maxCat;
  }, [monthlyExpenses]);

  // Seznam tří nejbližších plánovaných výdajů (nezávisí na vybraném měsíci)
  const upcomingBills = useMemo(() => {
    const nowValue = dayjs().valueOf();

    return expenses
      .filter(e => dayjs(e.date).valueOf() > nowValue) // novější než teď
      // sort očekává jako výsledek číslo (záporné - a před b, kladné - b před a, 0 - pořadí je stejné)
      .sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf())
      .slice(0, 3); // Tři nejbližší
  }, [expenses]);

  return (
    <Box sx={{ pb: 4 }}>
      <Stack spacing={4}>
        <MonthSelector />

        {/* KPI karty */}
        <Box sx={{ 
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, 
          gap: 2
        }}>
          <KpiCard 
            title={t('stats.totalSpent')} 
            value={`${formatNumber(totalAmount)} ${defaultCurrency}`} 
          />
          <KpiCard 
            title={t('stats.dailyAverage')} 
            value={`${dailyAverage} ${defaultCurrency}`} 
          />
          <KpiCard 
            title={t('stats.mostExpensiveCategory')} 
            value={mostExpensiveCategory} 
          />
        </Box>

        {/* Grafy a nejbližší výdaje */}
        <Box sx={{ 
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, 
          gap: 3 
        }}>
          
          <Stack spacing={3}>
            <CategoryPieChart />
            <SpentBarChart />
          </Stack>
          
          <Box>
            <UpcomingBills bills={upcomingBills} />
          </Box>
          
        </Box>

      </Stack>
    </Box>
  );
};

export default StatisticsPage;