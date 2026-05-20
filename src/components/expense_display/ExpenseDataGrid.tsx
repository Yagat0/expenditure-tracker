import React, { useMemo, useCallback } from 'react';
import { Box, Typography } from '@mui/material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import { Pencil, Trash2 } from 'lucide-react';

import { useFilteredExpenses } from '../../context/ExpenseContext';
import { useAppState } from '../../context/AppStateContext';
import { useSettings } from '../../context/SettingsContext';
import { useI18n } from '../../i18n/useI18n';
import { getRecurrenceShortLabel } from '../../i18n/translations';
import type { RecurrenceType } from '../../types/common';

const CustomNoRowsOverlay = () => {
  const { t } = useI18n();
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <Typography variant="body1" color="text.secondary">
        {t('expense.emptyList')}
      </Typography>
    </Box>
  );
};

export const ExpenseDataGrid: React.FC = () => {
  const { openWizard, openDeleteExpenseDialog } = useAppState();
  const { defaultCurrency } = useSettings();
  const { t, language, formatDate, formatNumber, muiLocaleText } = useI18n();

  const filteredExpenses = useFilteredExpenses();

  const columns: GridColDef[] = useMemo(() => [
    { 
      field: 'date', 
      headerName: t('expense.dateTime'), 
      type: 'date', 
      width: 160, 
      valueGetter: (value) => new Date(value),
      valueFormatter: (value: Date) => formatDate(value, { dateStyle: 'short', timeStyle: 'short' }),
    },
    { 
      field: 'category', 
      headerName: t('expense.category'), 
      type: 'string', width: 150 
    },
    { 
      field: 'location', 
      headerName: t('expense.location'), 
      type: 'string', width: 150 
    },
    { 
      field: 'amount', 
      headerName: t('expense.amount'), 
      width: 120, 
      type: 'number',
      valueFormatter: (value: number) => `${formatNumber(value)} ${defaultCurrency}`
    },
    { 
      field: 'recurrence', 
      headerName: t('expense.recurrence'), 
      width: 120,
      valueGetter: (value) => getRecurrenceShortLabel(language, value as RecurrenceType) || value
    },
    { 
      field: 'note', 
      headerName: t('expense.note'), 
      flex: 1, 
      minWidth: 200 
    },
    {
    field: 'actions',
    type: 'actions',
    headerName: t('expense.actions'),
    width: 100,
    getActions: ({ id, row }) => {
      const hasRecurrence = row.recurrence !== 'none';
      return [
        <GridActionsCellItem
          key="edit"
          icon={<Pencil size={18} />}
          label={t('common.edit')}
          // Logika hozená přímo sem, žádný find, žádný callback nahoře
          onClick={() => openWizard(row)} 
        />,
        <GridActionsCellItem
          key="delete"
          icon={<Trash2 size={18} color="#d32f2f" />}
          label={t('common.delete')}
          // Logika hozená přímo sem
          onClick={() => openDeleteExpenseDialog(id as string, hasRecurrence)}
        />,
      ];
    },
  },
], [t, formatDate, formatNumber, defaultCurrency, language, openWizard, openDeleteExpenseDialog]);

  return (
    <Box sx={{ width: '100%', height: '100%', minHeight: 400, backgroundColor: '#fff' }}>
      <DataGrid
        rows={filteredExpenses}
        columns={columns}
        getRowId={(row) => row.uuid}
        disableRowSelectionOnClick
        slots={{ noRowsOverlay: CustomNoRowsOverlay }}
        localeText={muiLocaleText.dataGrid}
        initialState={{
          pagination: { paginationModel: { pageSize: 10 } },
          sorting: { sortModel: [{ field: 'date', sort: 'desc' }] }
        }}
        pageSizeOptions={[10, 25, 50]}
        sx={{
          border: '1px solid #e0e0e0',
          borderRadius: 2,
          '& .MuiDataGrid-columnHeaders': { backgroundColor: '#f5f5f5' }
        }}
      />
    </Box>
  );
};

export default ExpenseDataGrid;