import React, { useState, useEffect, useRef } from 'react';

const ProductSearch = ({ onSelect, initialValue = '' }) => {
  const [search, setSearch] = useState(initialValue);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isSelected, setIsSelected] = useState(false);
  const dropdownRef = useRef(null);

  const formatToIDR = (value) => {
    const number = parseInt(value, 10);
    if (isNaN(number)) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(number).replace('IDR', 'Rp');
  };

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
    if (isSelected) return; // Don't search if item is already selected
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
    setSearch(product.nama);
    setIsOpen(false);
    setIsSelected(true);
    onSelect && onSelect({
      id: product.id,
      name: product.nama,
      price: product.harga,
      displayPrice: formatToIDR(product.harga)
    });
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    if (isSelected) {
      setIsSelected(false); // Reset selection when user types
    }
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
        if (selectedIndex >= 0 && products[selectedIndex]) {
          handleSelectProduct(products[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

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
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Cari produk..."
          className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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