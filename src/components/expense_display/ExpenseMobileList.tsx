import React from 'react';

import { ChevronDown, Pencil, Trash2, Utensils, Car, Home, Gamepad2, HeartPulse, CircleEllipsis, Receipt, ShoppingCart, Briefcase, Plane, Coffee } from 'lucide-react';

import { Box, Typography, Accordion, AccordionSummary, AccordionDetails, IconButton, Divider, Stack } from '@mui/material';

import { useFilteredExpenses } from '../../context/ExpenseContext';
import { useSettings } from '../../context/SettingsContext';
import { useAppState } from '../../context/AppStateContext';
import { useI18n } from '../../i18n/useI18n';
import { getRecurrenceLabel } from '../../i18n/translations';
import type { RecurrenceType } from '../../types/common';
import type { Expense } from '../../types/expense';

// Mapování stringových názvů z nastavení na Lucide komponenty
const IconMap: Record<string, React.ElementType> = {
  Utensils, Car, Home, Gamepad2, HeartPulse, CircleEllipsis, Receipt, ShoppingCart, Briefcase, Plane, Coffee
};

export const ExpenseMobileList: React.FC = () => {
  const { openWizard, openDeleteExpenseDialog } = useAppState();
  const { categories, defaultCurrency } = useSettings();
  const { t, language, formatDate, formatNumber } = useI18n();

  const filteredExpenses = useFilteredExpenses();

  const handleEditClick = (expense: Expense) => (e: React.MouseEvent) => {
    e.stopPropagation(); // Zabrání rozbalení/sbalení Accordionu při kliku na tlačítko
    openWizard(expense);
  };

  const handleDeleteClick = (uuid: string, hasRecurrence: boolean) => (e: React.MouseEvent) => {
    e.stopPropagation(); // Zabrání rozbalení/sbalení Accordionu
    openDeleteExpenseDialog(uuid, hasRecurrence);
  };

  if (filteredExpenses.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
        <Typography variant="body1">{t('expense.emptyList')}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 2 }}>
      {filteredExpenses.map((expense) => {
        // Najdeme kategorii v nastavení, abychom zjistili barvu a ikonu
        const categoryConfig = categories.find(c => c.name === expense.category);
        const IconComponent = categoryConfig?.iconName && IconMap[categoryConfig.iconName] 
          ? IconMap[categoryConfig.iconName] 
          : Receipt; // Výchozí ikona, pokud se nenajde
        
        const iconColor = categoryConfig?.color || '#9e9e9e';
        const hasRecurrence = expense.recurrence !== 'none';
        
        // Zobrazení názvu v hlavičce: Preferujeme místo, jinak fallback na kategorii
        const mainTitle = expense.location || expense.category;

        return (
          <Accordion 
            key={expense.uuid}
            disableGutters
            elevation={1}
            sx={{
              mb: 1.5, // Mezera mezi bublinami
              borderRadius: '12px !important', // Vynucené zakulacení
              border: '1px solid #e0e0e0',
              overflow: 'hidden'
            }}
          >
            {/* Hlavička bubliny (viditelná vždy) */}
            <AccordionSummary expandIcon={<ChevronDown />} sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2 }}>
                
                {/* Ikona */}
                <Box sx={{ 
                  backgroundColor: `${iconColor}20`, // 20 je hex pro průhlednost
                  p: 1.5, 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: iconColor
                }}>
                  <IconComponent size={24} />
                </Box>

                {/* Texty: Místo a Datum */}
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ lineHeight: 1.2 }}>
                    {mainTitle}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(expense.date, { dateStyle: 'short', timeStyle: 'short' })}
                  </Typography>
                </Box>

                {/* Částka */}
                <Typography variant="subtitle1" fontWeight="bold" color="error.main">
                  {formatNumber(expense.amount)} {defaultCurrency}
                </Typography>
                
              </Box>
            </AccordionSummary>

            {/* Detaily bubliny (lze rozbalit)*/}
            <AccordionDetails sx={{ p: 2, pt: 0, backgroundColor: '#fafafa' }}>
              <Divider sx={{ mb: 2 }} />
              
              <Stack spacing={1} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">{t('expense.category')}</Typography>
                  <Typography variant="body2" fontWeight="medium">{expense.category}</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">{t('expense.recurrence')}</Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {getRecurrenceLabel(language, expense.recurrence as RecurrenceType) || expense.recurrence}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">{t('expense.location')}</Typography>
                  <Typography variant="body2" fontWeight="medium">{expense.location || '-'}</Typography>
                </Box>

                {expense.note && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">{t('expense.note')}</Typography>
                    <Typography variant="body2" fontWeight="medium" textAlign="right">
                      {expense.note}
                    </Typography>
                  </Box>
                )}
              </Stack>

              {/* Tlačítka akcí */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <IconButton 
                  size="small" 
                  color="primary" 
                  onClick={handleEditClick(expense)}
                >
                  <Pencil size={20} />
                </IconButton>
                <IconButton 
                  size="small" 
                  color="error"
                  onClick={handleDeleteClick(expense.uuid, hasRecurrence)}
                >
                  <Trash2 size={20} />
                </IconButton>
              </Box>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );
};

export default ExpenseMobileList;