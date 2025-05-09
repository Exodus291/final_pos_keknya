'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function EditTransaksi({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const [transaction, setTransaction] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const savedTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const found = savedTransactions.find(t => t.id.toString() === id);
    if (found) {
      setTransaction(found);
    } else {
      router.push('/transaksi');
    }
  }, [id, router]);

  const handleSave = () => {
    const savedTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const updatedTransactions = savedTransactions.map(t => 
      t.id.toString() === id ? transaction : t
    );
    
    localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
    router.push('/transaksi');
  };

  const formatToIDR = (value) => {
    if (!value || value === 'Rp 0') return 'Rp 0';
    const number = parseInt(value.replace(/\D/g, ''));
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(number).replace('IDR', 'Rp');
  };

  const handlePriceChange = (value, index) => {
    const numericValue = value.replace(/\D/g, '');
    const formattedPrice = formatToIDR(numericValue);
    
    const newFoodItems = [...transaction.foodItems];
    newFoodItems[index].price = formattedPrice;
    setTransaction({ ...transaction, foodItems: newFoodItems });
  };

  const addFoodItem = () => {
    const newId = Math.max(...transaction.foodItems.map(item => item.id)) + 1;
    setTransaction({
      ...transaction,
      foodItems: [
        ...transaction.foodItems,
        {
          id: newId,
          name: `Seblak ${newId}`,
          price: "Rp 0"
        }
      ]
    });
  };

  const removeFoodItem = (itemId) => {
    if (transaction.foodItems.length <= 1) {
      setError('Minimal harus ada 1 makanan');
      return;
    }
    setTransaction({
      ...transaction,
      foodItems: transaction.foodItems.filter(item => item.id !== itemId)
    });
  };

  // Clear error after 3 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  if (!transaction) return null;

  return (
    <div className="min-h-screen bg-gray-50/50 backdrop-blur-sm fixed inset-0 flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-lg max-w-3xl w-full mx-4 overflow-hidden relative"
      >
        {/* Error Toast */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-100 border border-red-200 text-red-600 px-4 py-2 rounded-lg"
          >
            {error}
          </motion.div>
        )}

        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">
              Edit Transaksi #{id.slice(-6)}
            </h2>
            <button
              onClick={() => router.push('/transaksi')}
              className="text-gray-400 hover:text-gray-500"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            {/* Food Items */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Makanan</h3>
                <button
                  onClick={addFoodItem}
                  className="text-sm px-3 py-1 bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100"
                >
                  + Tambah Makanan
                </button>
              </div>
              {transaction.foodItems.map((item, index) => (
                <div key={item.id} className="flex gap-4 mb-4 items-center">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => {
                      const newFoodItems = [...transaction.foodItems];
                      newFoodItems[index].name = e.target.value;
                      setTransaction({ ...transaction, foodItems: newFoodItems });
                    }}
                    className="flex-1 p-2 border border-gray-200 rounded-lg"
                  />
                  <input
                    type="text"
                    value={item.price}
                    onChange={(e) => handlePriceChange(e.target.value, index)}
                    className="w-32 p-2 border border-gray-200 rounded-lg"
                    placeholder="Rp 0"
                  />
                  <button
                    onClick={() => removeFoodItem(item.id)}
                    className="text-red-500 hover:text-red-600 p-2"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end gap-4">
          <button
            onClick={() => router.push('/transaksi')}
            className="px-4 py-2 text-gray-700 hover:text-gray-900"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Simpan Perubahan
          </button>
        </div>
      </motion.div>
    </div>
  );
}