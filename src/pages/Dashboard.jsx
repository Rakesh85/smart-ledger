import React, { useState, useMemo } from 'react';
import { useTransactions } from '../context/TransactionContext';
import Layout from '../components/Layout';
import SummaryCards from '../components/dashboard/SummaryCards';
import TransactionTable from '../components/dashboard/TransactionTable';
import Button from '../components/ui/Button';
import { Plus, Minus, ChevronUp, ChevronDown } from 'lucide-react';
import Modal from '../components/ui/Modal';
import TransactionForm from '../components/TransactionForm';
import CategoryForm from '../components/CategoryForm';

const Dashboard = () => {
    const { transactions, filter, updateFilter, deleteTransaction } = useTransactions();
    const [activeTab, setActiveTab] = useState('expense'); // Default to expense
    const [cardsExpanded, setCardsExpanded] = useState(true);

    // Modal State
    const [transactionModal, setTransactionModal] = useState({ open: false, type: 'income', editItem: null });
    const [categoryModalOpen, setCategoryModalOpen] = useState(false);

    // Filter Logic
    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            const date = new Date(t.date);
            const sameYear = date.getFullYear() === filter.year;

            if (!sameYear) return false;
            if (filter.month === 'all') return true;

            if (typeof filter.month === 'string' && filter.month.startsWith('q')) {
                const month = date.getMonth();
                const q = parseInt(filter.month.substring(1));
                const startMonth = (q - 1) * 3;
                const endMonth = startMonth + 2;
                return month >= startMonth && month <= endMonth;
            }

            return date.getMonth() === filter.month;
        });
    }, [transactions, filter]);

    const incomeTransactions = filteredTransactions.filter(t => t.type === 'income');
    const expenseTransactions = filteredTransactions.filter(t => t.type === 'expense');

    // Calculations
    const totalIncome = incomeTransactions.reduce((acc, t) => acc + Number(t.amount), 0);
    const totalExpense = expenseTransactions.reduce((acc, t) => acc + Number(t.amount), 0);
    const netBalance = totalIncome - totalExpense;

    const handleOpenTransaction = (type, item = null) => {
        setTransactionModal({ open: true, type, editItem: item });
    };

    const handleCloseTransaction = () => {
        setTransactionModal({ open: false, type: 'income', editItem: null });
    };

    return (
        <Layout
            onAddCategory={() => setCategoryModalOpen(true)}
            filter={filter}
            updateFilter={updateFilter}
        >
            <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1E293B' }}>Dashboard</h2>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCardsExpanded(!cardsExpanded)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem' }}
                    >
                        {cardsExpanded ? 'Collapse' : 'Expand'} Summary {cardsExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </Button>
                </div>

                {cardsExpanded && (
                    <SummaryCards
                        income={totalIncome}
                        expense={totalExpense}
                        balance={netBalance}
                    />
                )}
            </div>

            {/* Tabs - Expense first */}
            <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', borderBottom: '1px solid #E2E8F0' }}>
                <button
                    onClick={() => setActiveTab('expense')}
                    style={{
                        padding: '0.75rem 1.5rem',
                        borderBottom: activeTab === 'expense' ? '2px solid var(--color-primary)' : '2px solid transparent',
                        color: activeTab === 'expense' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                        fontWeight: 600,
                        transition: 'all 0.2s',
                        cursor: 'pointer',
                        background: 'none',
                        border: 'none',
                        fontSize: '1rem'
                    }}
                >
                    Expenses
                </button>
                <button
                    onClick={() => setActiveTab('income')}
                    style={{
                        padding: '0.75rem 1.5rem',
                        borderBottom: activeTab === 'income' ? '2px solid var(--color-primary)' : '2px solid transparent',
                        color: activeTab === 'income' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                        fontWeight: 600,
                        transition: 'all 0.2s',
                        cursor: 'pointer',
                        background: 'none',
                        border: 'none',
                        fontSize: '1rem'
                    }}
                >
                    Income
                </button>
            </div>

            <TransactionTable
                transactions={activeTab === 'income' ? incomeTransactions : expenseTransactions}
                type={activeTab}
                onDelete={deleteTransaction}
                onEdit={(item) => handleOpenTransaction(activeTab, item)}
            />

            {/* Floating Action Buttons - Colored and Icon only */}
            <div style={{
                position: 'fixed',
                bottom: '2.5rem',
                right: '2.5rem',
                display: 'flex',
                gap: '1rem',
                zIndex: 50
            }}>
                <Button
                    variant="primary"
                    onClick={() => handleOpenTransaction('expense')}
                    style={{
                        borderRadius: '50%',
                        width: '56px',
                        height: '56px',
                        padding: 0,
                        boxShadow: '0 4px 14px 0 rgba(239, 68, 68, 0.39)',
                        backgroundColor: '#EF4444',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    title="Add Expense"
                >
                    <Minus size={24} />
                </Button>
                <Button
                    variant="primary"
                    onClick={() => handleOpenTransaction('income')}
                    style={{
                        borderRadius: '50%',
                        width: '56px',
                        height: '56px',
                        padding: 0,
                        boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.39)',
                        backgroundColor: '#10B981',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    title="Add Income"
                >
                    <Plus size={24} />
                </Button>
            </div>

            {/* Modals */}
            <div style={{ position: 'relative', zIndex: 10000 }}>
                <Modal
                    isOpen={transactionModal.open}
                    onClose={handleCloseTransaction}
                    title={`${transactionModal.editItem ? 'Edit' : 'Add'} ${transactionModal.type === 'income' ? 'Income' : 'Expense'}`}
                >
                    <TransactionForm
                        type={transactionModal.type}
                        onClose={handleCloseTransaction}
                        editItem={transactionModal.editItem}
                    />
                </Modal>

                <Modal
                    isOpen={categoryModalOpen}
                    onClose={() => setCategoryModalOpen(false)}
                    title="Add New Category"
                >
                    <CategoryForm onClose={() => setCategoryModalOpen(false)} />
                </Modal>
            </div>

        </Layout>
    );
};

export default Dashboard;
