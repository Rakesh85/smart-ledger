import React, { useEffect } from 'react';
import Card from './Card';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children }) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '2rem'
        }}>
            {/* Wrapper with white margin as requested */}
            <div style={{
                backgroundColor: 'white',
                padding: '24px', // Increased to x3 margin (24px)
                borderRadius: '16px', // Adjusted to accommodate larger margin
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                width: '100%',
                maxWidth: '560px' // Slightly wider to feel balanced with larger margin
            }}>
                <Card style={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    backgroundColor: 'white',
                    borderRadius: '8px'
                }} padding="20px"> {/* Reduced slightly from 24px */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>{title}</h2>
                        <button onClick={onClose} style={{ padding: '0.25rem', cursor: 'pointer' }}>
                            <X size={20} color="var(--color-text-secondary)" />
                        </button>
                    </div>
                    <div style={{ overflowY: 'auto' }}>
                        {children}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Modal;
