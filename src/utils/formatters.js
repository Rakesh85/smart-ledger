import { format } from 'date-fns';

export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(amount);
};

export const formatDate = (dateString, pattern = 'dd MMM yyyy') => {
    if (!dateString) return '';
    return format(new Date(dateString), pattern);
};

export const generateId = () => {
    return crypto.randomUUID();
};
