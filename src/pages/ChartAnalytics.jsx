import React, { useMemo } from 'react';
import { useTransactions } from '../context/TransactionContext';
import Layout from '../components/Layout';
import Card from '../components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const ChartAnalytics = () => {
    const { transactions, categories, filter } = useTransactions();

    // Filter transactions
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

    // Income vs Expense (Aggregated by Month)
    const monthlyData = useMemo(() => {
        const data = Array(12).fill(0).map((_, i) => ({
            name: new Date(0, i).toLocaleString('default', { month: 'short' }),
            Income: 0,
            Expense: 0
        }));

        filteredTransactions.forEach(t => {
            const monthIndex = new Date(t.date).getMonth();
            const amount = Number(t.amount);
            if (t.type === 'income') {
                data[monthIndex].Income += amount;
            } else {
                data[monthIndex].Expense += amount;
            }
        });
        return data;
    }, [filteredTransactions]);

    // Expense by Category
    const categoryData = useMemo(() => {
        const map = {};
        filteredTransactions.filter(t => t.type === 'expense').forEach(t => {
            map[t.category] = (map[t.category] || 0) + Number(t.amount);
        });
        return Object.keys(map).map(k => ({ name: k, value: map[k] }));
    }, [filteredTransactions]);

    return (
        <Layout>
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Financial Analytics</h2>
                <p style={{ color: 'var(--color-text-secondary)' }}>Overview for {filter.year}</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {/* Monthly Trends */}
                <Card>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem' }}>Monthly Income vs Expense</h3>
                    <div style={{ height: '300px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: '#F1F5F9' }} />
                                <Legend />
                                <Bar dataKey="Income" fill="var(--color-success)" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Expense" fill="var(--color-danger)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Category Expenses */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    <Card>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Expense Distribution</h3>
                        <div style={{ height: '300px', width: '100%', display: 'flex', justifyContent: 'center' }}>
                            {categoryData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={categoryData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {categoryData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>No expense data</div>
                            )}
                        </div>
                    </Card>

                    <Card>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Insights</h3>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {/* Simple Insights */}
                            <li style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #F1F5F9' }}>
                                <div style={{ fontSize: '0.9rem', color: '#64748B' }}>Total Expenses (Year)</div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(monthlyData.reduce((acc, curr) => acc + curr.Expense, 0))}
                                </div>
                            </li>
                            <li style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #F1F5F9' }}>
                                <div style={{ fontSize: '0.9rem', color: '#64748B' }}>Highest Spending Category</div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                                    {categoryData.length > 0 ? categoryData.sort((a, b) => b.value - a.value)[0].name : 'N/A'}
                                </div>
                            </li>
                        </ul>
                    </Card>
                </div>
            </div>
        </Layout>
    );
};

export default ChartAnalytics;
