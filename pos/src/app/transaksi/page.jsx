'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import SaveAndPrint from '../components/SaveAndPrint';
import { formatToIDR } from '../utils/formatIdr';

export default function TransaksiPage() {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/transactions/pending');
        if (!response.ok) {
          throw new Error('Failed to fetch transactions');
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

    fetchTransactions();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = confirm('Yakin ingin menghapus transaksi ini?');
    if (!confirmDelete) return;

    try {
      setDeletingId(id);

      const response = await fetch(`http://localhost:3001/api/transactions/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Gagal menghapus transaksi');
      }

      setTimeout(() => {
        setTransactions((prev) => prev.filter((t) => t.id !== id));
        setDeletingId(null);
      }, 400); // sesuai durasi animasi exit
    } catch (err) {
      console.error('Error saat menghapus transaksi:', err);
      setDeletingId(null);
      const errorMessage = err?.message || 'Terjadi kesalahan tak dikenal';
      alert(`Terjadi kesalahan saat menghapus: ${errorMessage}`);
    }
  };

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
            <h1 className="text-2xl font-bold text-gray-900">Transaksi</h1>
            <Link
              href="/"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
            >
              Transaksi Baru
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Belum ada transaksi</p>
            </div>
          ) : (
            <AnimatePresence>
              {transactions
                .filter((transaction) => transaction.id !== deletingId)
                .map((transaction) => (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{
                      opacity: 0,
                      x: 100,
                      transition: { duration: 0.4, ease: 'easeInOut' },
                    }}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group"
                  >
                    {/* Transaction Header */}
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
                            <Link
                              href={`/transaksi/edit/${transaction.id}`}
                              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs px-2 py-1 bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDelete(transaction.id)}
                              disabled={deletingId === transaction.id}
                              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs px-2 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100"
                            >
                              {deletingId === transaction.id ? 'Menghapus...' : 'Delete'}
                            </button>
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
                          <p className="text-xl font-bold text-indigo-600">
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
                                key={`${item.id}-${itemIndex}`}
                                className="flex justify-between items-center text-sm"
                              >
                                <span className="text-gray-600">
                                  {item.name} x{item.quantity || 1}
                                </span>
                                <span className="font-medium text-gray-900">
                                  {formatToIDR(item.price * item.quantity)}
                                </span>
                              </li>
                            ))}
                        </ul>
                      </div>
                    </div>

                    {/* Print Button Section */}
                    <div className="border-t border-gray-200 p-3 bg-gray-50">
                      <div className="flex justify-end gap-2">
                        <SaveAndPrint transaction={transaction} className="text-sm px-3 py-1.5" />
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
