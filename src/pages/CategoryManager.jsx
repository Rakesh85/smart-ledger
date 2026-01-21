import React, { useState } from 'react';
import { useTransactions } from '../context/TransactionContext';
import Layout from '../components/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import CategoryForm from '../components/CategoryForm';
import { Edit2, Trash2, Plus, ChevronUp, ChevronDown } from 'lucide-react';

const CategoryManager = () => {
    const { categories, deleteCategory } = useTransactions();
    const [modalOpen, setModalOpen] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

    const handleEdit = (category) => {
        setEditItem(category);
        setModalOpen(true);
    };

    const handleClose = () => {
        setModalOpen(false);
        setEditItem(null);
    };

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedCategories = [...categories].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
    });

    const SortIcon = ({ column }) => {
        if (sortConfig.key !== column) return null;
        return sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
    };

    return (
        <Layout onAddCategory={() => setModalOpen(true)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Manage Categories</h2>
                <Button variant="primary" onClick={() => setModalOpen(true)}>
                    <Plus size={20} style={{ marginRight: '0.5rem' }} /> Add Category
                </Button>
            </div>

            <Card style={{ padding: 0, overflow: 'hidden', backgroundColor: 'white' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                            <th
                                style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#64748B', cursor: 'pointer' }}
                                onClick={() => requestSort('name')}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    Category Name <SortIcon column="name" />
                                </div>
                            </th>
                            <th
                                style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#64748B', cursor: 'pointer' }}
                                onClick={() => requestSort('type')}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    Type <SortIcon column="type" />
                                </div>
                            </th>
                            <th style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#64748B' }}>Notes</th>
                            <th style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#64748B', textAlign: 'center' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedCategories.map((category) => (
                            <tr key={category.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                <td style={{ padding: '1rem 1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{
                                            width: '10px',
                                            height: '10px',
                                            borderRadius: '50%',
                                            backgroundColor: category.color || '#94A3B8'
                                        }}></div>
                                        <span style={{ fontWeight: 500 }}>{category.name}</span>
                                    </div>
                                </td>
                                <td style={{ padding: '1rem 1.5rem' }}>
                                    <span style={{
                                        fontSize: '0.75rem',
                                        padding: '0.25rem 0.6rem',
                                        borderRadius: '1rem',
                                        fontWeight: 600,
                                        backgroundColor: category.type === 'income' ? '#DCFCE7' : '#FEE2E2',
                                        color: category.type === 'income' ? '#166534' : '#B91C1C',
                                        textTransform: 'capitalize'
                                    }}>
                                        {category.type}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem 1.5rem', fontSize: '0.9rem', color: '#64748B' }}>
                                    {category.notes || '-'}
                                </td>
                                <td style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>
                                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                                        <button onClick={() => handleEdit(category)} style={{ border: 'none', background: 'none', color: '#94A3B8', cursor: 'pointer' }}>
                                            <Edit2 size={18} />
                                        </button>
                                        <button onClick={() => deleteCategory(category.id)} style={{ border: 'none', background: 'none', color: '#94A3B8', cursor: 'pointer' }}>
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>

            <Modal
                isOpen={modalOpen}
                onClose={handleClose}
                title={editItem ? "Edit Category" : "Add New Category"}
            >
                <CategoryForm onClose={handleClose} editItem={editItem} />
            </Modal>
        </Layout>
    );
};

export default CategoryManager;
