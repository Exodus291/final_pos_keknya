'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

export default function EditTransactionPage() {
  const { id } = useParams()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    customerName: '',
    date: '',
    total: 0,
    foodItems: [],
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!id) return
    fetch(`http://localhost:3001/api/transactions/${id}`)
      .then(res => res.json())
      .then(data => {
        setFormData({
          customerName: data.customerName,
          date: data.date,
          total: data.total,
          foodItems: data.foodItems.map(item => ({
            menuId: item.menuId,
            name: item.name,
            price: item.price,
            quantity: item.quantity
          })),
        })
        setLoading(false)
      })
      .catch(err => {
        console.error('Gagal ambil data transaksi:', err)
        setLoading(false)
      })
  }, [id])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

const handleFoodItemChange = (index, value) => {
  const quantity = Number(value)
  let updatedItems = [...formData.foodItems]

  if (quantity <= 0 || isNaN(quantity)) {
    // Hapus item kalau qty kosong/0
    updatedItems.splice(index, 1)
  } else {
    updatedItems[index].quantity = quantity
  }

  const total = updatedItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
  setFormData({ ...formData, foodItems: updatedItems, total })
}

  const handleDeleteItem = (index) => {
    const updatedItems = [...formData.foodItems]
    updatedItems.splice(index, 1)
    const total = updatedItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
    setFormData({ ...formData, foodItems: updatedItems, total })
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      await fetch(`http://localhost:3001/api/transactions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      router.push('/transaksi')
    } catch (error) {
      console.error('Gagal update transaksi:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
        <div className="text-white text-lg">Memuat...</div>
      </div>
    )
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.3 }}
          className="relative bg-white w-full max-w-3xl rounded-2xl shadow-lg p-6 overflow-y-auto max-h-[90vh]"
        >
          {/* Close Button */}
          <button
            onClick={() => router.push('/transaksi')}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
            aria-label="Tutup"
          >
            ×
          </button>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Edit Transaksi</h2>

          {/* Form */}
          <div className="space-y-6">
            {/* Customer Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Nama Pelanggan</label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Total */}
            <div className="text-lg font-semibold text-gray-700">
              Total: Rp{formData.total.toLocaleString()}
            </div>

            {/* Items */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Item Makanan</h3>
              {formData.foodItems.map((item, index) => (
                <div key={index} className="grid grid-cols-4 gap-4 items-end">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Nama</label>
                    <input
                      type="text"
                      value={item.name}
                      readOnly
                      className="mt-1 w-full p-2 rounded-md bg-gray-100 border"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Harga</label>
                    <input
                      type="number"
                      value={item.price}
                      readOnly
                      className="mt-1 w-full p-2 rounded-md bg-gray-100 border"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Qty</label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleFoodItemChange(index, e.target.value)}
                      className="mt-1 w-full p-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <button
                      onClick={() => handleDeleteItem(index)}
                      className="text-red-600 hover:text-red-800 text-sm mt-6"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-md text-lg font-semibold disabled:bg-gray-400"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
