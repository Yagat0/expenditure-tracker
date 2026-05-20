import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import dayjs from 'dayjs';

import { Box, IconButton, Typography, useTheme } from '@mui/material';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { useExpenses } from '../../context/ExpenseContext';
import { useSettings } from '../../context/SettingsContext';
import { useI18n } from '../../i18n/useI18n';

const WINDOW_SIZE = 7;
const INITIAL_WINDOW_OFFSET = -5;

export const SpentBarChart: React.FC = () => {
  const { expenses } = useExpenses();
  const { defaultCurrency } = useSettings();
  const theme = useTheme();
  const { t, formatNumber, formatDate } = useI18n();
  const [spentWindowOffset, setSpentWindowOffset] = useState(INITIAL_WINDOW_OFFSET);

  const handlePrevSpentWindow = () => {
    setSpentWindowOffset((prev) => prev - 1);
  };

  const handleNextSpentWindow = () => {
    setSpentWindowOffset((prev) => prev + 1);
  };

  const windowLabel = useMemo(() => {
    const windowStart = dayjs().startOf('month').add(spentWindowOffset, 'month');
    const windowEnd = windowStart.add(WINDOW_SIZE - 1, 'month');
    const startLabel = formatDate(windowStart.toDate(), { month: 'short', year: '2-digit' });
    const endLabel = formatDate(windowEnd.toDate(), { month: 'short', year: '2-digit' });

    return `${startLabel} - ${endLabel}`;
  }, [formatDate, spentWindowOffset]);

  const chartData = useMemo(() => {
    const data = [];
    const now = dayjs();
    const nowTime = now.valueOf();
    const windowStart = now.startOf('month').add(spentWindowOffset, 'month');

    for (let i = 0; i < WINDOW_SIZE; i++) {
      const targetDate = windowStart.add(i, 'month');
      const isCurrentMonth = targetDate.isSame(now, 'month');
      const isFutureMonth = targetDate.isAfter(now, 'month');

      const sums = expenses.reduce(
        (acc, exp) => {
          const expDate = dayjs(exp.date);
          if (!expDate.isSame(targetDate, 'month')) {
            return acc;
          }

          if (isFutureMonth) {
            acc.planned += exp.amount;
            return acc;
          }

          if (isCurrentMonth) {
            if (expDate.valueOf() > nowTime) {
              acc.planned += exp.amount;
            } else {
              acc.spent += exp.amount;
            }
            return acc;
          }

          acc.spent += exp.amount;
          return acc;
        },
        { spent: 0, planned: 0 }
      );

      data.push({
        name: formatDate(targetDate.toDate(), { month: 'short', year: '2-digit' }),
        spent: sums.spent,
        planned: sums.planned,
        isCurrentMonth,
        isFutureMonth
      });
    }

    return data;
  }, [expenses, formatDate, spentWindowOffset]);

  const customTooltip = ({ active, payload, label }: any) => {
    // Myš nad sloupcem? 
    if (active && payload && payload.length) {
      // Taháme původní objekt vytvořený v chartData
      const data = payload[0].payload;
      const isCurrentMonth = data.isCurrentMonth;
      const isFutureMonth = data.isFutureMonth;
      const spentColor = theme.palette.primary.main;
      const plannedColor = theme.palette.primary.light;

      return (
        <Box sx={{ 
          bgcolor: 'rgba(255, 255, 255, 0.95)', 
          p: 1.5, 
          border: '1px solid #e0e0e0', 
          borderRadius: 1, 
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
        }}>
          <Typography variant="subtitle2" sx={{ textTransform: 'capitalize', mb: 0.5 }}>
            {label}
          </Typography>
          {isCurrentMonth ? (
            <>
              <Typography variant="body2" sx={{ color: spentColor, fontWeight: 'bold' }}>
                {t('charts.spent')}: {formatNumber(Number(data.spent))} {defaultCurrency}
              </Typography>
              <Typography variant="body2" sx={{ color: plannedColor, fontWeight: 'bold' }}>
                {t('charts.planned')}: {formatNumber(Number(data.planned))} {defaultCurrency}
              </Typography>
            </>
          ) : (
            <Typography
              variant="body2"
              sx={{ color: isFutureMonth ? plannedColor : spentColor, fontWeight: 'bold' }}
            >
              {isFutureMonth ? t('charts.planned') : t('charts.spent')}: {formatNumber(Number(isFutureMonth ? data.planned : data.spent))} {defaultCurrency}
            </Typography>
          )}
        </Box>
      );
    }
    return null;
  };

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', p: 2, bgcolor: '#fff', borderRadius: 2, border: '1px solid #e0e0e0' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
        <Typography variant="subtitle2" color="text.secondary" fontWeight="bold" sx={{ textTransform: 'uppercase' }}>
          {t('charts.historyPlannedBarChartLabel')}
        </Typography>

        {/* Posunutí okna o měsíc do minulosti */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <IconButton size="small" onClick={handlePrevSpentWindow}>
            <ChevronLeft size={18} />
          </IconButton>

          <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize', minWidth: 120, textAlign: 'center' }}>
            {windowLabel}
          </Typography>

          {/* Posunutí okna o měsíc do budoucnosti */}
          <IconButton size="small" onClick={handleNextSpentWindow}>
            <ChevronRight size={18} />
          </IconButton>
        </Box>
      </Box>
      
      <Box sx={{ flexGrow: 1, minHeight: 250, mt: 1 }}>
        <ResponsiveContainer width="100%" height={250} minWidth={0}> {/* Pro vyplnění 100 % šířky rodičovského Boxu */}
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
            
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} 
              tickFormatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
              dy={10}
            />
            
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} 
              tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}
            />
            
            {/* Náhrada defaultního tooltipu */}
            <Tooltip 
              cursor={{ fill: '#f5f5f5' }}
              content={customTooltip}
            />
            
            <Bar dataKey="spent" stackId="a" fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} maxBarSize={40} />
            <Bar dataKey="planned" stackId="a" fill={theme.palette.primary.light} fillOpacity={0.3} stroke={theme.palette.primary.main} strokeDasharray="4 4" radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default SpentBarChart;