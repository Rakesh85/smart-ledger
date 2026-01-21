import React from 'react';
import Modal from './ui/Modal';
import { useTransactions } from '../context/TransactionContext';
import { formatDate } from '../utils/formatters';

const LogsModal = ({ isOpen, onClose }) => {
    const { logs } = useTransactions();

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="System Logs">
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {logs.length === 0 ? (
                    <p style={{ color: '#94A3B8', textAlign: 'center' }}>No logs recorded yet.</p>
                ) : (
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {logs.map((log) => (
                            <li key={log.id} style={{
                                padding: '0.75rem 0',
                                borderBottom: '1px solid #F1F5F9',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.25rem'
                            }}>
                                <span style={{ fontSize: '0.9rem', color: '#1E293B' }}>{log.message}</span>
                                <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                                    {new Date(log.timestamp).toLocaleString()}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </Modal>
    );
};

export default LogsModal;
