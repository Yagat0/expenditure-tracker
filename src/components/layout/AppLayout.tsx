import React from 'react';

import { Box, useMediaQuery, useTheme } from '@mui/material';

import AppHeader from './AppHeader';
import DesktopSidebar from './DesktopSidebar';
import MobileBottomNav from './MobileBottomNav';
import DesktopFooter from './DesktopFooter';
import AddExpenseWizard from '../AddExpenseWizard';
import { useExpenses } from '../../context/ExpenseContext';
import { DeleteConfirmDialog } from '../expense_display/DeleteConfirmDialog';
import SettingsOverlay from '../SettingsOverlay';
import { useAppState } from '../../context/AppStateContext';

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const theme = useTheme();
  // md = <900px na šířku
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const { 
    isWizardOpen, 
    closeWizard, 
    expenseToEdit, 
    deleteExpenseTarget, 
    closeDeleteExpenseDialog 
  } = useAppState();
  
  const { deleteExpense } = useExpenses();

  const handleConfirmDelete = (deleteAllFuture: boolean) => {
    if (deleteExpenseTarget) {
      deleteExpense(deleteExpenseTarget.uuid, deleteAllFuture);
      closeDeleteExpenseDialog();
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppHeader isMobile={isMobile} />
      
      <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
        {/* Sidebar jen na desktopu */}
        {!isMobile && <DesktopSidebar />}
        
        {/* Hlavní obsah */}
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1, 
            p: 2, 
            pb: isMobile ? 8 : 2, // Místo dole pro BottomNav na mobilu
            overflowY: 'auto' 
          }}
        >
          {children}
        </Box>
      </Box>

      {/* Patičky a spodní navigace */}
      {isMobile ? <MobileBottomNav /> : <DesktopFooter />}
      
      <AddExpenseWizard 
        open={isWizardOpen} 
        onClose={closeWizard} 
        expenseToEdit={expenseToEdit} 
      />

      <DeleteConfirmDialog 
        open={deleteExpenseTarget !== null}
        isRecurring={deleteExpenseTarget?.isRecurring || false}
        onClose={closeDeleteExpenseDialog}
        onConfirm={handleConfirmDelete}
      />

      <SettingsOverlay />
    </Box>
  );
};

export default AppLayout;