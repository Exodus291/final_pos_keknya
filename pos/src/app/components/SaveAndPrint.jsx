'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { formatToIDR } from '../utils/formatIdr';
import { parsePrice, calculateItemTotal, calculateOrderTotal } from '../utils/priceUtils';

const SaveAndPrint = ({ transaction, className = '' }) => {
  const router = useRouter();

  const handleSaveAndPrint = async () => {
    try {
      // Save to localStorage first
      const savedTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
      localStorage.setItem('transactions', JSON.stringify([transaction, ...savedTransactions]));
      localStorage.removeItem('currentOrder');

      // Create print content
      const printContent = getPrintContent(transaction);

      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Receipt</title>
            <style>
              @page {
                size: 58mm auto;
                margin: 0;
              }
              @media print {
                body {
                  margin: 0;
                  padding: 0;
                }
              }
            </style>
          </head>
          <body>
            ${printContent}
            <script>
              window.onload = function() {
                window.print();
                window.onafterprint = function() {
                  window.close();
                }
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();

      // Navigate to transactions page after printing
      router.push('/transaksi');
    } catch (error) {
      console.error('Error saving and printing:', error);
      alert('Terjadi kesalahan saat menyimpan dan mencetak');
    }
  };

  const getPrintContent = (transaction) => {
    const grandTotal = calculateOrderTotal(transaction.foodItems, transaction.drinkItems);

    return `
      <div style="width: 58mm; padding: 5mm; font-family: monospace; font-size: 12px;">
        <div style="text-align: center; margin-bottom: 10px;">
          <h2 style="margin: 0;">WARUNG SEBLAK</h2>
          <p style="margin: 5px 0;">Jl. Example Street No. 123</p>
          <p style="margin: 5px 0;">Tel: (123) 456-7890</p>
        </div>
        
        <div style="border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 5px 0; margin: 10px 0;">
          <p>Date: ${new Date().toLocaleString('id-ID')}</p>
          <p>Order #: ${transaction.id.toString().slice(-6)}</p>
          ${transaction.customerName ? `<p>Customer: ${transaction.customerName}</p>` : ''}
        </div>

        <div style="margin: 10px 0;">
          ${transaction.foodItems.length > 0 ? '<p>Item:</p>' : ''}
          ${transaction.foodItems.map(item => {
            const total = calculateItemTotal(item);
            const unitPrice = parsePrice(item.price);
            return `
              <div style="display: flex; justify-content: space-between; margin: 10px 0;">
                <span style="width: 30%">${item.name}</span>
                <span style="width: 15%; text-align: left;">x${item.quantity || 1}</span>
                <span style="width: 35%; text-align: right;">${formatToIDR(total)}</span>
              </div>
            `;
          }).join('')}
          
         
          ${transaction.drinkItems.map(item => {
            const total = calculateItemTotal(item);
            const unitPrice = parsePrice(item.price);
            return `
              <div style="display: flex; justify-content: space-between; margin: 10px 0;">
                <span style="width: 30%">${item.name}</span>
                <span style="width: 15%; text-align: left;">x${item.quantity || 1}</span>
                <span style="width: 35%; text-align: right;">${formatToIDR(total)}</span>
              </div>
            `;
          }).join('')}
        </div>

        <div style="border-top: 1px dashed #000; padding-top: 10px; margin-top: 10px;">
          <div style="display: flex; justify-content: space-between; font-weight: bold;">
            <span>TOTAL</span>
            <span>${formatToIDR(grandTotal)}</span>
          </div>
        </div>

        <div style="text-align: center; margin-top: 20px;">
          <p>Terima kasih atas kunjungan Anda!</p>
          <p>Silahkan datang kembali</p>
        </div>
      </div>
    `;
  };

  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={handleSaveAndPrint}
      className={`w-full p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center justify-center gap-2 font-medium ${className}`}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-5 w-5" 
        viewBox="0 0 20 20" 
        fill="currentColor"
      >
        <path d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0v3H7V4h6zm0 8v4H7v-4h6z" />
      </svg>
      Simpan & Cetak
    </motion.button>
  );
};

export default SaveAndPrint;