'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { formatToIDR } from '../utils/formatIdr';

const SaveAndPrint = ({ transaction, className = '', onFinalized, onPrint }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSaveAndPrint = async () => {
    setLoading(true);
    const printWindow = window.open('', '_blank');

    if (!printWindow) {
      alert('Popup printer diblokir oleh browser.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/transactions/${transaction.id}/final`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();;
      const trx = result.data;
      console.log('RESPON TRX:', trx);

      if (onPrint) onPrint(trx);
      if (onFinalized) onFinalized(transaction.id);

      const printContent = getPrintContent(trx);

      const html = `
        <html>
          <head>
            <title>Print Receipt</title>
            <style>
              @page { size: 58mm auto; margin: 0; }
              body { margin: 0; padding: 0; font-family: monospace; font-size: 12px; }
              .wrapper { width: 58mm; padding: 5mm; }
              .center { text-align: center; }
              .line { border-top: 1px dashed #000; margin: 10px 0; padding-top: 10px; }
              .item-row { display: flex; justify-content: space-between; margin: 4px 0; }
              .item-row span { display: inline-block; }
            </style>
          </head>
          <body onload="window.print(); window.onafterprint = function() { window.close(); }">
            ${printContent}
          </body>
        </html>
      `;

      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();

      router.refresh();
    } catch (error) {
      console.error('Error:', error);
      alert(error.message || 'Terjadi kesalahan saat menyimpan atau mencetak transaksi.');
      printWindow?.close();
    } finally {
      setLoading(false);
    }
  };

  const calculateItemTotal = (item) => Number(item.price) * Number(item.quantity || 1);

  const calculateOrderTotal = (foodItems) =>
    foodItems.reduce((sum, item) => sum + calculateItemTotal(item), 0);

  const getPrintContent = (trx) => {
    const foodItems = trx.foodItems || [];
    const grandTotal = calculateOrderTotal(foodItems);

    return `
      <div class="wrapper">
        <div class="center">
          <h2 style="margin: 0;">WARUNG SEBLAK</h2>
          <p style="margin: 5px 0;">Jl. Example Street No. 123</p>
          <p style="margin: 5px 0;">Tel: (123) 456-7890</p>
        </div>

        <div class="line">
          <p>Date: ${new Date(trx.date).toLocaleString('id-ID')}</p>
          <p>Order #: ${trx.id.toString().slice(-6).padStart(6, '0')}</p>
          ${trx.customerName ? `<p>Customer: ${trx.customerName}</p>` : ''}
        </div>

        ${foodItems.length > 0 ? '<p>Item:</p>' : ''}
        ${foodItems.map(item => {
          const total = calculateItemTotal(item);
          return `
            <div class="item-row">
              <span style="width: 30%">${item.name}</span>
              <span style="width: 15%">x${item.quantity || 1}</span>
              <span style="width: 35%; text-align: right;">${formatToIDR(total)}</span>
            </div>
          `;
        }).join('')}

        <div class="line">
          <div style="display: flex; justify-content: space-between; font-weight: bold;">
            <span>TOTAL</span>
            <span>${formatToIDR(grandTotal)}</span>
          </div>
        </div>

        <div class="center" style="margin-top: 20px;">
          <p>Terima kasih atas kunjungan Anda!</p>
          <p>Silakan datang kembali</p>
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
      disabled={loading}
    >
      {loading ? (
        <span>Memproses...</span>
      ) : (
        <>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0v3H7V4h6zm0 8v4H7v-4h6z" />
          </svg>
          Simpan & Cetak
        </>
      )}
    </motion.button>
  );
};

export default SaveAndPrint;
