import React from 'react';
import { formatCurrency } from '../../utils/formatters';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

const SummaryCard = ({ title, amount, icon: Icon, color, bgGradient }) => {
    return (
        <div style={{
            flex: 1,
            minWidth: '240px', // Slightly narrower
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '16px 24px', // Reduced vertical padding
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', // Subtle shadow
            border: '1px solid #F1F5F9',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem', // Reduced gap
            position: 'relative',
            overflow: 'hidden'
        }}>
            <div style={{
                position: 'absolute',
                top: '-10%',
                right: '-5%',
                width: '80px', // Smaller decoration
                height: '80px',
                borderRadius: '50%',
                background: bgGradient,
                opacity: 0.08
            }}></div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{
                        padding: '0.5rem',
                        borderRadius: '0.75rem',
                        backgroundColor: `${color}15`,
                        color: color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Icon size={18} strokeWidth={2.5} />
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748B' }}>{title}</span>
                </div>
            </div>
            <div style={{ zIndex: 1 }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>
                    {formatCurrency(amount)}
                </h3>
            </div>
        </div>
    );
};

const SummaryCards = ({ income, expense, balance }) => {
    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <SummaryCard
                title="Total Expenses"
                amount={expense}
                icon={TrendingDown}
                color="#EF4444"
                bgGradient="radial-gradient(circle, #EF4444 0%, transparent 70%)"
            />
            <SummaryCard
                title="Total Income"
                amount={income}
                icon={TrendingUp}
                color="#10B981"
                bgGradient="radial-gradient(circle, #10B981 0%, transparent 70%)"
            />
            <SummaryCard
                title="Balance"
                amount={balance}
                icon={Wallet}
                color="#3B82F6"
                bgGradient="radial-gradient(circle, #3B82F6 0%, transparent 70%)"
            />
        </div>
    );
};

export default SummaryCards;
