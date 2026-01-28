import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X } from 'lucide-react';
import Button from './ui/Button';

const ChangePasswordModal = ({ isOpen, onClose }) => {
    const { changePassword } = useAuth();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            setError('New password must be at least 6 characters long');
            return;
        }

        setLoading(true);
        try {
            await changePassword(currentPassword, newPassword);
            setSuccess(true);
            setTimeout(() => {
                onClose();
                setSuccess(false);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            }, 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            animation: 'fadeIn 0.2s ease-out'
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                width: '100%',
                maxWidth: '400px',
                padding: '1.5rem',
                boxShadow: 'var(--shadow-lg)',
                position: 'relative',
                animation: 'scaleIn 0.2s ease-out'
            }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        color: 'var(--color-text-secondary)',
                        padding: '0.25rem'
                    }}
                >
                    <X size={20} />
                </button>

                <h2 style={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    marginBottom: '1.5rem',
                    color: 'var(--color-text-main)'
                }}>
                    Change Password
                </h2>

                {success ? (
                    <div style={{
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        color: 'var(--color-success)',
                        padding: '1rem',
                        borderRadius: '8px',
                        textAlign: 'center',
                        marginBottom: '1rem'
                    }}>
                        Password updated successfully!
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {error && (
                            <div style={{
                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                color: 'var(--color-danger)',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                fontSize: '0.875rem'
                            }}>
                                {error}
                            </div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Current Password</label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                style={{
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    border: '1px solid #E2E8F0',
                                    outline: 'none'
                                }}
                                required
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>New Password</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                style={{
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    border: '1px solid #E2E8F0',
                                    outline: 'none'
                                }}
                                required
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Confirm New Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                style={{
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    border: '1px solid #E2E8F0',
                                    outline: 'none'
                                }}
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            style={{ marginTop: '0.5rem' }}
                        >
                            {loading ? 'Updating...' : 'Update Password'}
                        </Button>
                    </form>
                )}
            </div>
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleIn {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default ChangePasswordModal;
