'use client';

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import NamaDanWaktu from './NamaDanWaktu';
import SearchProduk from './cariProduk';
import SelectedMenu from './selectedMenu';
import { formatToIDR } from "../utils/formatIdr";

const InputMenuProduk = () => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
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
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSelectProduk = (product) => {
    const existingItem = selectedMenus.find(item => item.name === product.name);
    if (existingItem) {
      alert('Menu ini sudah ditambahkan');
      return;
    }

    setSelectedMenus([...selectedMenus, {
      id: product.id, // Use the actual menu ID from database
      name: product.name,
      price: Number(product.price),
      displayPrice: formatToIDR(String(product.price)),
      quantity: 1
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
  const handleSave = async () => {
    if (selectedMenus.length === 0) {
      alert('Tidak ada menu yang dipilih. Silakan pilih minimal satu menu.');
      return;
    }

    setIsSaving(true);
    try {
      // Format the transaction data to match backend controller
      const transaction = {
        customerName: customerName || 'Guest',
        date: new Date().toISOString(),
        total: calculateTotal().numericTotal,
        foodItems: selectedMenus.map(item => ({
          id: item.id,          // This is menuId in the database
          name: item.name,
          price: Number(item.price),
          quantity: Number(item.quantity || 1)
        }))
      };
      
      const response = await fetch('http://localhost:3001/api/transactions/pending', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transaction)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error details:', errorData);
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();

      // Show success animation
      setShowSuccess(true);
      
      // Reset states after successful save
      setSelectedMenus([]);
      setCustomerName('');
      localStorage.removeItem('currentOrder');
      
      // Wait for animation before redirecting
      setTimeout(() => {
        router.push('/transaksi');
      }, 1500);

    } catch (error) {
      console.error('Transaction error:', error);
      alert(`Gagal menyimpan transaksi: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
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
      {/* Success Overlay */}
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-green-50/90 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-2xl p-6 shadow-lg flex flex-col items-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4"
            >
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
            <h3 className="text-lg font-medium text-gray-900">Transaksi Berhasil!</h3>
            <p className="text-sm text-gray-500 mt-1">Mengalihkan ke halaman transaksi...</p>
          </motion.div>
        </motion.div>
      )}
      
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
          whileHover={{ scale: isSaving ? 1 : 1.01 }}
          whileTap={{ scale: isSaving ? 1 : 0.99 }}
          onClick={handleSave}
          disabled={isSaving}
          className={`w-full p-4 ${
            isSaving ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
          } text-white rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 font-medium`}
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Menyimpan...</span>
            </>
          ) : (
            <>
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
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
};

export default InputMenuProduk;
