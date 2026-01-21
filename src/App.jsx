import React from 'react';
import { TransactionProvider, useTransactions } from './context/TransactionContext';
import Dashboard from './pages/Dashboard';
import ChartAnalytics from './pages/ChartAnalytics';
import CategoryManager from './pages/CategoryManager';

const AppContent = () => {
  const { activeView } = useTransactions();

  return (
    <>
      {activeView === 'dashboard' && <Dashboard />}
      {activeView === 'charts' && <ChartAnalytics />}
      {activeView === 'categories' && <CategoryManager />}
    </>
  );
};

function App() {
  return (
    <TransactionProvider>
      <AppContent />
    </TransactionProvider>
  );
}

export default App;
