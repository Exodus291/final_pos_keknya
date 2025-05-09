"use client"

import { useState, useEffect } from 'react'
import axios from 'axios'

function App() {
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/api/menu${search ? `?search=${search}` : ''}`)
      setProducts(response.data)
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post('http://localhost:3001/api/menu', {
        nama: name,
        harga: parseFloat(price)
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      setName('')
      setPrice('')
      fetchProducts()
    } catch (error) {
      console.error('Error creating product:', error.response?.data || error.message)
      alert('Failed to create product. Please check the console for details.')
    }
  }

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3001/api/menu/${id}`)
      fetchProducts()
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [search])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Product Management</h1>
      
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-4 mb-8">
        <input
          type="text"
          placeholder="Product name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button 
          type="submit"
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Add Product
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{product.nama}</h3>
            <p className="text-gray-600 mb-4">Rp {product.harga.toLocaleString()}</p>
            <button 
              onClick={() => handleDelete(product.id)}
              className="w-full px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
