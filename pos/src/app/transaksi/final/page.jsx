'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { formatToIDR } from '../../utils/formatIdr';

export default function FinalTransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFinalTransactions = async () => {
      try {
        const response = await fetch('https://benyanjir-production.up.railway.app/api/transactions/final');
        if (!response.ok) {
          throw new Error('Failed to fetch final transactions');
        }
        const data = await response.json();
        const sortedData = data.sort((a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setTransactions(sortedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFinalTransactions();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading transactions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-1xl font-bold text-gray-900">Transaksi Final</h1>
            <div className="flex gap-2">
              <Link
                href="/transaksi"
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200"
              >
                Transaksi Pending
              </Link>
              <Link
                href="/"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
              >
                Transaksi Baru
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Belum ada transaksi final</p>
            </div>
          ) : (
            <AnimatePresence>
              {transactions.map((transaction) => (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                  {/* Transaction Header with FINAL badge */}
                  <div className="border-b border-gray-200 p-6">
                    <div className="flex justify-between items-center">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <p className="text-sm text-gray-500">
                            ID Transaksi: #
                            {String(transaction.id).slice(-6).padStart(6, '0')}
                          </p>
                          {transaction.customerName && (
                            <p className="text-sm font-medium text-gray-700">
                              Pelanggan: {transaction.customerName}
                            </p>
                          )}
                          <span className="text-xs px-2 py-1 bg-green-50 text-green-600 rounded">
                            FINAL
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          {new Date(transaction.date).toLocaleString('id-ID', {
                            dateStyle: 'full',
                            timeStyle: 'short',
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 mb-1">Total Pembayaran</p>
                        <p className="text-xl font-bold text-green-600">
                          {formatToIDR(transaction.total)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Transaction Details */}
                  <div className="p-6">
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                        <span className="w-5 h-5 text-indigo-600 mr-2">🍜</span>
                        Makanan
                      </h4>
                      <ul className="space-y-3">
                        {transaction.foodItems &&
                          transaction.foodItems.map((item, itemIndex) => (
                            <li
                              key={`${item.id || item.menuId}-${itemIndex}`}
                              className="flex justify-between items-center text-sm"
                            >
                              <span className="text-gray-600">
                                {item.name} x{item.quantity || 1}
                              </span>
                              <span className="font-medium text-gray-900">
                                {formatToIDR(item.price * (item.quantity || 1))}
                              </span>
                            </li>
                          ))}
                      </ul>
                    </div>
                  </div>

                  {/* Receipt actions */}
                  <div className="border-t border-gray-200 p-3 bg-gray-50">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          const printContent = getPrintContent(transaction);
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
                        }}
                        className="text-sm px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200 flex items-center justify-center gap-2"
                      >
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-4 w-4" 
                          viewBox="0 0 20 20" 
                          fill="currentColor"
                        >
                          <path d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0v3H7V4h6zm0 8v4H7v-4h6z" />
                        </svg>
                        Cetak Ulang
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}

// Function to generate print content for receipts
function getPrintContent(trx) {
  const calculateItemTotal = (item) => {
    return Number(item.price) * Number(item.quantity || 1);
  };

  const calculateOrderTotal = (foodItems) => {
    return foodItems.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  };

  const foodItems = trx.foodItems || [];
  const grandTotal = calculateOrderTotal(foodItems);

  return `
    <div style="width: 58mm; padding: 5mm; font-family: monospace; font-size: 12px;">
      <div style="text-align: center; margin-bottom: 10px;">
          <h2 style="margin: 0;">SEBLAK ENJEL</h2>
          <p style="margin: 5px 0;">Jl. Roda Pembangunan Kp.Blok Rawa Rt.08/06</p>
          <p style="margin: 5px 0;">Tel: 0821-6174-4944</p>
      </div>
      
      <div style="border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 5px 0; margin: 10px 0;">
        <p>Date: ${new Date(trx.date).toLocaleString('id-ID')}</p>
        <p>Order #: ${trx.id.toString().slice(-6).padStart(6, '0')}</p>
        ${trx.customerName ? `<p>Customer: ${trx.customerName}</p>` : ''}
      </div>

      <div style="margin: 10px 0;">
        ${foodItems.length > 0 ? '<p>Item:</p>' : ''}
        ${foodItems.map(item => {
          const total = calculateItemTotal(item);
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
}

// Helper function to format money (replicated here for the FinalTransactionsPage)
// function formatToIDR(amount) {
//   return new Intl.NumberFormat('id-ID', {
//     style: 'currency',
//     currency: 'IDR',
//     minimumFractionDigits: 0,
//     maximumFractionDigits: 0,
//   }).format(amount);
// }