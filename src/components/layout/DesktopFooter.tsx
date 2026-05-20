import React from 'react';
import { Box, Typography } from '@mui/material';

export const DesktopFooter: React.FC = () => {
  return (
    <Box 
      component="footer" 
      sx={{ 
        py: 2, 
        textAlign: 'center', 
        borderTop: '1px solid #e0e0e0',
        backgroundColor: '#f9f9f9',
        mt: 'auto' // Footer se natlačí dolu
      }}
    >
      <Typography variant="body2" color="text.secondary">
        Ondřej Fiala (A25B0236P)
      </Typography>
    </Box>
  );
};

export default DesktopFooter;