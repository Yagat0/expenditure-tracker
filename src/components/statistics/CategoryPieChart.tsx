import React, { useMemo } from 'react';
import { PieChart, Pie, ResponsiveContainer, Tooltip, Sector, type PieSectorShapeProps } from 'recharts';

import dayjs from 'dayjs';

import { Box, Typography, Stack } from '@mui/material';

import { useExpenses } from '../../context/ExpenseContext';
import { useSettings } from '../../context/SettingsContext';
import { useAppState } from '../../context/AppStateContext';
import { useI18n } from '../../i18n/useI18n';

const renderCustomSector = (props: PieSectorShapeProps) => (
  <Sector {...props} fill={props.payload.color} />
);

export const CategoryPieChart: React.FC = () => {
  const { expenses } = useExpenses();
  const { statsDate } = useAppState();
  const { categories, defaultCurrency } = useSettings();
  const { t, formatNumber } = useI18n();

  // Data pro současný měsíc
  const chartData = useMemo(() => {
    const targetDate = dayjs(statsDate);
    
    const monthlyExpenses = expenses.filter(e => {
      // isSame je vestavěná funkce dayjs, která to porovná mnohem čistěji
      return dayjs(e.date).isSame(targetDate, 'month'); 
    });

    const total = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);
    
    // Seskupit podle kategorií
    const grouped = monthlyExpenses.reduce((acc: Record<string, number>, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {});

    return Object.keys(grouped).map(catName => {
      const catConfig = categories.find(c => c.name === catName);
      const amount = grouped[catName];
      return {
        name: catName,
        value: amount,
        percent: total > 0 ? ((amount / total) * 100).toFixed(1) : 0,
        color: catConfig?.color || '#9e9e9e'
      };
    }).sort((a, b) => b.value - a.value);
  }, [expenses, statsDate, categories]);

  if (chartData.length === 0) {
    return <Typography color="text.secondary">{t('charts.noData')}</Typography>;
  }

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flexGrow: 1, minHeight: 250 }}>
        <ResponsiveContainer width="100%" height={250} minWidth={0}> {/* Pro 100 % roztažení v parent Boxu */}
          <PieChart>
            <Pie
              data={chartData}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              shape={renderCustomSector}
            />
            <Tooltip 
              formatter={(value) => `${formatNumber(Number(value))} ${defaultCurrency}`}
            />
          </PieChart>
        </ResponsiveContainer>
      </Box>

      {/* Barevná legenda */}
      <Stack spacing={1} sx={{ mt: 2, px: 2 }}>
        {chartData.map((entry, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: entry.color }} />
              <Typography variant="body2">{entry.name}</Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {entry.percent}% ({formatNumber(entry.value)} {defaultCurrency})
            </Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

export default CategoryPieChart;