import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react'; // We will use a wrapper for Select to show custom icon

const baseInputStyle = {
    width: '100%',
    padding: '0.85rem 1rem',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid #E2E8F0',
    outline: 'none',
    transition: 'all 0.2s ease',
    backgroundColor: '#fff',
    fontSize: '0.95rem',
    color: 'var(--color-text-main)',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
};

const focusStyle = (e) => {
    e.target.style.borderColor = 'var(--color-primary)';
    e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
};

const blurStyle = (e) => {
    e.target.style.borderColor = '#E2E8F0';
    e.target.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
};

export const Input = forwardRef(({ label, id, error, ...props }, ref) => {
    return (
        <div>
            {label && <label htmlFor={id} style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem', color: '#475569' }}>{label}</label>}
            <input
                ref={ref}
                id={id}
                style={baseInputStyle}
                onFocus={focusStyle}
                onBlur={blurStyle}
                {...props}
            />
            {error && <span style={{ color: 'var(--color-danger)', fontSize: '0.8rem', marginTop: '0.35rem', display: 'block' }}>{error}</span>}
        </div>
    );
});

export const Select = forwardRef(({ label, id, children, error, style, ...props }, ref) => {
    return (
        <div style={{ ...style }}>
            {label && <label htmlFor={id} style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem', color: '#475569' }}>{label}</label>}
            <div style={{ position: 'relative' }}>
                <select
                    ref={ref}
                    id={id}
                    style={{
                        ...baseInputStyle,
                        appearance: 'none',
                        paddingRight: '2.5rem',
                        cursor: 'pointer'
                    }}
                    onFocus={focusStyle}
                    onBlur={blurStyle}
                    {...props}
                >
                    {children}
                </select>
                <div style={{
                    position: 'absolute',
                    right: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                    color: '#64748B'
                }}>
                    <ChevronDown size={18} />
                </div>
            </div>
            {error && <span style={{ color: 'var(--color-danger)', fontSize: '0.8rem', marginTop: '0.35rem', display: 'block' }}>{error}</span>}
        </div>
    );
});
