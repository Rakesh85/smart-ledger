import React from 'react';

const Button = ({ children, variant = 'primary', size = 'md', className = '', style = {}, ...props }) => {
    const baseStyles = {
        borderRadius: 'var(--radius-full)', // Rounded pills as requested logic (implied by "improved pattern")
        fontWeight: '600',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden'
    };

    const variants = {
        primary: {
            backgroundColor: 'var(--color-primary)',
            color: 'white',
            boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.3), 0 2px 4px -1px rgba(37, 99, 235, 0.1)',
            border: 'none',
        },
        secondary: {
            backgroundColor: 'white',
            border: '1px solid #E2E8F0',
            color: 'var(--color-text-main)',
            boxShadow: 'var(--shadow-sm)',
        },
        danger: {
            backgroundColor: 'var(--color-danger)',
            color: 'white',
            boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.3), 0 2px 4px -1px rgba(239, 68, 68, 0.1)',
            border: 'none',
        },
        ghost: {
            backgroundColor: 'transparent',
            color: 'var(--color-text-secondary)',
            border: 'none',
        }
    };

    // Hover states would technically need JS state or pure CSS class usage. 
    // Since we are using inline styles (mostly), we rely on the user adding CSS classes or just accepting the basic transition.
    // Ideally, I would add a class 'btn' and 'btn-primary' etc in index.css.
    // But for now, let's keep inline but clean.

    const sizes = {
        sm: { fontSize: '0.85rem', padding: '0.35rem 0.85rem' },
        md: { fontSize: '0.95rem', padding: '0.6rem 1.25rem' },
        lg: { fontSize: '1.1rem', padding: '0.75rem 2rem' },
    };

    const computedStyle = {
        ...baseStyles,
        ...variants[variant],
        ...sizes[size],
        ...style,
    };

    return (
        <button style={computedStyle} className={className} {...props}>
            {children}
        </button>
    );
};

export default Button;
