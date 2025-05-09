import React, { useState } from 'react';
import SelectedMenu from './selectedMenu';

const MenuInput = () => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [inputItem, setInputItem] = useState({
    name: '',
    price: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputItem(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputItem.name || !inputItem.price) return;

    const newItem = {
      id: Date.now(),
      name: inputItem.name,
      price: parseFloat(inputItem.price),
      quantity: 1,
      displayPrice: `Rp ${parseFloat(inputItem.price).toLocaleString()}`
    };

    setSelectedItems(prev => [...prev, newItem]);
    setInputItem({ name: '', price: '' });
  };

  const handleUpdateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setSelectedItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId 
          ? {
              ...item,
              quantity: newQuantity,
              displayPrice: `Rp ${(item.price * newQuantity).toLocaleString()}`
            }
          : item
      )
    );
  };

  const handleDeleteItem = (itemId) => {
    setSelectedItems(prev => prev.filter(item => item.id !== itemId));
  };

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex gap-4">
          <input
            type="text"
            name="name"
            value={inputItem.name}
            onChange={handleInputChange}
            placeholder="Nama Menu"
            className="p-2 border rounded"
          />
          <input
            type="number"
            name="price"
            value={inputItem.price}
            onChange={handleInputChange}
            placeholder="Harga"
            className="p-2 border rounded"
          />
          <button 
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Tambah
          </button>
        </div>
      </form>

      <SelectedMenu 
        items={selectedItems}
        onDelete={handleDeleteItem}
        onUpdateQuantity={handleUpdateQuantity}
      />
    </div>
  );
};

export default MenuInput;