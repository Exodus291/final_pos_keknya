'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import SaveAndPrint from '../components/SaveAndPrint';
import { formatToIDR } from '../utils/formatIdr';
import { calculateOrderTotal } from '../utils/priceUtils';

export default function TransaksiPage() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const savedTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    setTransactions(savedTransactions);
  }, []);

  const calculateSubtotal = (items) => {
    return items.reduce((sum, item) => 
      sum + parseInt(item.price.replace(/\D/g, '') || 0), 0
    );
  };

  const calculateTotal = (transaction) => {
    return formatToIDR(calculateOrderTotal(transaction.foodItems, transaction.drinkItems));
  };

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
            transactions.map((transaction, index) => (
              <motion.div
                key={`${transaction.id}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group"
              >
                {/* Transaction Header */}
                <div className="border-b border-gray-200 p-6">
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <p className="text-sm text-gray-500">
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
                      </div>
                      <p className="text-sm text-gray-500">
                        {new Date(transaction.date).toLocaleString('id-ID', {
                          dateStyle: 'full',
                          timeStyle: 'short'
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-1">Total Pembayaran</p>
                      <p className="text-xl font-bold text-indigo-600">
                        {calculateTotal(transaction)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Transaction Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">
                  {/* Food Items */}
                  <div className="p-6">
                    <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                      <span className="w-5 h-5 text-indigo-600 mr-2">🍜</span>
                      Makanan
                    </h4>
                    <ul className="space-y-3">
                      {transaction.foodItems.map((item, itemIndex) => (
                        <li key={`${item.id}-${itemIndex}`} className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">{item.name}</span>
                          <span className="font-medium text-gray-900">
                            {formatToIDR(item.price)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Drink Items */}
                  <div className="p-6">
                    <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                      <span className="w-5 h-5 text-indigo-600 mr-2">🥤</span>
                      Minuman
                    </h4>
                    <ul className="space-y-3">
                      {transaction.drinkItems.map((item, itemIndex) => (
                        <li key={`${item.id}-${itemIndex}`} className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">{item.name}</span>
                          <span className="font-medium text-gray-900">
                            {formatToIDR(item.price)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Print Button Section */}
                <div className="border-t border-gray-200 p-3 bg-gray-50">
                  <div className="flex justify-end gap-2">
                    <SaveAndPrint 
                      transaction={transaction} 
                      className="text-sm px-3 py-1.5" // Added smaller padding and text size
                    />
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}