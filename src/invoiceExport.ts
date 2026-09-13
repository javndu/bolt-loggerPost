import type { Entry, Settings } from '@/types';
import { calcPayForInput, formatCurrency, formatDate, getMonthName } from '@/utils';

function escapeCSVField(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function generateInvoiceCSV(
  entries: Entry[],
  settings: Settings,
  driverName: string,
  monthLabel: string,
  fileName: string
) {
  const headers = ['Date', 'Type', 'Normal', 'Express', 'Transfer Qty', 'Transfer Type', 'From Driver', 'Hours', 'Break', 'Login', 'Pay', 'Status'];

  const rows = entries.map((e) => {
    const pay = calcPayForInput(e.is_saturday, e.normal, e.express, e.transfer_type, e.transfer_qty, e.hours_worked, settings);
    return [
      e.date,
      e.is_saturday ? 'Saturday Shift' : 'Weekday',
      e.normal.toString(),
      e.express.toString(),
      e.transfer_qty.toString(),
      e.transfer_type || '',
      e.transferred_from || '',
      e.is_saturday ? (e.hours_worked || 0).toFixed(2) : '',
      e.break_deducted ? 'Yes' : 'No',
      e.delivery_login || '',
      pay.toFixed(2),
      e.is_paid ? 'Paid' : 'Unpaid',
    ];
  });

  const totalPay = entries.reduce((sum, e) => {
    return sum + calcPayForInput(e.is_saturday, e.normal, e.express, e.transfer_type, e.transfer_qty, e.hours_worked, settings);
  }, 0);

  const totalNormal = entries.reduce((s, e) => s + e.normal, 0);
  const totalExpress = entries.reduce((s, e) => s + e.express, 0);
  const totalTransfer = entries.reduce((s, e) => s + e.transfer_qty, 0);
  const totalHours = entries.filter((e) => e.is_saturday).reduce((s, e) => s + (e.hours_worked || 0), 0);

  const csvLines: string[] = [
    `Parcel Log Pro - Invoice`,
    `Driver: ${driverName}`,
    `Period: ${monthLabel}`,
    `Generated: ${new Date().toLocaleDateString('en-AU')}`,
    '',
    headers.join(','),
    ...rows.map((r) => r.map(escapeCSVField).join(',')),
    '',
    `TOTALS,,,,${totalTransfer},,,${totalHours.toFixed(2)},,,${totalPay.toFixed(2)},`,
    '',
    `Total Normal Parcels,${totalNormal}`,
    `Total Express Parcels,${totalExpress}`,
    `Total Transfer Parcels,${totalTransfer}`,
    `Total Saturday Hours,${totalHours.toFixed(2)}`,
    `Total Pay,${formatCurrency(totalPay)}`,
  ];

  const csv = csvLines.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${fileName}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
