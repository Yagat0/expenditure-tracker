import React, { useState, useMemo, useCallback } from 'react';
import { X, Trash2, Utensils, Car, Home, Gamepad2, HeartPulse, CircleEllipsis, Receipt, ShoppingCart, Briefcase, Plane, Coffee, Pipette } from 'lucide-react';

import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography,
  Box, TextField, useMediaQuery, useTheme, IconButton, Divider, Stack,
  List, ListItem, ListItemText, ListItemIcon, MenuItem, Select, FormControl, InputLabel,
  Snackbar, Alert, type AlertColor
} from '@mui/material';

import { useSettings } from '../context/SettingsContext';
import { useExpenses } from '../context/ExpenseContext';
import { useI18n } from '../i18n/useI18n';
import { useAppState } from '../context/AppStateContext';
import type { Language } from '../types/settings';

// Mapování Lucide ikon na jejich názvy
const AvailableIcons: Record<string, React.ElementType> = {
  Utensils, Car, Home, Gamepad2, HeartPulse, CircleEllipsis, Receipt, ShoppingCart, Briefcase, Plane, Coffee
};

export const SettingsOverlay: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const { language, updateLanguage, categories, addCategory, removeCategory, updateCategory } = useSettings();
  const { isSettingsOpen, closeSettings } = useAppState();
  const { expenses } = useExpenses(); 
  const { t, supportedLanguages, getLanguageLabel } = useI18n();

  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('CircleEllipsis');
  const [newCatColor, setNewCatColor] = useState('#2196f3');
  const selectedLanguage = supportedLanguages.includes(language as string) ? language : supportedLanguages[0];

  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [pendingDeleteCategory, setPendingDeleteCategory] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: AlertColor }>({
    open: false,
    message: '',
    severity: 'info'
  }); // Snackbar pro alerty (mazání užívané kategorie, přidání existující kategorie)

  const handleSnackbarClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const showSnackbar = (message: string, severity: AlertColor) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCatNameChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    
    if (value.length > 28) {
      showSnackbar(t('settings.categoryNameLimit'), 'warning');
      // Ořízneme hodnotu na 28 znaků pro případ, že to uživatel vložil přes Ctrl+V
      setNewCatName(value.slice(0, 28));
    } else {
      setNewCatName(value);
    }
  };

  const handleAddCategory = () => {
    const trimmedName = newCatName.trim();
    if (!trimmedName) return;

    // Kategorie existuje
    if (categories.some(c => c.name.toLowerCase() === trimmedName.toLowerCase())) {
      showSnackbar(t('settings.categoryExists'), 'warning');
      return;
    }

    addCategory({ name: trimmedName, iconName: newCatIcon, color: newCatColor });
    setNewCatName(''); 
  };

  const handleRemoveCategoryClick = useCallback((catName: string) => {
    // Zkontrolujeme jestli je kategorie využívána
    const isUsed = expenses.some(e => e.category === catName);
    if (isUsed) {
      showSnackbar(t('settings.delete.usedText', { name: catName }), 'warning');
      return;
    }
    setPendingDeleteCategory(catName);
  }, [expenses, t]);

  const handleCloseDeleteCategoryDialog = () => {
    setPendingDeleteCategory(null);
  };

  const handleConfirmDeleteCategory = () => {
    if (!pendingDeleteCategory) return;
    removeCategory(pendingDeleteCategory);
    setPendingDeleteCategory(null);
  };

  const handleCategoryIconChange = useCallback((catName: string, iconName: string) => {
    updateCategory(catName, { iconName });
  }, [updateCategory]);

  const handleCategoryColorChange = useCallback((catName: string, color: string) => {
    updateCategory(catName, { color });
  }, [updateCategory]);

  const renderIconValue = useCallback((selected: string) => {
    const Icon = AvailableIcons[selected] || Receipt;
    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Icon size={20} />
      </Box>
    );
  }, []);

  // Ikony jsou vygenerovány právě jednou, ne při zadání každého písmene
  const renderedIconOptions = useMemo(() => {
    return Object.keys(AvailableIcons).map(iconKey => {
      const Icon = AvailableIcons[iconKey];
      return (
        <MenuItem key={iconKey} value={iconKey}>
          <Icon size={20} />
        </MenuItem>
      );
    });
  }, []);

  // Vykreslení listu kategorií nezávisle na psaní textu zabrání rerenderu
  const renderedCategories = useMemo(() => {
    return categories.map((cat) => {
      const IconComponent = AvailableIcons[cat.iconName] || Receipt;
      return (
        <ListItem 
          key={cat.name}
          secondaryAction={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FormControl size="small" sx={{ minWidth: '72px' }}>
                <Select
                  value={cat.iconName}
                  onChange={(e) => handleCategoryIconChange(cat.name, e.target.value as string)}
                  renderValue={(selected) => renderIconValue(String(selected))}
                >
                  {renderedIconOptions}
                </Select>
              </FormControl>

              {/* Color picker pro výběr barvy */}
              <Box sx={{ position: 'relative', height: '32px', width: '32px', flexShrink: 0 }}>
                {/* HTML input zajišťuje klikatelnou plochu */}
                <Box
                  component="input"
                  type="color"
                  value={cat.color || '#9e9e9e'}
                  onChange={(e) => handleCategoryColorChange(cat.name, e.target.value)}
                  title={t('settings.colorTitle')}
                  sx={{ 
                    height: '100%', width: '100%', padding: 0, 
                    border: 'none', borderRadius: '4px', cursor: 'pointer',
                    background: 'transparent',
                    // Fix pro Safari/Chrome native color pickery
                    '&::-webkit-color-swatch-wrapper': { p: 0 },
                    '&::-webkit-color-swatch': { border: 'none', borderRadius: '4px' },
                    '&::-moz-color-swatch': { border: 'none', borderRadius: '4px' }
                  }}
                />
                {/* Vizuální překrytí ikonou pipety */}
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0, // t,b,l,r: 0
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pointerEvents: 'none' // Proklik přes ikonu
                  }}
                >
                  {/* Průhledné bílé kolečko s pipetou */}
                  <Box
                    sx={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'rgba(255, 255, 255, 0.78)',
                      border: '1px solid rgba(0, 0, 0, 0.2)',
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
                      color: 'rgba(0, 0, 0, 0.75)'
                    }}
                  >
                    <Pipette size={12} />
                  </Box>
                </Box>
              </Box>

              {/* Tlačítko pro odstranění kategorie*/}
              <IconButton edge="end" color="error" onClick={() => handleRemoveCategoryClick(cat.name)}>
                <Trash2 size={20} />
              </IconButton>
            </Box>
          }
        >
          <ListItemIcon sx={{ color: cat.color || '#9e9e9e' }}>
            <IconComponent size={24} />
          </ListItemIcon>
          <ListItemText primary={cat.name} />
        </ListItem>
      );
    });
  }, [categories, handleRemoveCategoryClick, handleCategoryIconChange, handleCategoryColorChange, renderIconValue, renderedIconOptions, t]);

  return (
    <>
      <Dialog 
        open={isSettingsOpen} 
        onClose={closeSettings} 
        fullScreen={isMobile}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" component="div" fontWeight="bold">{t('settings.title')}</Typography>
          <IconButton onClick={closeSettings} size="small"><X /></IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={4}>
            
            {/* Obecná nastavení */}
            <Box>
              <Typography variant="subtitle2" color="primary" fontWeight="bold" gutterBottom sx={{mb: 1}}>
                {t('settings.general')}
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <FormControl size="small" fullWidth>
                  <InputLabel>{t('settings.languageLabel')}</InputLabel>
                  <Select
                    value={selectedLanguage}
                    label={t('settings.languageLabel')}
                    onChange={(e) => updateLanguage(e.target.value as Language)}
                  >
                    {supportedLanguages.map((code) => (
                      <MenuItem key={code} value={code}>
                        {getLanguageLabel(code)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            </Box>

            <Divider />

            {/* Nastavení kategorií */}
            <Box>
              <Typography variant="subtitle2" color="primary" fontWeight="bold" gutterBottom>
                {t('settings.categoriesSection')}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1, mb: 3, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <TextField 
                  size="small" label={t('settings.newCategory')} 
                  value={newCatName} 
                  onChange={handleCatNameChange}
                  slotProps={{ htmlInput: { maxLength: 29 } }} // 29, aby handler stihl zachytit překročení a vyhodit snackbar
                  sx={{ flexGrow: 1, minWidth: '150px' }}
                />
                
                {/* Výběr ikony nové kategorie */}
                <FormControl size="small" sx={{ minWidth: '80px' }}>
                  <Select 
                    value={newCatIcon} 
                    onChange={(e) => setNewCatIcon(e.target.value)}
                    renderValue={(selected) => renderIconValue(String(selected))}
                  >
                    {renderedIconOptions}
                  </Select>
                </FormControl>

                {/* Color picker pro změnu barvy */}
                <Box sx={{ position: 'relative', height: '40px', width: '40px', flexShrink: 0 }}>
                  {/* HTML input zajišťuje klikatelnou plochu */}
                  <Box
                    component="input"
                    type="color"
                    value={newCatColor}
                    onChange={(e) => setNewCatColor(e.target.value)}
                    title={t('settings.colorTitle')}
                    sx={{ 
                      height: '100%', width: '100%', padding: 0, 
                      border: 'none', borderRadius: '4px', cursor: 'pointer',
                      background: 'transparent',
                      // Fix pro Safari/Chrome native color pickery
                      '&::-webkit-color-swatch-wrapper': { p: 0 },
                      '&::-webkit-color-swatch': { border: 'none', borderRadius: '4px' },
                      '&::-moz-color-swatch': { border: 'none', borderRadius: '4px' }
                    }}
                  />
                  {/* Vizuální překrytí ikonou pipety */}
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0, // t,b,l,r: 0
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      pointerEvents: 'none' // Proklik přes ikonu
                    }}
                  >
                    {/* Průhledné bílé kolečko s pipetou */}
                    <Box
                      sx={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(255, 255, 255, 0.78)',
                        border: '1px solid rgba(0, 0, 0, 0.2)',
                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
                        color: 'rgba(0, 0, 0, 0.75)'
                      }}
                    >
                      <Pipette size={14} />
                    </Box>
                  </Box>
                </Box>

                <Button variant="contained" onClick={handleAddCategory} disabled={!newCatName.trim()} sx={{ height: '40px' }}>
                  {t('common.add')}
                </Button>
              </Box>

              <List sx={{ bgcolor: '#fafafa', borderRadius: 2, border: '1px solid #eee' }}>
                {renderedCategories}
              </List>
            </Box>
            <Box>
              <Button variant="outlined" onClick={() => setIsAboutOpen(true)}>
                {t('settings.aboutButton')}
              </Button>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={closeSettings} variant="contained">{t('common.done')}</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={pendingDeleteCategory !== null}
        onClose={handleCloseDeleteCategoryDialog}
        maxWidth="xs"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle sx={{ fontWeight: 'bold', color: 'error.main' }}>
          {t('settings.delete.deleteTitle')}
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body1">
            {t('settings.delete.confirmText', { name: pendingDeleteCategory ?? '' })}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDeleteCategoryDialog} color="inherit">
            {t('common.cancel')}
          </Button>
          <Button onClick={handleConfirmDeleteCategory} variant="contained" color="error">
            {t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar notifikace */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* O aplikaci */}
      <Dialog
        open={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
        maxWidth="xs"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" component="div" fontWeight="bold">
            {t('settings.aboutTitle')}
          </Typography>
          <IconButton onClick={() => setIsAboutOpen(false)} size="small"><X /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                {t('settings.aboutAuthorLabel')}
              </Typography>
              <Typography variant="body1">Ondřej Fiala</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                {t('settings.aboutStudentLabel')}
              </Typography>
              <Typography variant="body1">A25B0236P</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                {t('settings.aboutPurposeLabel')}
              </Typography>
              <Typography variant="body1">{t('settings.aboutPurposeText')}</Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setIsAboutOpen(false)} variant="contained">
            {t('common.done')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SettingsOverlay;