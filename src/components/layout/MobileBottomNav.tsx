import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Wallet, PieChart, Plus } from 'lucide-react';

import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';

import { useAppState } from '../../context/AppStateContext';
import { useI18n } from '../../i18n/useI18n';

export const MobileBottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { openWizard } = useAppState();
  const { t } = useI18n();

  return (
    <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000 }} elevation={3}>
      <BottomNavigation
        showLabels
        value={location.pathname}
        onChange={(_, newValue) => {
          if (newValue === 'add') {
            // Neroutujeme nikam
            return;
          } else {
            navigate(newValue);
          }
        }}
      >
        <BottomNavigationAction label={t('nav.expenses')} value="/expenses" icon={<Wallet size={24} />} />
        
        <BottomNavigationAction 
          label={t('nav.add')} 
          value="add" 
          onClick={ () => openWizard() }
          icon={<Plus size={28} color="#1976d2" />} 
          sx={{ '& .MuiBottomNavigationAction-label': { color: '#1976d2' } }}
        />
        
        <BottomNavigationAction label={t('nav.statistics')} value="/statistics" icon={<PieChart size={24} />} />
      </BottomNavigation>
    </Paper>
  );
};

export default MobileBottomNav;