'use client';

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import NamaDanWaktu from './NamaDanWaktu';
import SearchProduk from './cariProduk';

const InputMenuProduk = () => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [foodItems, setFoodItems] = useState([
    { 
      id: 1,
      name: "", 
      price: 0, // Store as number
      displayPrice: "Rp 0" // Store formatted string
    }
  ]);
  const handleSelectProduk = (product, itemId) => {
    setFoodItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              name: product.name,
              price: product.price,
              displayPrice: formatToIDR(String(product.price)),
              produkId: product.id
            }
          : item
      )
    );
  };
  // Handle mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load saved state after mounting
  useEffect(() => {
    if (mounted) {
      const savedState = localStorage.getItem('currentOrder');
      if (savedState) {
        const { customerName: savedName, foodItems: savedFood } = JSON.parse(savedState);
        setCustomerName(savedName || '');
        setFoodItems(savedFood || foodItems);
      }
    }
  }, [mounted]);

  // Save current state only after mounting
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('currentOrder', JSON.stringify({
        customerName,
        foodItems,
      }));
    }
  }, [mounted, customerName, foodItems]);

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

  // Update the handlePriceChange function
  const handlePriceChange = (value, id) => {
    // Convert to number immediately
    const numericValue = parseInt(value.replace(/\D/g, '') || 0);
    const formattedPrice = formatToIDR(String(numericValue));
    
    setFoodItems(foodItems.map(item => 
      item.id === id ? { 
        ...item, 
        price: numericValue, // Store as number
        displayPrice: formattedPrice, // Store formatted string separately
        isManualPrice: true
      } : item
    ));
  };

  // Update the calculateTotal function
  const calculateTotal = () => {
    const foodTotal = foodItems.reduce((sum, item) => 
      sum + (typeof item.price === 'number' ? item.price : 0), 0);
    return {
      numericTotal: foodTotal,
      displayTotal: formatToIDR(String(foodTotal))
    };
  };

  // Update the handleSave function
  const handleSave = () => {
    const filteredFoodItems = foodItems.filter(item => item.name && item.name.trim() !== '');
    if (filteredFoodItems.length === 0) {
      alert('Tidak ada menu yang diisi. Silakan tambahkan minimal satu menu.');
      return;
    }

    // Calculate total once
    const totalAmount = filteredFoodItems.reduce((sum, item) => 
      sum + (typeof item.price === 'number' ? item.price : 0), 0);

    const transaction = {
      id: Date.now(),
      customerName,
      date: new Date().toISOString(),
      foodItems: filteredFoodItems.map(item => ({
        ...item,
        price: typeof item.price === 'number' ? item.price : parseInt(item.price.replace(/\D/g, '') || '0'),
        displayPrice: typeof item.price === 'number' ? formatToIDR(String(item.price)) : item.price
      })),
      total: totalAmount, // Store as number
      displayTotal: formatToIDR(String(totalAmount)) // Store formatted string
    };

    console.log('Transaction:', transaction);
    const savedTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    localStorage.setItem('transactions', JSON.stringify([transaction, ...savedTransactions]));
    localStorage.removeItem('currentOrder');
    router.push('/transaksi');
  };

  const handleDelete = (idToDelete) => {
    setFoodItems(prev => {
      const filtered = prev.filter(item => item.id !== idToDelete);
      // Re-number remaining items to prevent ID gaps
      return filtered.map((item, index) => ({
        ...item,
        id: index + 1
      }));
    });
  };

  const addMakanan = () => {
    const nextId = foodItems.length > 0 
      ? Math.max(...foodItems.map(item => item.id)) + 1 
      : 1;
      
    setFoodItems([
      ...foodItems,
      {
        id: nextId,
        name: ``,
        price: 0, // Store as number
        displayPrice: "Rp 0" // Store formatted string
      },
    ]);
  };

  if (!mounted) {
    return <div className="space-y-6 p-6 bg-gray-50 min-h-screen">Loading...</div>;
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      <NamaDanWaktu onNameChange={setCustomerName} />
      
      <div className="max-w-2xl mx-auto">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <span className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
              🍜
            </span>
            Makanan
          </h2>
          <div className="space-y-4">
            {foodItems.map((item) => (
              <motion.div
                key={`food-${item.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-4 rounded-lg shadow-sm border border-gray-100"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <label className="text-gray-600 text-sm font-medium min-w-[100px]">
                      Nama Menu
                    </label>
                    <div className="flex-1 flex items-center gap-2">
                      <SearchProduk
                        initialValue={item.name}
                        onSelect={(product) => handleSelectProduk(product, item.id)}
                      />
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-gray-600 text-sm font-medium min-w-[100px]">
                      Harga
                    </label>
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={item.displayPrice}
                        onChange={(e) => handlePriceChange(e.target.value, item.id)}
                        className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Rp 0"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <button
            onClick={addMakanan}
            className="w-full p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
          >
            + Tambah Makanan
          </button>
        </div>
      </div>

      {/* Total and Save Button */}
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium text-gray-600">Total:</span>
            <span className="text-2xl font-bold text-indigo-600">{calculateTotal().displayTotal}</span>
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={handleSave}
          className="w-full p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center justify-center gap-2 font-medium"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
              clipRule="evenodd" 
            />
          </svg>
          Simpan Transaksi
        </motion.button>
      </div>
    </div>
  );
};

export default InputMenuProduk;
