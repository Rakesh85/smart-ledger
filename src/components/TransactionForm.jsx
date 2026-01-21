import React, { useState, useEffect, useMemo } from 'react';
import { useTransactions } from '../context/TransactionContext';
import Button from './ui/Button';
import { Input, Select } from './ui/Input';

const TransactionForm = ({ type: initialType, onClose, editItem = null }) => {
    const { categories, addTransaction, updateTransaction } = useTransactions();

    // Default to 'expense' if no type provided
    const [formData, setFormData] = useState({
        type: initialType || 'expense',
        date: new Date().toISOString().split('T')[0],
        amount: '',
        category: '',
        subCategory: '',
        details: '',
        attachment: null
    });

    useEffect(() => {
        if (editItem) {
            setFormData({
                ...editItem,
                date: editItem.date.split('T')[0]
            });
        } else if (initialType) {
            setFormData(prev => ({ ...prev, type: initialType }));
        }
    }, [editItem, initialType]);

    // Filter categories based on transaction type
    const filteredCategories = useMemo(() => {
        return categories.filter(c => c.type === formData.type);
    }, [categories, formData.type]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = {
            ...formData,
            amount: Number(formData.amount)
        };

        if (editItem) {
            updateTransaction(editItem.id, data);
        } else {
            addTransaction(data);
        }
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

            <Input
                label="Date"
                type="date"
                id="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />

            <Select
                label="Category"
                id="category"
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
                <option value="">Select Category</option>
                {filteredCategories.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                ))}
            </Select>

            <Input
                label="Sub Category (Optional)"
                type="text"
                id="subCategory"
                placeholder="e.g. Groceries, Fuel"
                value={formData.subCategory}
                onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
            />

            <Input
                label="Details"
                type="text"
                id="details"
                required
                placeholder="What was this for?"
                value={formData.details}
                onChange={(e) => setFormData({ ...formData, details: e.target.value })}
            />

            <Input
                label="Amount"
                type="number"
                id="amount"
                required
                min="0"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <Button type="button" variant="ghost" onClick={onClose}>
                    Cancel
                </Button>
                <Button
                    type="submit"
                    variant="primary"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                >
                    {editItem ? 'Update' : 'Submit'}
                </Button>
            </div>
        </form>
    );
};

export default TransactionForm;
