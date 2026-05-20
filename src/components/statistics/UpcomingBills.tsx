import React, { useMemo } from 'react';
import { Paper, Typography, List, ListItem, ListItemText, Divider } from '@mui/material';

import type { Expense } from '../../types/expense';
import { useSettings } from '../../context/SettingsContext';
import { useI18n } from '../../i18n/useI18n';

interface UpcomingBillsProps {
  bills: Expense[];
}

export const UpcomingBills: React.FC<UpcomingBillsProps> = ({ bills }) => {
  const { defaultCurrency } = useSettings();
  const { t, formatDate, formatNumber } = useI18n();

  const renderedList = useMemo(() => {
    if (bills.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary">
          {t('upcomingBills.none')}
        </Typography>
      );
    }

    return (
      <List disablePadding>
        {bills.map((bill, index) => {
          const billName = bill.note || bill.location || bill.category; // Potřeba co nejdeskriptivnějšího názvu

          return (
            <React.Fragment key={bill.uuid}> {/* Fragment nutný, aby se nerozbilo stylování seznamu díky nadbytečnému divu */}
              <ListItem disableGutters>
                <ListItemText 
                  primary={`${index + 1}. ${billName}`} 
                  secondary={formatDate(bill.date)}
                  slotProps={{ primary: { fontWeight: 'medium' } }}
                />
                <Typography variant="body2" fontWeight="bold" color="error.main">
                  {formatNumber(bill.amount)} {defaultCurrency}
                </Typography>
              </ListItem>
              {index < bills.length - 1 && <Divider />}
            </React.Fragment>
          );
        })}
      </List>
    );
  }, [bills, t, formatDate, formatNumber, defaultCurrency]);

  return (
    <Paper elevation={1} sx={{ p: 2, borderRadius: 2, border: '1px solid #e0e0e0', height: '100%' }}>
      <Typography variant="h6" gutterBottom fontWeight="bold">
        {t('upcomingBills.title')}
      </Typography>
      
      {renderedList}
    </Paper>
  );
};

export default UpcomingBills;