import React from 'react';

import { Box, useMediaQuery, useTheme } from '@mui/material';

import { SpentSummaryCard } from '../components/statistics/SpentSummaryCard';
import { ExpenseToolbar } from '../components/expense_display/ExpenseToolbar';
import ExpenseDataGrid from '../components/expense_display/ExpenseDataGrid';
import ExpenseMobileList from '../components/expense_display/ExpenseMobileList';

export const ExpensesPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
      
      {isMobile && (
        <SpentSummaryCard />
      )}

      <ExpenseToolbar />
      
      <Box sx={{ display: 'flex', flexGrow: 1, flexDirection: 'column' }}>
        {isMobile ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <ExpenseMobileList />
          </Box>
        ) : (
          <ExpenseDataGrid />
        )}
      </Box>
    </Box>
  );
};

export default ExpensesPage;