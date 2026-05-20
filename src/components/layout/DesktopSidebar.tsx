import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Wallet, PieChart } from 'lucide-react';

import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, Paper } from '@mui/material';

import SpentSummaryCard from '../statistics/SpentSummaryCard';
import { useI18n } from '../../i18n/useI18n';

export const DesktopSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useI18n();

  return (
    <Paper 
      elevation={0} 
      square
      sx={{ 
        width: 280, 
        flexShrink: 0, 
        borderRight: '1px solid #e0e0e0',
        display: 'flex',
        flexDirection: 'column',
        p: 2
      }}
    >
      <Box sx={{ mb: 3 }}>
        <SpentSummaryCard />
      </Box>

      <Divider sx={{ mb: 2 }} />

      <List>
        <ListItem disablePadding>
          <ListItemButton 
            selected={location.pathname === '/expenses'}
            onClick={() => navigate('/expenses')}
            sx={{ borderRadius: 1, mb: 1 }}
          >
            <ListItemIcon><Wallet /></ListItemIcon>
            <ListItemText primary={t('nav.expenses')} />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton 
            selected={location.pathname === '/statistics'}
            onClick={() => navigate('/statistics')}
            sx={{ borderRadius: 1 }}
          >
            <ListItemIcon><PieChart /></ListItemIcon>
            <ListItemText primary={t('nav.statistics')} />
          </ListItemButton>
        </ListItem>
      </List>
    </Paper>
  );
};

export default DesktopSidebar;