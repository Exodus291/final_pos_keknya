'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, X, Save, ShoppingBag } from 'lucide-react'
import SearchProduk from '../../../components/cariProduk' // Import SearchProduk component

export default function EditTransactionPage() {
  const { id } = useParams()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [menuOptions, setMenuOptions] = useState([])
  const [formData, setFormData] = useState({
    customerName: '',
    date: '',
    total: 0,
    foodItems: [],
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return
    
    const fetchTransaction = async () => {
      try {
        const res = await fetch(`https://benyanjir-production.up.railway.app/api/transactions/${id}`)
        
        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`)
        }
        
        const data = await res.json()
        
        // Ensure data has all required properties
        const safeData = {
          customerName: data?.customerName || '',
          date: data?.date || '',
          total: data?.total || 0,
          foodItems: Array.isArray(data?.foodItems) ? data.foodItems.map(item => ({
            menuId: item?.menuId || '',
            name: item?.name || '',
            price: item?.price || 0,
            quantity: item?.quantity || 0
          })) : []
        }
        
        setFormData(safeData)
      } catch (err) {
        console.error('Failed to fetch transaction:', err)
        setError('Gagal memuat data transaksi. Silakan coba lagi.')
      } finally {
        setLoading(false)
      }
    }
    
    fetchTransaction()
  }, [id])

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const res = await fetch('https://benyanjir-production.up.railway.app/api/menu')
        
        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`)
        }
        
        const data = await res.json()
        setMenuOptions(data)
      } catch (err) {
        console.error('Failed to fetch menu items:', err)
        // Not setting error here as SearchProduk likely handles its own errors
      }
    }
    
    fetchMenuItems()
  }, [])

  const calculateTotal = (items) => {
    if (!items || !Array.isArray(items)) return 0;
    return items.reduce((acc, item) => {
      const price = item.price || 0;
      const quantity = item.quantity || 0;
      return acc + price * quantity;
    }, 0);
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleFoodItemChange = (index, value) => {
    const quantity = Number(value)
    let updatedItems = [...formData.foodItems]

    if (quantity <= 0 || isNaN(quantity)) {
      updatedItems.splice(index, 1)
    } else {
      updatedItems[index].quantity = quantity
    }

    const total = calculateTotal(updatedItems)
    setFormData({ ...formData, foodItems: updatedItems, total })
  }

  const handleDeleteItem = (index) => {
    const updatedItems = [...formData.foodItems]
    updatedItems.splice(index, 1)
    const total = calculateTotal(updatedItems)
    setFormData({ ...formData, foodItems: updatedItems, total })
  }

  const handleSelectProduk = (product) => {
    if (!product) return;
    
    const existIndex = formData.foodItems.findIndex(item => item.menuId === product.id);
    let updatedItems = [...formData.foodItems];

    if (existIndex >= 0) {
      // If item already exists, increase quantity by 1
      updatedItems[existIndex].quantity += 1;
    } else {
      // If item doesn't exist, add it with quantity 1
      updatedItems.push({
        menuId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
      });
    }

    const total = calculateTotal(updatedItems);
    setFormData({ ...formData, foodItems: updatedItems, total });
  }

  const handleSubmit = async () => {
    if (formData.foodItems.length === 0) {
      setError('Transaksi harus memiliki minimal satu item makanan.')
      return
    }
    
    if (!formData.customerName.trim()) {
      setError('Nama pelanggan tidak boleh kosong.')
      return
    }
    
    setError(null)
    setIsSubmitting(true)
    
    try {
      const res = await fetch(`https://benyanjir-production.up.railway.app/api/transactions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`)
      }
      
      router.push('/transaksi')
    } catch (error) {
      console.error('Failed to update transaction:', error)
      setError('Gagal menyimpan transaksi. Silakan coba lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 flex items-center space-x-4">
          <div className="w-6 h-6 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-gray-800 font-medium">Memuat data transaksi...</div>
        </div>
      </div>
    )
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.3 }}
          className="relative bg-white w-full max-w-3xl rounded-2xl shadow-xl p-6 overflow-y-auto max-h-[90vh]"
        >
          {/* Close Button */}
          <button
            onClick={() => router.push('/transaksi')}
            className="absolute top-4 right-4 flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            aria-label="Tutup"
          >
            <X size={18} />
          </button>

          {/* Title */}
          <div className="flex items-center mb-6 border-b pb-4">
            <ShoppingBag className="text-indigo-600 mr-3" size={24} />
            <h2 className="text-2xl font-bold text-gray-800">Edit Transaksi</h2>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
              <div className="mr-2">⚠️</div>
              <div>{error}</div>
            </div>
          )}

          {/* Form */}
          <div className="space-y-6">
            {/* Customer Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Pelanggan</label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                placeholder="Masukkan nama pelanggan"
              />
            </div>

            {/* Tambah Makanan */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <SearchProduk
                initialValue=""
                onSelect={(product) => handleSelectProduk(product)}
              />
            </div>

            {/* Items */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <ShoppingBag size={18} className="mr-2 text-indigo-600" /> Daftar Item ({formData.foodItems.length})
              </h3>
              
              {formData.foodItems.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <p className="text-gray-500">Belum ada item. Silakan tambahkan menu dari pilihan di atas.</p>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                  <div className="grid grid-cols-12 gap-4 items-center bg-gray-100 p-3 text-sm font-medium text-gray-700">
                    <div className="col-span-5">Nama Item</div>
                    <div className="col-span-3">Harga</div>
                    <div className="col-span-2">Jumlah</div>
                    <div className="col-span-2 text-right">Aksi</div>
                  </div>
                  
                  {formData.foodItems.map((item, index) => (
                    <div 
                      key={index} 
                      className={`grid grid-cols-12 gap-4 items-center p-3 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                    >
                      <div className="col-span-5 font-medium text-gray-800">{item.name || 'Tidak ada nama'}</div>
                      <div className="col-span-3 text-gray-600">Rp{item.price ? item.price.toLocaleString('id-ID') : '0'}</div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleFoodItemChange(index, e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div className="col-span-2 text-right">
                        <button
                          onClick={() => handleDeleteItem(index)}
                          className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors"
                          aria-label="Hapus item"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  <div className="bg-indigo-50 p-4 flex justify-between items-center">
                    <div className="font-medium text-gray-700">Total Transaksi</div>
                    <div className="text-xl font-bold text-indigo-700">
                      Rp{formData.total ? formData.total.toLocaleString('id-ID') : '0'}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg text-lg font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save size={20} className="mr-2" /> Simpan Perubahan
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}