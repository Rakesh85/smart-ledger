import React, { createContext, useContext, useEffect, useState } from 'react';
import { generateId } from '../utils/formatters';

const TransactionContext = createContext();

const LOCAL_STORAGE_KEYS = {
    TRANSACTIONS: 'smart_ledger_transactions',
    CATEGORIES: 'smart_ledger_categories',
    LOGS: 'smart_ledger_logs'
};

const CATEGORY_COLORS = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#EC4899', '#06B6D4', '#6366F1', '#F97316', '#14B8A6'
];

const DEFAULT_CATEGORIES = [
    { id: '1', name: 'Salary', type: 'income', subCategory: '', notes: 'Monthly Income', color: '#10B981' },
    { id: '2', name: 'Food', type: 'expense', subCategory: '', notes: 'Groceries and Dining', color: '#F59E0B' },
    { id: '3', name: 'Transport', type: 'expense', subCategory: '', notes: 'Fuel and Commute', color: '#3B82F6' },
    { id: '4', name: 'Utilities', type: 'expense', subCategory: '', notes: 'Bills', color: '#EF4444' },
    { id: '5', name: 'Shopping', type: 'expense', subCategory: '', notes: 'Lifestyle', color: '#EC4899' }
];

export const TransactionProvider = ({ children }) => {
    const [transactions, setTransactions] = useState(() => {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.TRANSACTIONS);
        return stored ? JSON.parse(stored) : [];
    });

    const [categories, setCategories] = useState(() => {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.CATEGORIES);
        return stored ? JSON.parse(stored) : DEFAULT_CATEGORIES;
    });

    const [logs, setLogs] = useState(() => {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.LOGS);
        return stored ? JSON.parse(stored) : [];
    });

    const [activeView, setActiveView] = useState('dashboard'); // 'dashboard' | 'charts' | 'categories'
    const [filter, setFilter] = useState({
        period: 'monthly',
        year: new Date().getFullYear(),
        month: new Date().getMonth()
    });

    useEffect(() => {
        localStorage.setItem(LOCAL_STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    }, [transactions]);

    useEffect(() => {
        localStorage.setItem(LOCAL_STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    }, [categories]);

    useEffect(() => {
        localStorage.setItem(LOCAL_STORAGE_KEYS.LOGS, JSON.stringify(logs));
    }, [logs]);

    // Actions
    const addLog = (message) => {
        setLogs(prev => [{
            id: generateId(),
            timestamp: new Date().toISOString(),
            message
        }, ...prev]);
    };

    const addTransaction = (data) => {
        const newTransaction = {
            id: generateId(),
            createdAt: new Date().toISOString(),
            ...data
        };
        setTransactions((prev) => [newTransaction, ...prev]);
    };

    const addBulkTransactions = (items) => {
        const enrichedItems = items.map(item => ({
            id: generateId(),
            createdAt: new Date().toISOString(),
            ...item
        }));
        setTransactions((prev) => [...enrichedItems, ...prev]);
        addLog(`Bulk imported ${items.length} transactions`);
    };

    const deleteTransaction = (id) => {
        const tx = transactions.find(t => t.id === id);
        setTransactions((prev) => prev.filter((t) => t.id !== id));
        if (tx) {
            addLog(`Deleted transaction: ${tx.details} (${tx.amount})`);
        }
    };

    const updateTransaction = (id, updatedData) => {
        setTransactions((prev) =>
            prev.map((t) => (t.id === id ? { ...t, ...updatedData } : t))
        );
        addLog(`Modified transaction: ${updatedData.details || id}`);
    };

    const addCategory = (category) => {
        const colorIndex = categories.length % CATEGORY_COLORS.length;
        const newCategory = {
            id: generateId(),
            color: CATEGORY_COLORS[colorIndex],
            ...category
        };
        setCategories((prev) => [...prev, newCategory]);
    };

    const ensureCategoriesExist = (categoryList) => {
        setCategories(prev => {
            let updatedCategories = [...prev];
            let addedCount = 0;

            categoryList.forEach(item => {
                const exists = updatedCategories.find(c =>
                    c.name.toLowerCase() === item.name.toLowerCase()
                );

                if (!exists) {
                    const colorIndex = updatedCategories.length % CATEGORY_COLORS.length;
                    updatedCategories.push({
                        id: generateId(),
                        name: item.name,
                        type: item.type,
                        color: CATEGORY_COLORS[colorIndex],
                        subCategory: '',
                        notes: 'Automatically added during import'
                    });
                    addedCount++;
                }
            });

            if (addedCount > 0) {
                addLog(`Auto-added ${addedCount} new categories from import`);
            }
            return updatedCategories;
        });
    };

    const deleteCategory = (id) => {
        const cat = categories.find(c => c.id === id);
        setCategories((prev) => prev.filter((c) => c.id !== id));
        if (cat) addLog(`Deleted category: ${cat.name}`);
    };

    const updateCategory = (id, updatedData) => {
        setCategories((prev) =>
            prev.map((c) => (c.id === id ? { ...c, ...updatedData } : c))
        );
        addLog(`Modified category: ${updatedData.name || id}`);
    };

    const updateFilter = (newFilter) => {
        setFilter((prev) => ({ ...prev, ...newFilter }));
    };

    const getFilterLabel = () => {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        if (filter.month === 'all') return `All Months ${filter.year}`;
        if (typeof filter.month === 'string' && filter.month.startsWith('q')) {
            const q = filter.month.substring(1);
            return `${q}${q === '1' ? 'st' : q === '2' ? 'nd' : q === '3' ? 'rd' : 'th'} Quarter ${filter.year}`;
        }
        return `${months[filter.month]} ${filter.year}`;
    };

    const value = {
        transactions,
        categories,
        logs,
        filter,
        activeView,
        setActiveView,
        addTransaction,
        addBulkTransactions,
        deleteTransaction,
        updateTransaction,
        addCategory,
        deleteCategory,
        updateCategory,
        updateFilter,
        getFilterLabel,
        ensureCategoriesExist,
        getCategoryColor: (name) => {
            const cat = categories.find(c => c.name === name);
            return cat ? cat.color : '#94A3B8';
        }
    };

    return (
        <TransactionContext.Provider value={value}>
            {children}
        </TransactionContext.Provider>
    );
};

export const useTransactions = () => {
    const context = useContext(TransactionContext);
    if (!context) {
        throw new Error('useTransactions must be used within a TransactionProvider');
    }
    return context;
};
