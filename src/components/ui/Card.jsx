import React from 'react';

const Card = ({ children, className = '', padding = '1.5rem', ...props }) => {
    const style = {
        backgroundColor: 'var(--color-api-surface)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid #E2E8F0',
        padding: padding,
        height: '100%'
    };

    return (
        <div style={style} className={className} {...props}>
            {children}
        </div>
    );
};

export default Card;
