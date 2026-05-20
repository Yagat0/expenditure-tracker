import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { ExpenseProvider } from './context/ExpenseContext';
import { SettingsProvider } from './context/SettingsContext';
import { AppLayout } from './components/layout/AppLayout';
import ExpensesPage from './pages/ExpensesPage';
import StatisticsPage from './pages/StatisticsPage';
import { AppStateProvider } from './context/AppStateContext';

import { CssBaseline } from '@mui/material'; // style reset

export const App = () => {
  return (
    <AppStateProvider>
      <SettingsProvider>
          <ExpenseProvider>
            <BrowserRouter>
              <CssBaseline/>
                <AppLayout>
                  <Routes>
                    <Route path="/" element={<Navigate to="/expenses" replace />} />
                    <Route path="/expenses" element={<ExpensesPage />} />
                    <Route path="/statistics" element={<StatisticsPage />} />
                  </Routes>
                </AppLayout>
            </BrowserRouter>
          </ExpenseProvider>
      </SettingsProvider>
    </AppStateProvider>
  );
};

export default App;