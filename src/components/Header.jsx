import React, { useState, useRef, useEffect } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { useAuth } from '../context/AuthContext';
import { ChevronDown, User, LogOut, Key } from 'lucide-react';
import Button from './ui/Button';
import LogsModal from './LogsModal';
import ChangePasswordModal from './ChangePasswordModal';
import { exportToPDF, exportToExcel } from '../utils/exportUtils';
import * as XLSX from 'xlsx';

const Header = ({ onAddCategory, filter, updateFilter }) => {
    const { activeView, setActiveView, transactions, addBulkTransactions, getFilterLabel, ensureCategoriesExist } = useTransactions();
    const { user, logout } = useAuth();
    const [logsOpen, setLogsOpen] = useState(false);
    const [exportMenuOpen, setExportMenuOpen] = useState(false);
    const [uploadMenuOpen, setUploadMenuOpen] = useState(false);
    const [periodPickerOpen, setPeriodPickerOpen] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const [changePasswordOpen, setChangePasswordOpen] = useState(false);
    const [importing, setImporting] = useState(null); // { status: 'idle' | 'processing' | 'success', count: 0 }

    const exportRef = useRef(null);
    const uploadRef = useRef(null);
    const periodPickerRef = useRef(null);
    const profileRef = useRef(null);
    const fileInputRef = useRef(null);

    const handleImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setImporting({ status: 'processing', count: 0 });

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);

                if (data.length === 0) {
                    alert('The uploaded file is empty.');
                    setImporting(null);
                    return;
                }

                // Robust Column Mapping
                const findColumn = (keywords) => {
                    const firstRow = Object.keys(data[0]);
                    return firstRow.find(col =>
                        keywords.some(k => col.toLowerCase().includes(k.toLowerCase()))
                    );
                };

                const colMap = {
                    date: findColumn(['date', 'time', 'day']),
                    type: findColumn(['type', 'kind', 'transaction']),
                    category: findColumn(['category', 'group', 'class']),
                    details: findColumn(['detail', 'desc', 'note', 'narrative']),
                    amount: findColumn(['amount', 'value', 'price', 'total'])
                };

                const mappedData = data.map(row => {
                    let dateVal = row[colMap.date] || new Date().toISOString().split('T')[0];

                    // Handle Excel Date Serial Numbers
                    if (typeof dateVal === 'number') {
                        const date = new Date((dateVal - 25569) * 86400 * 1000);
                        dateVal = date.toISOString().split('T')[0];
                    }

                    return {
                        date: dateVal,
                        type: (String(row[colMap.type] || 'expense')).toLowerCase() === 'income' ? 'income' : 'expense',
                        category: row[colMap.category] || 'Other',
                        details: row[colMap.details] || '',
                        amount: Math.abs(Number(row[colMap.amount]) || 0)
                    };
                });

                addBulkTransactions(mappedData);
                setImporting({ status: 'success', count: mappedData.length });
                setTimeout(() => setImporting(null), 3000);
            } catch (err) {
                console.error('Import Error:', err);
                alert('Failed to parse file. Please ensure it follows the template format.');
                setImporting(null);
            }
            e.target.value = ''; // Reset input
        };
        reader.readAsBinaryString(file);
        setUploadMenuOpen(false);
    };

    const currentDate = new Date();
    const formattedDate = new Intl.DateTimeFormat('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short'
    }).format(currentDate);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const quarters = [
        { label: '1st Quarter', value: 'q1' },
        { label: '2nd Quarter', value: 'q2' },
        { label: '3rd Quarter', value: 'q3' },
        { label: '4th Quarter', value: 'q4' }
    ];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (exportRef.current && !exportRef.current.contains(event.target)) {
                setExportMenuOpen(false);
            }
            if (uploadRef.current && !uploadRef.current.contains(event.target)) {
                setUploadMenuOpen(false);
            }
            if (periodPickerRef.current && !periodPickerRef.current.contains(event.target)) {
                setPeriodPickerOpen(false);
            }
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setProfileMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const downloadTemplate = () => {
        const data = [
            { Date: '2026-01-20', Type: 'expense', Category: 'Food', Details: 'Lunch at Cafe', Amount: 15.00 },
            { Date: '2026-01-20', Type: 'income', Category: 'Salary', Details: 'Month End Salary', Amount: 5000.00 }
        ];
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template");
        XLSX.writeFile(wb, "smart_ledger_template.xlsx");
        setUploadMenuOpen(false);
    };

    const handlePeriodSelect = (val) => {
        updateFilter({ month: val });
        // Don't close for year selection, only for month/quarter
        if (typeof val !== 'object') setPeriodPickerOpen(false);
    };

    return (
        <>
            <header style={{
                backgroundColor: 'var(--color-api-surface)',
                borderBottom: '1px solid #E2E8F0',
                padding: '0.75rem 0',
                position: 'relative',
                zIndex: 1000
            }}>
                <div style={{
                    maxWidth: '1200px',
                    margin: '0 auto',
                    padding: '0 1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem'
                }}>
                    {/* Logo */}
                    <div
                        onClick={() => setActiveView('dashboard')}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                    >
                        <div style={{
                            width: '32px',
                            height: '32px',
                            backgroundColor: 'var(--color-primary)',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 'bold'
                        }}>S</div>
                        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary)' }}>Smart Ledger</h1>
                    </div>

                    {/* Navigation */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Button variant="ghost" size="sm" onClick={() => setActiveView('dashboard')} style={{ fontWeight: 600, color: activeView === 'dashboard' ? 'var(--color-primary)' : 'inherit' }}>Home</Button>
                        <Button variant="ghost" size="sm" onClick={() => setActiveView('categories')} style={{ fontWeight: 600, color: activeView === 'categories' ? 'var(--color-primary)' : 'inherit' }}>Categories</Button>
                        <Button variant="ghost" size="sm" onClick={() => setActiveView('charts')} style={{ fontWeight: 600, color: activeView === 'charts' ? 'var(--color-primary)' : 'inherit' }}>Statistics</Button>

                        {/* Export */}
                        <div style={{ position: 'relative' }} ref={exportRef}>
                            <Button variant="ghost" size="sm" onClick={() => setExportMenuOpen(!exportMenuOpen)} style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>Export <ChevronDown size={14} /></Button>
                            {exportMenuOpen && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    right: 0,
                                    backgroundColor: 'white',
                                    boxShadow: 'var(--shadow-lg)',
                                    borderRadius: '8px',
                                    border: '1px solid #E2E8F0',
                                    padding: '0.5rem',
                                    zIndex: 200,
                                    minWidth: '160px',
                                    marginTop: '0.5rem'
                                }}>
                                    <button
                                        onClick={() => { exportToPDF(transactions); setExportMenuOpen(false); }}
                                        style={{ border: 'none', background: 'none', display: 'block', width: '100%', padding: '0.5rem', textAlign: 'left', borderRadius: '4px', fontSize: '0.9rem', cursor: 'pointer' }}
                                        onMouseEnter={(e) => e.target.style.backgroundColor = '#F1F5F9'}
                                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                    >PDF</button>
                                    <button
                                        onClick={() => { exportToExcel(transactions); setExportMenuOpen(false); }}
                                        style={{ border: 'none', background: 'none', display: 'block', width: '100%', padding: '0.5rem', textAlign: 'left', borderRadius: '4px', fontSize: '0.9rem', cursor: 'pointer' }}
                                        onMouseEnter={(e) => e.target.style.backgroundColor = '#F1F5F9'}
                                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                    >XLS</button>
                                </div>
                            )}
                        </div>

                        {/* Upload */}
                        <div style={{ position: 'relative' }} ref={uploadRef}>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setUploadMenuOpen(!uploadMenuOpen)}
                                style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                            >
                                Upload <ChevronDown size={14} />
                            </Button>
                            {uploadMenuOpen && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    right: 0,
                                    backgroundColor: 'white',
                                    boxShadow: 'var(--shadow-lg)',
                                    borderRadius: '8px',
                                    border: '1px solid #E2E8F0',
                                    padding: '0.5rem',
                                    zIndex: 200,
                                    minWidth: '180px',
                                    marginTop: '0.5rem'
                                }}>
                                    <button
                                        onClick={downloadTemplate}
                                        style={{ border: 'none', background: 'none', display: 'block', width: '100%', padding: '0.5rem', textAlign: 'left', borderRadius: '4px', fontSize: '0.9rem', cursor: 'pointer' }}
                                        onMouseEnter={(e) => e.target.style.backgroundColor = '#F1F5F9'}
                                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                    >Get XLS Template</button>
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        style={{ border: 'none', background: 'none', display: 'block', width: '100%', padding: '0.5rem', textAlign: 'left', borderRadius: '4px', fontSize: '0.9rem', cursor: 'pointer' }}
                                        onMouseEnter={(e) => e.target.style.backgroundColor = '#F1F5F9'}
                                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                    >Upload XLS Data</button>
                                    <div style={{ borderTop: '1px solid #F1F5F9', margin: '4px 0' }}></div>
                                    <button
                                        onClick={() => { setLogsOpen(true); setUploadMenuOpen(false); }}
                                        style={{ border: 'none', background: 'none', display: 'block', width: '100%', padding: '0.5rem', textAlign: 'left', borderRadius: '4px', fontSize: '0.9rem', cursor: 'pointer' }}
                                        onMouseEnter={(e) => e.target.style.backgroundColor = '#F1F5F9'}
                                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                    >View Logs</button>
                                </div>
                            )}
                        </div>

                        {/* Period Picker */}
                        <div style={{ position: 'relative' }} ref={periodPickerRef}>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPeriodPickerOpen(!periodPickerOpen)}
                                style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '180px', justifyContent: 'space-between', borderRadius: '8px' }}
                            >
                                {getFilterLabel()} <ChevronDown size={14} />
                            </Button>
                            {periodPickerOpen && (
                                <div style={{ position: 'absolute', top: '100%', right: 0, backgroundColor: 'white', boxShadow: 'var(--shadow-lg)', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '1rem', zIndex: 300, minWidth: '320px', marginTop: '0.5rem' }}>
                                    {/* Year Selector */}
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #F1F5F9' }}>
                                        {[2024, 2025, 2026].map(y => (
                                            <button
                                                key={y}
                                                onClick={() => updateFilter({ year: y })}
                                                style={{
                                                    padding: '0.4rem 1rem',
                                                    borderRadius: '6px',
                                                    border: '1px solid #E2E8F0',
                                                    backgroundColor: filter.year === y ? 'var(--color-primary)' : 'white',
                                                    color: filter.year === y ? 'white' : '#475569',
                                                    cursor: 'pointer',
                                                    fontWeight: 600,
                                                    fontSize: '0.85rem'
                                                }}
                                            >
                                                {y}
                                            </button>
                                        ))}
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
                                        {/* Months Column */}
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                                            {months.map((m, i) => (
                                                <button
                                                    key={m}
                                                    onClick={() => handlePeriodSelect(i)}
                                                    style={{
                                                        padding: '0.5rem 0',
                                                        borderRadius: '6px',
                                                        border: 'none',
                                                        backgroundColor: filter.month === i ? '#EFF6FF' : 'transparent',
                                                        color: filter.month === i ? 'var(--color-primary)' : '#64748B',
                                                        cursor: 'pointer',
                                                        fontWeight: filter.month === i ? 700 : 500,
                                                        fontSize: '0.85rem',
                                                        textAlign: 'center'
                                                    }}
                                                >
                                                    {m}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Quarters Column */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            {quarters.map(q => (
                                                <button
                                                    key={q.value}
                                                    onClick={() => handlePeriodSelect(q.value)}
                                                    style={{
                                                        padding: '0.5rem',
                                                        borderRadius: '6px',
                                                        border: 'none',
                                                        backgroundColor: filter.month === q.value ? '#ECFDF5' : '#F8FAFC',
                                                        color: filter.month === q.value ? '#059669' : '#475569',
                                                        cursor: 'pointer',
                                                        fontWeight: 600,
                                                        fontSize: '0.75rem',
                                                        textAlign: 'left'
                                                    }}
                                                >
                                                    {q.label}
                                                </button>
                                            ))}
                                            <button
                                                onClick={() => handlePeriodSelect('all')}
                                                style={{
                                                    padding: '0.5rem',
                                                    borderRadius: '6px',
                                                    border: 'none',
                                                    backgroundColor: filter.month === 'all' ? '#F5F3FF' : '#F8FAFC',
                                                    color: filter.month === 'all' ? '#7C3AED' : '#475569',
                                                    cursor: 'pointer',
                                                    fontWeight: 600,
                                                    fontSize: '0.75rem',
                                                    textAlign: 'left',
                                                    marginTop: 'auto'
                                                }}
                                            >
                                                All Months
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Today Display */}
                        <div style={{ textAlign: 'right', marginLeft: '0.5rem', borderLeft: '1px solid #E2E8F0', paddingLeft: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div>
                                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-secondary)', lineHeight: 1 }}>Today</span>
                                <span style={{ fontSize: '0.9rem', color: 'var(--color-text-main)' }}>{formattedDate}</span>
                            </div>

                            {/* Profile Dropdown */}
                            <div style={{ position: 'relative' }} ref={profileRef}>
                                <button
                                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                                    style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '50%',
                                        backgroundColor: '#F1F5F9',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'var(--color-primary)',
                                        border: '1px solid #E2E8F0',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => e.target.style.backgroundColor = '#E2E8F0'}
                                    onMouseLeave={(e) => e.target.style.backgroundColor = '#F1F5F9'}
                                >
                                    <User size={20} />
                                </button>

                                {profileMenuOpen && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '100%',
                                        right: 0,
                                        backgroundColor: 'white',
                                        boxShadow: 'var(--shadow-lg)',
                                        borderRadius: '12px',
                                        border: '1px solid #E2E8F0',
                                        padding: '0.5rem',
                                        zIndex: 1100,
                                        minWidth: '200px',
                                        marginTop: '0.75rem',
                                        animation: 'fadeInDown 0.2s ease-out'
                                    }}>
                                        <div style={{ padding: '0.75rem', borderBottom: '1px solid #F1F5F9', marginBottom: '0.25rem' }}>
                                            <p style={{ fontSize: '0.875rem', fontWeight: 700, margin: 0 }}>{user?.username || 'Admin'}</p>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', margin: 0 }}>{user?.email}</p>
                                        </div>
                                        <button
                                            onClick={() => { setChangePasswordOpen(true); setProfileMenuOpen(false); }}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                width: '100%',
                                                padding: '0.65rem 0.75rem',
                                                borderRadius: '8px',
                                                fontSize: '0.9rem',
                                                color: 'var(--color-text-main)',
                                                transition: 'background 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F1F5F9'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                        >
                                            <Key size={16} /> Change Password
                                        </button>
                                        <button
                                            onClick={logout}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                width: '100%',
                                                padding: '0.65rem 0.75rem',
                                                borderRadius: '8px',
                                                fontSize: '0.9rem',
                                                color: 'var(--color-danger)',
                                                transition: 'background 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEF2F2'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                        >
                                            <LogOut size={16} /> Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Import Status Inline Notification */}
                {importing && (
                    <div style={{
                        position: 'absolute',
                        bottom: '-50px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: importing.status === 'success' ? '#10B981' : '#3B82F6',
                        color: 'white',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '2rem',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        boxShadow: 'var(--shadow-lg)',
                        zIndex: 1000,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        animation: 'fadeInUp 0.3s ease-out'
                    }}>
                        {importing.status === 'processing' ? 'Processing file...' : `Successfully imported ${importing.count} transactions!`}
                    </div>
                )}
            </header>
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept=".xlsx, .xls"
                onChange={handleImport}
            />
            <LogsModal isOpen={logsOpen} onClose={() => setLogsOpen(false)} />
            <ChangePasswordModal isOpen={changePasswordOpen} onClose={() => setChangePasswordOpen(false)} />

            <style>{`
                @keyframes fadeInUp {
                    from { transform: translate(-50%, 20px); opacity: 0; }
                    to { transform: translate(-50%, 0); opacity: 1; }
                }
                @keyframes fadeInDown {
                    from { transform: translateY(-10px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
        </>
    );
};

export default Header;
