'use client';

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import NamaDanWaktu from './NamaDanWaktu';

const InputMenuProduk = () => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [foodItems, setFoodItems] = useState([
    { 
      id: 1,
      name: "Seblak 1", 
      price: "Rp 0" 
    }
  ]);
  const [drinkItems, setDrinkItems] = useState([
    {
      id: 1,
      name: "Minuman 1",
      price: "Rp 0"
    }
  ]);

  // Handle mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load saved state after mounting
  useEffect(() => {
    if (mounted) {
      const savedState = localStorage.getItem('currentOrder');
      if (savedState) {
        const { customerName: savedName, foodItems: savedFood, drinkItems: savedDrink } = JSON.parse(savedState);
        setCustomerName(savedName || '');
        setFoodItems(savedFood || foodItems);
        setDrinkItems(savedDrink || drinkItems);
      }
    }
  }, [mounted]);

  // Save current state only after mounting
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('currentOrder', JSON.stringify({
        customerName,
        foodItems,
        drinkItems
      }));
    }
  }, [mounted, customerName, foodItems, drinkItems]);

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

  const handlePriceChange = (value, id, isFood) => {
    const numericValue = value.replace(/\D/g, '');
    const formattedPrice = formatToIDR(numericValue);
    
    if (isFood) {
      setFoodItems(foodItems.map(item => 
        item.id === id ? { ...item, price: formattedPrice } : item
      ));
    } else {
      setDrinkItems(drinkItems.map(item => 
        item.id === id ? { ...item, price: formattedPrice } : item
      ));
    }
  };

  const calculateTotal = () => {
    const foodTotal = foodItems.reduce((sum, item) => 
      sum + parseInt(item.price.replace(/\D/g, '') || 0), 0);
    const drinkTotal = drinkItems.reduce((sum, item) => 
      sum + parseInt(item.price.replace(/\D/g, '') || 0), 0);
    return formatToIDR(String(foodTotal + drinkTotal));
  };

  const addMakanan = () => {
    const newId = foodItems.length + 1;
    setFoodItems([
      ...foodItems,
      {
        id: newId,
        name: `Seblak ${newId}`,
        price: "Rp 0",
      },
    ]);
  };

  const addMinuman = () => {
    const newId = drinkItems.length + 1;
    setDrinkItems([
      ...drinkItems,
      {
        id: newId,
        name: `Minuman ${newId}`,
        price: "Rp 0",
      },
    ]);
  };

  const handleSave = () => {
    const transaction = {
      id: Date.now(),
      customerName,
      date: new Date().toISOString(),
      foodItems,
      drinkItems,
      total: calculateTotal()
    };

    const savedTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    localStorage.setItem('transactions', JSON.stringify([transaction, ...savedTransactions]));
    localStorage.removeItem('currentOrder');
    router.push('/transaksi');
  };

  if (!mounted) {
    return <div className="space-y-6 p-6 bg-gray-50 min-h-screen">Loading...</div>;
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      <NamaDanWaktu onNameChange={setCustomerName} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
        {/* Kolom Makanan */}
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
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) =>
                        setFoodItems(
                          foodItems.map((m) =>
                            m.id === item.id ? { ...m, name: e.target.value } : m
                          )
                        )
                      }
                      className="flex-1 p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-gray-600 text-sm font-medium min-w-[100px]">
                      Harga
                    </label>
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={item.price}
                        onChange={(e) => handlePriceChange(e.target.value, item.id, true)}
                        className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="0"
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

        {/* Kolom Minuman */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              🥤
            </span>
            Minuman
          </h2>
          <div className="space-y-4">
            {drinkItems.map((item) => (
              <motion.div
                key={`drink-${item.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-4 rounded-lg shadow-sm border border-gray-100"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <label className="text-gray-600 text-sm font-medium min-w-[100px]">
                      Nama Menu
                    </label>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) =>
                        setDrinkItems(
                          drinkItems.map((m) =>
                            m.id === item.id ? { ...m, name: e.target.value } : m
                          )
                        )
                      }
                      className="flex-1 p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-gray-600 text-sm font-medium min-w-[100px]">
                      Harga
                    </label>
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={item.price}
                        onChange={(e) => handlePriceChange(e.target.value, item.id, false)}
                        className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <button
            onClick={addMinuman}
            className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            + Tambah Minuman
          </button>
        </div>
      </div>

      {/* Total and Save Button */}
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium text-gray-600">Total:</span>
            <span className="text-2xl font-bold text-indigo-600">{calculateTotal()}</span>
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
