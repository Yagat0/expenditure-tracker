import React, { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';

import dayjs, { type Dayjs } from 'dayjs';
import 'dayjs/locale/cs';
import 'dayjs/locale/en';

import { Box, Button, Checkbox, Dialog, DialogActions, DialogContent, 
  DialogTitle, FormControl, FormControlLabel, InputLabel, MenuItem, Select, Stack } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import { useSettings } from '../../context/SettingsContext';
import type { Period } from '../../types/common';
import type { RecurrenceFilterType } from '../../types/filters';
import { useAppState } from '../../context/AppStateContext';
import { useI18n } from '../../i18n/useI18n';

export const ExpenseToolbar: React.FC = () => {
  const { quickFilters, setQuickFilters, openWizard } = useAppState();
  const { categories } = useSettings();
  const { t, formatDate, muiLocaleText, datePickerAdapterLocale } = useI18n();


  const [isCustomDateDialogOpen, setIsCustomDateDialogOpen] = useState(false); // Dialog filtru od-do
  const [customFromDraft, setCustomFromDraft] = useState<Dayjs | null>(null);
  const [customToDraft, setCustomToDraft] = useState<Dayjs | null>(null);

  const seedCustomDraft = () => {
    setCustomFromDraft(quickFilters.customDateRange.from ? dayjs(quickFilters.customDateRange.from) : null);
    setCustomToDraft(quickFilters.customDateRange.to ? dayjs(quickFilters.customDateRange.to) : null);
  };

  const openCustomDateDialog = () => {
    seedCustomDraft();
    setIsCustomDateDialogOpen(true);
  };

  const closeCustomDateDialog = () => setIsCustomDateDialogOpen(false);

  const customDateRangeLabel = useMemo(() => {
    const { from, to } = quickFilters.customDateRange;
    if (!from && !to) return t('toolbar.period.rangePlaceholder');

    const format = (val: string | null) => {
      if (!val) return '';
      const d = dayjs(val);
      return d.isValid() ? formatDate(d.toDate(), { dateStyle: 'short', timeStyle: 'short' }) : val;
    };

    if (from && to) return `${format(from)} - ${format(to)}`;
    if (from) return `${t('toolbar.period.from')} ${format(from)}`;
    return `${t('toolbar.period.to')} ${format(to)}`;
  }, [quickFilters.customDateRange, t, formatDate]);

  const handlePeriodChange = (e: SelectChangeEvent) => {
    const value = e.target.value as Period;
    if (value === 'custom') {
      openCustomDateDialog();
      return;
    }
    setQuickFilters({ period: value });
  };

  const handleCategoryChange = (e: SelectChangeEvent) => {
    setQuickFilters({ category: e.target.value });
  };

  const handleRecurrenceChange = (e: SelectChangeEvent) => {
    setQuickFilters({ recurrence: e.target.value as RecurrenceFilterType });
  };

  const handleOnlyInPastOrNowChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuickFilters({ onlyInPastOrNow: event.target.checked });
  };

  const handleApplyCustomRange = () => {
    const formatDraft = (val: Dayjs | null) => (val && val.isValid() ? val.format('YYYY-MM-DDTHH:mm') : null);
    
    setQuickFilters({
      period: 'custom',
      customDateRange: {
        from: formatDraft(customFromDraft),
        to: formatDraft(customToDraft)
      }
    });
    setIsCustomDateDialogOpen(false);
  };

  const handleClearCustomDraft = () => {
    setCustomFromDraft(null);
    setCustomToDraft(null);
  };

  // Handler pro otevření wizardu bez parametrů (pro nový výdaj)
  const handleAddClick = () => openWizard();

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: { xs: 'column', lg: 'row' },
      justifyContent: 'space-between',
      alignItems: { xs: 'stretch', lg: 'center' },
      gap: 2
    }}>
      
      <Button
        variant="contained"
        color="primary"
        startIcon={<Plus size={20} />}
        onClick={handleAddClick}
        sx={{ fontWeight: 'bold', height: '40px', flexShrink: 0 }} 
      >
        {t('toolbar.addExpense')}
      </Button>

      {/* Použit základní CSS grid, protože MUI se překrýval */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { 
          xs: '1fr',                  // mobil: všechno pod sebou
          sm: 'repeat(4, 1fr)',       // mobil/tablet: 4 přesně stejné sloupce
          lg: 'auto auto auto auto'   // PC: zarovnané doprava, široké dle obsahu
        },
        gap: 2,
        justifyContent: { lg: 'end' },
        alignItems: 'start',
        width: { xs: '100%', lg: 'auto' }
      }}>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <FormControl size="small" fullWidth>
            <InputLabel>{t('toolbar.period')}</InputLabel>
            <Select value={quickFilters.period} label={t('toolbar.period')} onChange={handlePeriodChange}>
              <MenuItem value="all">{t('toolbar.period.all')}</MenuItem>
              <MenuItem value="today">{t('toolbar.period.today')}</MenuItem>
              <MenuItem value="thisweek">{t('toolbar.period.thisweek')}</MenuItem>
              <MenuItem value="thismonth">{t('toolbar.period.thismonth')}</MenuItem>
              <MenuItem value="thisyear">{t('toolbar.period.thisyear')}</MenuItem>
              <MenuItem value="custom">{t('toolbar.period.custom')}</MenuItem>
            </Select>
          </FormControl>
          {quickFilters.period === 'custom' && (
            <Button
              variant="text"
              size="small"
              onClick={openCustomDateDialog}
              sx={{ alignSelf: 'flex-start', minWidth: 'unset', px: 0, textTransform: 'none', fontSize: '0.75rem' }}
            >
              {customDateRangeLabel}
            </Button>
          )}
        </Box>

        <FormControl size="small" fullWidth>
          <InputLabel>{t('toolbar.category')}</InputLabel>
          <Select value={quickFilters.category} label={t('toolbar.category')} onChange={handleCategoryChange}>
            <MenuItem value="all">{t('toolbar.category.all')}</MenuItem>
            {categories.map(cat => (
              <MenuItem key={cat.name} value={cat.name}>{cat.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" fullWidth>
          <InputLabel>{t('toolbar.recurrence')}</InputLabel>
          <Select value={quickFilters.recurrence} label={t('toolbar.recurrence')} onChange={handleRecurrenceChange}>
            <MenuItem value="all">{t('toolbar.recurrence.all')}</MenuItem>
            <MenuItem value="recurrent">{t('toolbar.recurrence.recurring')}</MenuItem>
            <MenuItem value="nonrecurrent">{t('toolbar.recurrence.oneTime')}</MenuItem>
          </Select>
        </FormControl>

        <FormControlLabel
          sx={{ m: 0, height: '40px' }}
          control={(
            <Checkbox
              size="small"
              checked={quickFilters.onlyInPastOrNow}
              onChange={handleOnlyInPastOrNowChange}
            />
          )}
          label={t('toolbar.onlyInPastOrNow')}
        />
        
      </Box>

      <Dialog open={isCustomDateDialogOpen} onClose={closeCustomDateDialog} fullWidth maxWidth="xs">
        <DialogTitle>{t('toolbar.period.custom')}</DialogTitle>
        <DialogContent>
          <LocalizationProvider
            dateAdapter={AdapterDayjs}
            adapterLocale={datePickerAdapterLocale}
            localeText={muiLocaleText.datePicker}
          >
            <Stack spacing={2} sx={{ mt: 1 }}>
              <DateTimePicker
                label={t('toolbar.period.from')}
                value={customFromDraft}
                onChange={(value) => setCustomFromDraft(value)}
                ampm={datePickerAdapterLocale === 'en'}
                views={['year', 'month', 'day', 'hours', 'minutes']}
                slotProps={{ textField: { fullWidth: true } }}
              />
              <DateTimePicker
                label={t('toolbar.period.to')}
                value={customToDraft}
                onChange={(value) => setCustomToDraft(value)}
                ampm={datePickerAdapterLocale === 'en'}
                views={['year', 'month', 'day', 'hours', 'minutes']}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Stack>
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeCustomDateDialog}>{t('common.cancel')}</Button>
          <Button onClick={handleClearCustomDraft}>{t('toolbar.period.clear')}</Button>
          <Button variant="contained" onClick={handleApplyCustomRange}>
            {t('toolbar.period.apply')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ExpenseToolbar;