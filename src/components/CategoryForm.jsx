import React, { useState, useEffect } from 'react';
import { useTransactions } from '../context/TransactionContext';
import Button from './ui/Button';
import { Input } from './ui/Input';

const CategoryForm = ({ onClose, editItem = null }) => {
    const { addCategory, updateCategory } = useTransactions();
    const [name, setName] = useState('');
    const [notes, setNotes] = useState('');
    const [type, setType] = useState('expense');

    useEffect(() => {
        if (editItem) {
            setName(editItem.name);
            setNotes(editItem.notes || '');
            setType(editItem.type);
        }
    }, [editItem]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editItem) {
            updateCategory(editItem.id, { name, notes, type });
        } else {
            addCategory({ name, notes, type });
        }
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

            {/* Category Type Radio Selector */}
            <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem', color: '#475569' }}>Category Type</label>
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input
                            type="radio"
                            name="type"
                            value="expense"
                            checked={type === 'expense'}
                            onChange={(e) => setType(e.target.value)}
                            style={{ width: 'auto' }}
                        />
                        <span style={{ fontWeight: 500 }}>Expense</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input
                            type="radio"
                            name="type"
                            value="income"
                            checked={type === 'income'}
                            onChange={(e) => setType(e.target.value)}
                            style={{ width: 'auto' }}
                        />
                        <span style={{ fontWeight: 500 }}>Income</span>
                    </label>
                </div>
            </div>

            <Input
                label="Category Name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Shopping, Rent"
            />

            <Input
                label="Notes (Optional)"
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Details about this category"
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <Button type="button" variant="ghost" onClick={onClose}>
                    Cancel
                </Button>
                <Button type="submit" variant="primary" style={{ backgroundColor: 'var(--color-primary)' }}>
                    {editItem ? 'Update Category' : 'Save Category'}
                </Button>
            </div>
        </form>
    );
};

export default CategoryForm;
