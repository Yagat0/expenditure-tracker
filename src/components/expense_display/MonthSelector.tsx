import React, { useMemo   } from 'react';
import { Typography, IconButton, Stack } from '@mui/material';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';
import { useI18n } from '../../i18n/useI18n';
import dayjs from 'dayjs';

export const MonthSelector: React.FC = () => {
  const { statsDate, setStatsDate } = useAppState();
  const { formatDate } = useI18n();

  const currentDate = useMemo(() => dayjs(statsDate), [statsDate]);

  const isNextDisabled = useMemo(() => {
    return currentDate.isSame(dayjs(), 'month');
  }, [currentDate]);

  const handlePrevMonth = () => {
    // subtract ubere 1 měsíc a toISOString() z toho udělá zpátky string pro Context
    const prev = currentDate.subtract(1, 'month').toISOString();
    setStatsDate(prev);
  };

  const handleNextMonth = () => {
    const next = currentDate.add(1, 'month');
    
    // Kontrola, aby nešlo jít do budoucnosti
    if (next.isAfter(dayjs(), 'month')) {
      return;
    }
    setStatsDate(next.toISOString());
  };

  const monthName = formatDate(currentDate.toDate(), { month: 'long', year: 'numeric' });

  return (
    <Stack direction="row" alignItems="center" justifyContent="center" spacing={2} sx={{ p: 2 }}>
      <IconButton onClick={handlePrevMonth}>
        <ChevronLeft />
      </IconButton>
      <Typography variant="h5" sx={{ textTransform: 'capitalize', minWidth: 200, textAlign: 'center' }}>
        {monthName}
      </Typography>
      <IconButton onClick={handleNextMonth} disabled={isNextDisabled}>
        <ChevronRight />
      </IconButton>
    </Stack>
  );
};

export default MonthSelector;