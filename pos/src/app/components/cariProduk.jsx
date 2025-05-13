import React, { useState, useEffect, useRef } from 'react';
import { formatToIDR } from '../utils/formatIdr';



const ProductSearch = ({ onSelect, initialValue = '' }) => {
  const [search, setSearch] = useState(initialValue);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/menu?search=${encodeURIComponent(search)}`);
      const data = await response.json();
      setProducts(data);
      setIsOpen(true);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (search) {
      const debounce = setTimeout(() => {
        searchProducts();
      }, 300);
      return () => clearTimeout(debounce);
    } else {
      setProducts([]);
      setIsOpen(false);
    }
  }, [search]);

  const handleSelectProduct = (product) => {
    setSearch(''); // Reset search input
    setIsOpen(false);
    onSelect && onSelect({
      id: product.id,
      name: product.nama,
      price: product.harga,
      displayPrice: formatToIDR(product.harga)
    });
  };

  const handleKeyDown = (e) => {
    if (!isOpen) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < products.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : 0);
        break;
      case 'Enter':
        e.preventDefault();
        if (products.length > 0) {
          // If no item is selected, use the first item
          const productToSelect = selectedIndex >= 0 ? products[selectedIndex] : products[0];
          handleSelectProduct(productToSelect);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Auto-select first item when products load
  useEffect(() => {
    if (products.length > 0) {
      setSelectedIndex(0); // Always select first item when products change
    }
  }, [products]);

  // Reset selected index when search changes
  useEffect(() => {
    setSelectedIndex(-1);
  }, [search]);

  return (
    <div className="relative w-full max-w-md mx-auto" ref={dropdownRef}>
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari produk..."
          data-menu-search
          className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          onKeyDown={handleKeyDown}
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
          </div>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && search && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
          {products.length > 0 ? (
            <ul className="py-2">
              {products.map((product, index) => (
                <li
                  key={product.id}
                  className={`px-4 py-2 cursor-pointer ${
                    index === selectedIndex ? 'bg-indigo-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleSelectProduct(product)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-gray-800">{product.nama}</h4>
                      <p className="text-sm text-gray-600">{product.deskripsi}</p>
                    </div>
                    <span className="text-blue-600 font-semibold">
                      {formatToIDR(product.harga)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-3 text-gray-500 text-center">
              No products found for "{search}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductSearch;