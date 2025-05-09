'use client';

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import NamaDanWaktu from './NamaDanWaktu';
import SearchProduk from './cariProduk';
import SelectedMenu from './selectedMenu';

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
  const [selectedMenus, setSelectedMenus] = useState([]);

  const handleSelectProduk = (product) => {
    // Check if item already exists
    const existingItem = selectedMenus.find(item => item.name === product.name);
    if (existingItem) {
      alert('Menu ini sudah ditambahkan');
      return;
    }

    setSelectedMenus([...selectedMenus, {
      id: Date.now(),
      name: product.name,
      price: product.price,
      displayPrice: formatToIDR(String(product.price))
    }]);
    
    // Reset the input
    setFoodItems([{ 
      id: 1,
      name: "", 
      price: 0,
      displayPrice: "Rp 0"
    }]);
  };

  const handleDeleteSelected = (id) => {
    setSelectedMenus(selectedMenus.filter(item => item.id !== id));
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
    const total = selectedMenus.reduce((sum, item) => {
      const quantity = item.quantity || 1;
      return sum + (item.price * quantity);
    }, 0);
    
    return {
      numericTotal: total,
      displayTotal: formatToIDR(String(total))
    };
  };

  // Update the handleSave function
  const handleSave = () => {
    if (selectedMenus.length === 0) {
      alert('Tidak ada menu yang dipilih. Silakan pilih minimal satu menu.');
      return;
    }

    const transaction = {
      id: Date.now(),
      customerName,
      date: new Date().toISOString(),
      foodItems: selectedMenus,
      total: calculateTotal().numericTotal,
      displayTotal: calculateTotal().displayTotal
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

  const handleUpdateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setSelectedMenus(prevItems => 
      prevItems.map(item => 
        item.id === itemId 
          ? {
              ...item,
              quantity: newQuantity,
              displayPrice: formatToIDR(String(item.price * newQuantity))
            }
          : item
      )
    );
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
            Pilih Menu
          </h2>

          {/* Single menu input */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <SearchProduk
              initialValue=""
              onSelect={(product) => handleSelectProduk(product)}
            />
          </div>

          {/* Selected Menus */}
          <SelectedMenu items={selectedMenus} onDelete={handleDeleteSelected} onUpdateQuantity={handleUpdateQuantity} />
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
