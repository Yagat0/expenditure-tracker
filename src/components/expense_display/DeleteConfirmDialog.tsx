import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, Typography, RadioGroup, FormControlLabel, Radio, Box } from '@mui/material';
import { useI18n } from '../../i18n/useI18n';

interface DeleteConfirmDialogProps {
  open: boolean;
  isRecurring: boolean;
  onClose: () => void;
  onConfirm: (deleteAllFuture: boolean) => void;
}

export const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({ open, isRecurring, onClose, onConfirm }) => {
  const [deleteMode, setDeleteMode] = useState<'single' | 'future'>('single');
  const { t } = useI18n();

  // Vynulování volby při každém otevření dialogu
  useEffect(() => {
    if (open) setDeleteMode('single');
  }, [open]);

  const handleConfirm =() => {
    onConfirm(deleteMode === 'future');
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold', color: 'error.main' }}>
        {t('expense.delete.title')}
      </DialogTitle>
      
      <DialogContent dividers>
        <Typography variant="body1">
          {t('expense.delete.confirmText')}
        </Typography>

        {isRecurring && (
          <Box sx={{ mt: 3, p: 2, bgcolor: '#fff5f5', borderRadius: 2, border: '1px solid #ffcdd2' }}>
            <Typography variant="subtitle2" color="error.dark" sx={{ mb: 1 }}>
              {t('expense.delete.recurringNotice')}
            </Typography>
            <RadioGroup 
              value={deleteMode} 
              onChange={(e) => setDeleteMode(e.target.value as 'single' | 'future')}
            >
              <FormControlLabel 
                value="single" 
                control={<Radio color="error" />} 
                label={t('expense.delete.onlyThis')} 
              />
              <FormControlLabel 
                value="future" 
                control={<Radio color="error" />} 
                label={t('expense.delete.allFuture')} 
              />
            </RadioGroup>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">
          {t('common.cancel')}
        </Button>
        <Button onClick={handleConfirm} variant="contained" color="error">
          {t('common.delete')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};