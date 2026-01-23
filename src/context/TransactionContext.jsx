import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const TransactionContext = createContext();

const CATEGORY_COLORS = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#EC4899', '#06B6D4', '#6366F1', '#F97316', '#14B8A6'
];

export const TransactionProvider = ({ children }) => {
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const [activeView, setActiveView] = useState('dashboard');
    const [filter, setFilter] = useState({
        period: 'monthly',
        year: new Date().getFullYear(),
        month: new Date().getMonth()
    });

    // Helper to map DB row to JS object
    const mapTransaction = (t) => ({
        ...t,
        subCategory: t.sub_category,
        createdAt: t.created_at
    });

    const mapCategory = (c) => ({
        ...c,
        subCategory: c.sub_category
    });

    // Fetch data from Supabase
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [txData, catData, logData] = await Promise.all([
                    supabase.from('transactions').select('*').order('created_at', { ascending: false }),
                    supabase.from('categories').select('*'),
                    supabase.from('logs').select('*').order('timestamp', { ascending: false }).limit(20)
                ]);

                if (txData.error) throw txData.error;
                if (catData.error) throw catData.error;
                if (logData.error) throw logData.error;

                setTransactions((txData.data || []).map(mapTransaction));
                setCategories((catData.data || []).map(mapCategory));
                setLogs(logData.data || []);
            } catch (error) {
                console.error('Error fetching data:', error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Real-time synchronization
    useEffect(() => {
        const txSubscription = supabase
            .channel('public:transactions')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, payload => {
                if (payload.eventType === 'INSERT') {
                    setTransactions(prev => [mapTransaction(payload.new), ...prev]);
                } else if (payload.eventType === 'UPDATE') {
                    setTransactions(prev => prev.map(t => t.id === payload.new.id ? mapTransaction(payload.new) : t));
                } else if (payload.eventType === 'DELETE') {
                    setTransactions(prev => prev.filter(t => t.id === payload.old.id));
                }
            })
            .subscribe();

        const catSubscription = supabase
            .channel('public:categories')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, payload => {
                if (payload.eventType === 'INSERT') {
                    setCategories(prev => [...prev, mapCategory(payload.new)]);
                } else if (payload.eventType === 'UPDATE') {
                    setCategories(prev => prev.map(c => c.id === payload.new.id ? mapCategory(payload.new) : c));
                } else if (payload.eventType === 'DELETE') {
                    setCategories(prev => prev.filter(c => c.id === payload.old.id));
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(txSubscription);
            supabase.removeChannel(catSubscription);
        };
    }, []);

    // Actions
    const addLog = async (message) => {
        await supabase
            .from('logs')
            .insert([{ message }]);

        // Logs are short-lived in the UI, we don't necessarily need real-time for them but we could
        setLogs(prev => [{ id: Math.random().toString(), timestamp: new Date().toISOString(), message }, ...prev].slice(0, 20));
    };

    const addTransaction = async (data) => {
        const { subCategory, createdAt, attachment, ...rest } = data;
        const { error } = await supabase
            .from('transactions')
            .insert([{ ...rest, sub_category: subCategory }]);

        if (error) console.error('Error adding transaction:', error.message);
    };

    const addBulkTransactions = async (items) => {
        const mappedItems = items.map(({ subCategory, createdAt, attachment, id, ...rest }) => ({
            ...rest,
            sub_category: subCategory
        }));
        const { error } = await supabase
            .from('transactions')
            .insert(mappedItems);

        if (error) {
            console.error('Error adding bulk transactions:', error.message);
        } else {
            addLog(`Bulk imported ${items.length} transactions`);
        }
    };

    const deleteTransaction = async (id) => {
        const tx = transactions.find(t => t.id === id);
        const { error } = await supabase
            .from('transactions')
            .delete()
            .eq('id', id);

        if (!error && tx) {
            addLog(`Deleted transaction: ${tx.details} (${tx.amount})`);
        }
    };

    const updateTransaction = async (id, updatedData) => {
        const { subCategory, createdAt, id: _id, attachment, ...rest } = updatedData;
        const { error } = await supabase
            .from('transactions')
            .update({ ...rest, sub_category: subCategory })
            .eq('id', id);

        if (!error) {
            addLog(`Modified transaction: ${updatedData.details || id}`);
        }
    };

    const addCategory = async (category) => {
        const colorIndex = categories.length % CATEGORY_COLORS.length;
        const { subCategory, ...rest } = category;
        const newCategory = {
            color: CATEGORY_COLORS[colorIndex],
            ...rest,
            sub_category: subCategory
        };

        const { error } = await supabase
            .from('categories')
            .insert([newCategory]);

        if (error) console.error('Error adding category:', error.message);
    };

    const ensureCategoriesExist = async (categoryList) => {
        const newCategories = [];
        for (const item of categoryList) {
            const exists = categories.find(c =>
                c.name.toLowerCase() === item.name.toLowerCase()
            );

            if (!exists) {
                const colorIndex = (categories.length + newCategories.length) % CATEGORY_COLORS.length;
                newCategories.push({
                    name: item.name,
                    type: item.type,
                    color: CATEGORY_COLORS[colorIndex],
                    sub_category: '',
                    notes: 'Automatically added during import'
                });
            }
        }

        if (newCategories.length > 0) {
            const { error } = await supabase
                .from('categories')
                .insert(newCategories);

            if (!error) {
                addLog(`Auto-added ${newCategories.length} new categories from import`);
            }
        }
    };

    const deleteCategory = async (id) => {
        const cat = categories.find(c => c.id === id);
        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', id);

        if (!error && cat) addLog(`Deleted category: ${cat.name}`);
    };

    const updateCategory = async (id, updatedData) => {
        const { subCategory, id: _id, ...rest } = updatedData;
        const { error } = await supabase
            .from('categories')
            .update({ ...rest, sub_category: subCategory })
            .eq('id', id);

        if (!error) {
            addLog(`Modified category: ${updatedData.name || id}`);
        }
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
        loading,
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
