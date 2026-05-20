import React from 'react';
import { Paper, Typography } from '@mui/material';

interface KpiCardProps {
  title: string;
  value: string | number;
}

export const KpiCard: React.FC<KpiCardProps> = ({ title, value }) => {
  return (
    <Paper 
      elevation={1} 
      sx={{ 
        p: 2, 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%', 
        borderRadius: 2,
        border: '1px solid #e0e0e0'
      }}
    >
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {title}
      </Typography>
      
      <Typography variant="h5" component="div" fontWeight="medium">
        {value}
      </Typography>
    </Paper>
  );
};

export default KpiCard;