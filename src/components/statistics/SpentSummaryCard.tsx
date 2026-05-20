import React from 'react';

import { Paper, Typography, Box, MenuItem, Select, FormControl } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';

import { useSettings } from '../../context/SettingsContext';
import { useSummaryAmount } from '../../context/ExpenseContext';
import type { Period } from '../../types/common';
import { useAppState } from '../../context/AppStateContext';
import { useI18n } from '../../i18n/useI18n';

export const SpentSummaryCard: React.FC = () => {
  const { defaultCurrency } = useSettings();
  const { t, formatNumber } = useI18n();
  
  const { summaryPeriod, setSummaryPeriod } = useAppState();
  const amount = useSummaryAmount(summaryPeriod);

  // Škálování velikosti písma podle délky částky
  // Krátká částka (<=7 znaků) 3rem / 48px
  // Dlouhá částka (>= 14 znaků) 1.25rem / 20px
  const formattedAmount = `${formatNumber(amount)} ${defaultCurrency}`;
  const amountFontSizeRem = Math.max(1.25, Math.min(3, 3 - (formattedAmount.length - 7) * 0.25));

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 3, 
        textAlign: 'center', 
        borderRadius: 2,
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        border: '1px solid #e0e0e0'
      }}
    >
      <Typography variant="h6" color="text.secondary" gutterBottom>
        {t('spentSummary.title')}
      </Typography>
      
      <Typography
        variant="h3"
        component="div"
        fontWeight="bold"
        color="error.main"
        sx={{
          fontSize: `${amountFontSizeRem}rem`,
          whiteSpace: 'nowrap',
        }}
      >
        {formattedAmount}
      </Typography>
      
      {/* Select v kartě */}
      <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
        <Typography variant="subtitle1" color="text.secondary">
          {t('spentSummary.for')}
        </Typography>
        <FormControl variant="standard">
          <Select
            value={summaryPeriod}
            onChange={(e: SelectChangeEvent) => { setSummaryPeriod(e.target.value as Period) }}
            disableUnderline
            sx={{
              color: 'text.secondary',
              fontWeight: 'medium',
              fontSize: '1rem',
              '& .MuiSelect-select': { py: 0, paddingRight: '24px !important' } // size=small nestačí, pr: 24px kvůli šipce
            }}
          >
            <MenuItem value="today">{t('spentSummary.period.today')}</MenuItem>
            <MenuItem value="thisweek">{t('spentSummary.period.thisweek')}</MenuItem>
            <MenuItem value="thismonth">{t('spentSummary.period.thismonth')}</MenuItem>
            <MenuItem value="thisyear">{t('spentSummary.period.thisyear')}</MenuItem>
            <MenuItem value="all">{t('spentSummary.period.all')}</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </Paper>
  );
};

export default SpentSummaryCard;