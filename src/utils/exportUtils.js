import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

export const exportToPDF = (transactions, title = 'Transactions') => {
    const doc = new jsPDF();

    const tableColumn = ["Date", "Type", "Category", "Sub Category", "Details", "Amount"];
    const tableRows = [];

    transactions.forEach(t => {
        const rowData = [
            t.date,
            t.type.toUpperCase(),
            t.category,
            t.subCategory || '-',
            t.details,
            t.amount.toString()
        ];
        tableRows.push(rowData);
    });

    doc.text(title, 14, 15);
    doc.autoTable(tableColumn, tableRows, { startY: 20 });
    doc.save(`${title.toLowerCase()}_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const exportToExcel = (transactions, filename = 'transactions') => {
    const worksheet = XLSX.utils.json_to_sheet(transactions.map(t => ({
        Date: t.date,
        Type: t.type,
        Category: t.category,
        SubCategory: t.subCategory || '',
        Details: t.details,
        Amount: t.amount
    })));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
    XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
};
