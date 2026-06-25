import { parse } from 'json2csv';
import ExcelJS from 'exceljs';

export const exportToCsv = (items) => {
  const fields = [
    'medicineName',
    'batchNumber',
    'manufacturer',
    'category',
    'quantity',
    'price',
    'expiryDate',
    'status',
    'stockStatus',
    'description',
    'createdAt'
  ];
  return parse(items, { fields });
};

export const exportToExcel = (items) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Medicines');

  sheet.columns = [
    { header: 'Medicine Name', key: 'medicineName', width: 30 },
    { header: 'Batch Number', key: 'batchNumber', width: 20 },
    { header: 'Manufacturer', key: 'manufacturer', width: 25 },
    { header: 'Category', key: 'category', width: 18 },
    { header: 'Quantity', key: 'quantity', width: 12 },
    { header: 'Price', key: 'price', width: 12 },
    { header: 'Expiry Date', key: 'expiryDate', width: 18 },
    { header: 'Status', key: 'status', width: 18 },
    { header: 'Stock Status', key: 'stockStatus', width: 18 },
    { header: 'Description', key: 'description', width: 30 },
    { header: 'Created At', key: 'createdAt', width: 24 }
  ];

  items.forEach((item) => {
    sheet.addRow({
      ...item.toObject(),
      expiryDate: item.expiryDate ? item.expiryDate.toISOString().split('T')[0] : '',
      createdAt: item.createdAt ? item.createdAt.toISOString() : ''
    });
  });

  return workbook.xlsx.writeBuffer();
};
