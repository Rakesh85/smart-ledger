import React from 'react';
import { TransactionProvider, useTransactions } from './context/TransactionContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import ChartAnalytics from './pages/ChartAnalytics';
import CategoryManager from './pages/CategoryManager';
import LoginPage from './pages/LoginPage';

const AppContent = () => {
  const { activeView, loading: transactionsLoading } = useTransactions();
  const { user, loading: authLoading } = useAuth();

  if (authLoading || (user && transactionsLoading)) {
    return (
      <div style={{
        display: 'flex',
        height: '100vh',
        width: '100vw',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '1rem',
        color: 'var(--color-text-secondary)',
        fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif'
      }}>
        <div className="animate-spin" style={{
          width: '2.5rem',
          height: '2.5rem',
          border: '3px solid #E2E8F0',
          borderTopColor: 'var(--color-primary)',
          borderRadius: '50%'
        }}></div>
        <p>Loading your ledger...</p>
        <style>{`
          .animate-spin {
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

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
    <AuthProvider>
      <TransactionProvider>
        <AppContent />
      </TransactionProvider>
    </AuthProvider>
  );
}

export default App;
