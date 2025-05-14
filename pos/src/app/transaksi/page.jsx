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

  const fetchTransactions = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/transactions/pending');
      if (!response.ok) throw new Error('Failed to fetch transactions');
      const data = await response.json();
      const sortedData = data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setTransactions(sortedData);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus transaksi ini?')) return;
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
      }, 400);
    } catch (err) {
      console.error('Error saat menghapus transaksi:', err);
      alert(`Terjadi kesalahan: ${err?.message || 'Tak dikenal'}`);
      setDeletingId(null);
    }
  };

  const handleFinalized = (id) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading transactions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
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
            <h1 className="text-1xl font-bold text-gray-900">Transaksi Pending</h1>
            <div className="flex gap-2">
              <Link
                href="/transaksi/final"
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200"
              >
                Transaksi Final
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
      <div className="max-w-full mx-auto px-4 py-6">
        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Belum ada transaksi pending</p>
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
                  exit={{ opacity: 0, x: 100, transition: { duration: 0.4, ease: 'easeInOut' } }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group mb-6"
                >
                  {/* Transaction Header */}
                  <div className="border-b border-gray-200 p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm text-gray-500 break-words">
                            ID Transaksi: #{String(transaction.id).slice(-6).padStart(6, '0')}
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
                      <div className="text-left sm:text-right">
                        <p className="text-xs text-gray-500 mb-1">Total Pembayaran</p>
                        <p className="text-lg sm:text-xl font-bold text-indigo-600">
                          {formatToIDR(transaction.total)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Transaction Items */}
                  <div className="p-4 sm:p-6">
                    <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                      <span className="w-5 h-5 text-indigo-600 mr-2">🍜</span> Makanan
                    </h4>
                    <ul className="space-y-3">
                      {transaction.foodItems?.map((item, idx) => (
                        <li
                          key={`${item.id || item.menuId}-${idx}`}
                          className="flex justify-between items-center text-sm"
                        >
                          <span className="text-gray-600 break-all">
                            {item.name} x{item.quantity || 1}
                          </span>
                          <span className="font-medium text-gray-900">
                            {formatToIDR(item.price * (item.quantity || 1))}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Footer Actions */}
                  <div className="border-t border-gray-200 p-3 bg-gray-50">
                    <div className="flex flex-col sm:flex-row sm:justify-end gap-2">
                      <SaveAndPrint
                        transaction={transaction}
                        className="text-sm px-3 py-1.5"
                        onFinalized={handleFinalized}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
