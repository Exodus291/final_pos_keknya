'use client'

import { useState, useEffect } from 'react'


export default function ProductPage() {
    const [products, setProducts] = useState([])
    const [name, setName] = useState('')
    const [price, setPrice] = useState('')
    const [editingId, setEditingId] = useState(null)

    // Fetch products
    useEffect(() => {
        fetchProducts()
    }, [])

    const fetchProducts = async () => {
        const response = await fetch('/api/products')
        const data = await response.json()
        setProducts(data)
    }

    // Create or update product
    const handleSubmit = async (e) => {
        e.preventDefault()
        
        if (editingId) {
            // Update
            await fetch(`/api/products/${editingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, price: parseFloat(price) })
            })
        } else {
            // Create
            await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, price: parseFloat(price) })
            })
        }

        // Reset form and refresh products
        setName('')
        setPrice('')
        setEditingId(null)
        fetchProducts()
    }

    // Delete product
    const handleDelete = async (id) => {
        await fetch(`/api/products/${id}`, {
            method: 'DELETE'
        })
        fetchProducts()
    }

    // Set up edit mode
    const handleEdit = (product) => {
        setEditingId(product.id)
        setName(product.name)
        setPrice(product.price.toString())
    }

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6">Manajemen Produk</h1>

            <form onSubmit={handleSubmit} className="mb-8">
                <div className="flex gap-4 mb-4">
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nama Produk"
                        className="border p-2 rounded"
                        required
                    />
                    <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="Harga"
                        className="border p-2 rounded"
                        required
                    />
                    <button 
                        type="submit"
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                    >
                        {editingId ? 'Update' : 'Tambah'} Produk
                    </button>
                </div>
            </form>

            <div className="grid gap-4">
                {products.map((product) => (
                    <div key={product.id} className="border p-4 rounded flex justify-between items-center">
                        <div>
                            <h3 className="font-bold">{product.name}</h3>
                            <p>Rp {product.price.toLocaleString()}</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleEdit(product)}
                                className="bg-yellow-500 text-white px-3 py-1 rounded"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => handleDelete(product.id)}
                                className="bg-red-500 text-white px-3 py-1 rounded"
                            >
                                Hapus
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}