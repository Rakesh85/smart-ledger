import React from 'react';
import Header from './Header';

const Layout = ({ children, onAddCategory, filter, updateFilter }) => {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header onAddCategory={onAddCategory} filter={filter} updateFilter={updateFilter} />
            <main style={{
                flex: 1,
                width: '100%',
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '24px', // 24px padding all around as requested
                display: 'flex',
                flexDirection: 'column'
            }}>
                {children}
            </main>
        </div>
    );
};

export default Layout;
