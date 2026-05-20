import React, { useRef, useState } from 'react';
import { 
  AppBar, Toolbar, Typography, Button, IconButton, Box, 
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions 
} from '@mui/material';
import { Settings, AlertTriangle } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { useI18n } from '../../i18n/useI18n';
import { useAppState } from '../../context/AppStateContext';

interface AppHeaderProps {
  isMobile: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ isMobile }) => {
  const { exportAllData, importAllData } = useSettings();
  const { openSettings } = useAppState();
  const { t } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPendingFile(file);
      setIsImportDialogOpen(true);
    }
    event.target.value = ''; // Reset inputu nutný pro možnost znovuvybrání stejného souboru
  };

  const confirmImport = () => {
    if (pendingFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (content) {
          const success = importAllData(content);
          if (!success) alert(t('header.importInvalid'));
        }
      };
      reader.readAsText(pendingFile); // Zde se rozběhne reader
    }
    setIsImportDialogOpen(false);
    setPendingFile(null);
  };

  const cancelImport = () => {
    setIsImportDialogOpen(false);
    setPendingFile(null);
  };

  return (
    <>
      <AppBar position="sticky" color="inherit" elevation={1}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            {t('header.title')}
          </Typography>

          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 1, mr: 2 }}>
              <Button variant="outlined" size="small" onClick={exportAllData}>
                {t('header.exportJson')}
              </Button>

              <Button variant="outlined" size="small" color="error" onClick={handleImportClick}>
                {t('header.importJson')}
              </Button>
              <input
                type="file"
                accept=".json"
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={handleFileChange}
              />
            </Box>
          )}

          <IconButton color="inherit" onClick={() => { openSettings() }}>
            <Settings size={24} />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Varovný dialog před destruktivním importem */}
      <Dialog open={isImportDialogOpen} onClose={cancelImport}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
          <AlertTriangle size={24} />
          {t('header.importDialog.title')}
        </DialogTitle>
        <DialogContent dividers>
          <DialogContentText>
            {t('header.importDialog.fileIntro')} <strong>{pendingFile?.name}</strong>.
            <br /><br />
            {t('header.importDialog.warning')}
            <br /><br />
            {t('header.importDialog.confirm')}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={cancelImport} color="inherit">
            {t('common.cancel')}
          </Button>
          <Button onClick={confirmImport} color="error" variant="contained">
            {t('header.importDialog.confirmButton')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AppHeader;