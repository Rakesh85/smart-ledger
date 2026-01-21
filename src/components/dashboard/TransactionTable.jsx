import React, { useState } from 'react';
import { useTransactions } from '../../context/TransactionContext';
import { formatCurrency } from '../../utils/formatters';
import { Edit2, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import Card from '../ui/Card';

const TransactionTable = ({ transactions, type, onDelete, onEdit }) => {
    const { getCategoryColor } = useTransactions();
    const [sortDir, setSortDir] = useState('asc');

    const sortedTransactions = [...transactions].sort((a, b) => {
        if (sortDir === 'asc') {
            return a.category.localeCompare(b.category);
        } else {
            return b.category.localeCompare(a.category);
        }
    });

    const toggleSort = () => {
        setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    };

    if (transactions.length === 0) {
        return (
            <Card style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'white' }}>
                <p style={{ color: 'var(--color-text-secondary)' }}>No transactions found for this period.</p>
            </Card>
        );
    }

    return (
        <Card style={{ overflow: 'hidden', padding: 0, backgroundColor: 'white' }}>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
                            <th style={{ padding: '1rem 1.5rem', fontWeight: 600, fontSize: '0.875rem', color: '#64748B' }}>Date</th>
                            <th
                                style={{ padding: '1rem 1.5rem', fontWeight: 600, fontSize: '0.875rem', color: '#64748B', cursor: 'pointer' }}
                                onClick={toggleSort}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    Category
                                    {sortDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                </div>
                            </th>
                            <th style={{ padding: '1rem 1.5rem', fontWeight: 600, fontSize: '0.875rem', color: '#64748B' }}>Details</th>
                            <th style={{ padding: '1rem 1.5rem', fontWeight: 600, fontSize: '0.875rem', color: '#64748B', textAlign: 'right' }}>Amount</th>
                            <th style={{ padding: '1rem 1.5rem', fontWeight: 600, fontSize: '0.875rem', color: '#64748B', textAlign: 'center' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedTransactions.map((t) => (
                            <tr key={t.id} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                <td style={{ padding: '1rem 1.5rem', fontSize: '0.9rem' }}>{t.date}</td>
                                <td style={{ padding: '1rem 1.5rem' }}>
                                    <span style={{
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '1rem',
                                        backgroundColor: `${getCategoryColor(t.category)}15`,
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        color: getCategoryColor(t.category),
                                        border: `1px solid ${getCategoryColor(t.category)}30`
                                    }}>
                                        {t.category}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem 1.5rem', fontSize: '0.9rem' }}>{t.details}</td>
                                <td style={{
                                    padding: '1rem 1.5rem',
                                    textAlign: 'right',
                                    fontWeight: 600,
                                    fontSize: '0.95rem',
                                    color: type === 'income' ? '#10B981' : '#EF4444'
                                }}>
                                    {type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                                </td>
                                <td style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                        <button onClick={() => onEdit(t)} style={{ color: '#94A3B8', cursor: 'pointer', border: 'none', background: 'none' }}>
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => onDelete(t.id)} style={{ color: '#94A3B8', cursor: 'pointer', border: 'none', background: 'none' }}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr style={{ backgroundColor: '#F8FAFC', fontWeight: 700 }}>
                            <td colSpan="3" style={{ padding: '1rem 1.5rem', textAlign: 'right', fontSize: '0.9rem' }}>Total {type === 'income' ? 'Income' : 'Expenses'}</td>
                            <td style={{
                                padding: '1rem 1.5rem',
                                textAlign: 'right',
                                fontSize: '1rem',
                                color: type === 'income' ? '#10B981' : '#EF4444'
                            }}>
                                {formatCurrency(transactions.reduce((acc, t) => acc + Number(t.amount), 0))}
                            </td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </Card>
    );
};

export default TransactionTable;
