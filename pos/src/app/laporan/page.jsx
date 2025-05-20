'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from '@radix-ui/react-dropdown-menu';
import Chart from '../components/chart';
import { ArrowUp, Users, DollarSign, Calendar, Filter, RefreshCcw } from 'lucide-react';

const Laporan = () => {
  const [dataPenjualan, setDataPenjualan] = useState([]);
  const [totalPelanggan, setTotalPelanggan] = useState(0);
  const [filterPeriode, setFilterPeriode] = useState('harian');
  const [totalPendapatan, setTotalPendapatan] = useState(0);
  const [allTransactions, setAllTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const response = await fetch('http://localhost:3001/api/transactions/final');
      const data = await response.json();

      if (data && Array.isArray(data)) {
        setAllTransactions(data);
        processData(data, filterPeriode);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const processData = (transactions, periode) => {
    const now = new Date();
    const filtered = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      const diffTime = now - transactionDate;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      switch (periode) {
        case 'harian': return diffDays <= 1;
        case 'mingguan': return diffDays <= 7;
        case 'bulanan': return diffDays <= 30;
        default: return true;
      }
    });

    const groupedData = filtered.reduce((acc, transaction) => {
      const date = new Date(transaction.date);
      let key;

      switch (periode) {
        case 'harian': key = date.toLocaleDateString(); break;
        case 'mingguan': key = `Week ${getWeekNumber(date)}`; break;
        case 'bulanan': key = date.toLocaleString('default', { month: 'long' }); break;
      }

      acc[key] = acc[key] || { totalAmount: 0, count: 0 };
      acc[key].totalAmount += transaction.total || 0;
      acc[key].count++;
      return acc;
    }, {});

    const chartData = Object.entries(groupedData).map(([date, values]) => ({
      date,
      totalAmount: values.totalAmount,
      count: values.count
    }));

    setDataPenjualan(chartData);
    setTotalPelanggan(filtered.length);
    setTotalPendapatan(chartData.reduce((sum, item) => sum + item.totalAmount, 0));
  };

  const getWeekNumber = (d) => {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  };

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('id-ID');
  };

  // Card variants for animation
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  // List item variants for staggered animation
  const listVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } }
  };

  // Filter button animation
  const filterButtonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95, transition: { duration: 0.1 } }
  };

  // Stat counter animation
  const counterVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 md:p-8 bg-gradient-to-br from-blue-50 to-gray-50 min-h-screen"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        <motion.div 
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.h1 
            className="text-3xl font-bold text-gray-900 flex items-center gap-3"
            whileHover={{ scale: 1.02 }}
          >
            <motion.span
              animate={{ rotate: [0, 15, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
            >
              📈
            </motion.span> 
            <span>Laporan Penjualan</span>
          </motion.h1>
          
          <motion.button
            className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors self-start"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchData}
            disabled={refreshing}
          >
            <motion.div
              animate={refreshing ? { rotate: 360 } : {}}
              transition={{ duration: 1, repeat: refreshing ? Infinity : 0, ease: "linear" }}
            >
              <RefreshCcw size={18} />
            </motion.div>
            {refreshing ? "Memperbarui..." : "Perbarui Data"}
          </motion.button>
        </motion.div>

        <motion.div 
          className="bg-white p-4 rounded-xl shadow-md border border-gray-100"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.button 
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  variants={filterButtonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Filter size={16} />
                  <span>Filter: {filterPeriode.charAt(0).toUpperCase() + filterPeriode.slice(1)}</span>
                </motion.button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white p-2 rounded-lg shadow-lg mt-2 min-w-[200px] border border-gray-100 z-50">
                {['harian', 'mingguan', 'bulanan'].map((periode) => (
                  <DropdownMenuItem
                    key={periode}
                    onSelect={() => {
                      setFilterPeriode(periode);
                      processData(allTransactions, periode);
                    }}
                    className="px-4 py-2 hover:bg-gray-100 rounded-md cursor-pointer flex items-center gap-2"
                  >
                    <Calendar size={16} />
                    <span>{periode.charAt(0).toUpperCase() + periode.slice(1)}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <motion.div 
              className="text-sm text-gray-500 flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Calendar size={16} />
              <span>Laporan {filterPeriode} terakhir</span>
            </motion.div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div 
            key={filterPeriode} 
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: 20, transition: { duration: 0.3 } }}
          >
            <motion.div 
              className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500"
              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-gray-500 text-sm mb-1">Total Pendapatan</h3>
                  <motion.div 
                    className="text-3xl font-bold text-green-600"
                    variants={counterVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(totalPendapatan)}
                  </motion.div>
                </div>
                <motion.div 
                  className="bg-green-100 p-3 rounded-full"
                  whileHover={{ rotate: 15 }}
                >
                  <DollarSign size={24} className="text-green-600" />
                </motion.div>
              </div>
              
              <motion.div 
                className="mt-4 flex items-center gap-1 text-xs text-green-600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <ArrowUp size={16} />
                <span>Periode {filterPeriode}</span>
              </motion.div>
            </motion.div>

            <motion.div 
              className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500"
              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-gray-500 text-sm mb-1">Total Pelanggan</h3>
                  <motion.div 
                    className="text-3xl font-bold text-blue-600"
                    variants={counterVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {totalPelanggan}
                  </motion.div>
                </div>
                <motion.div 
                  className="bg-blue-100 p-3 rounded-full"
                  whileHover={{ rotate: 15 }}
                >
                  <Users size={24} className="text-blue-600" />
                </motion.div>
              </div>
              
              <motion.div 
                className="mt-4 flex items-center gap-1 text-xs text-blue-600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <ArrowUp size={16} />
                <span>Periode {filterPeriode}</span>
              </motion.div>
            </motion.div>
            
            <motion.div 
              className="bg-white p-6 rounded-xl shadow-md border-l-4 border-purple-500"
              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-gray-500 text-sm mb-1">Rata-rata Transaksi</h3>
                  <motion.div 
                    className="text-3xl font-bold text-purple-600"
                    variants={counterVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {totalPelanggan ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(totalPendapatan / totalPelanggan) : "Rp 0"}
                  </motion.div>
                </div>
                <motion.div 
                  className="bg-purple-100 p-3 rounded-full"
                  whileHover={{ rotate: 15 }}
                >
                  <DollarSign size={24} className="text-purple-600" />
                </motion.div>
              </div>
              
              <motion.div 
                className="mt-4 flex items-center gap-1 text-xs text-purple-600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <ArrowUp size={16} />
                <span>Per pelanggan</span>
              </motion.div>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        <motion.div 
          className="bg-white p-6 rounded-xl shadow-md border border-gray-100"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.5 }}
            >
              📊
            </motion.span> 
            Grafik Penjualan
          </h2>
          <Chart data={dataPenjualan} />
        </motion.div>

        <motion.div 
          className="space-y-4"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.6 }}
            >
              📝
            </motion.span> 
            Detail Transaksi
          </h2>
          
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <motion.div 
                className="w-10 h-10 border-4 border-blue-200 border-t-blue-500 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            </div>
          ) : allTransactions.length === 0 ? (
            <motion.div 
              className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-gray-500">Tidak ada transaksi untuk ditampilkan.</p>
            </motion.div>
          ) : (
            <motion.div
              className="space-y-3"
              variants={listVariants}
              initial="hidden"
              animate="visible"
            >
              {allTransactions
                .filter((tx) => {
                  const date = new Date(tx.date);
                  const now = new Date();
                  const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
                  if (filterPeriode === 'harian') return diff <= 1;
                  if (filterPeriode === 'mingguan') return diff <= 7;
                  if (filterPeriode === 'bulanan') return diff <= 30;
                  return true;
                })
                .map((tx, index) => (
                  <motion.div
                    key={index}
                    className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                    variants={itemVariants}
                    whileHover={{ 
                      y: -2, 
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                      borderColor: "#e5e7eb" 
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">
                            {formatDate(tx.date)}
                          </span>
                          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                            {formatTime(tx.date)}
                          </span>
                        </div>
                        <p className="font-semibold text-lg mt-2">{tx.customerName || 'Pelanggan'}</p>
                      </div>
                      <p className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
                        Rp {parseInt(tx.total).toLocaleString()}
                      </p>
                    </div>
                    
                    <motion.div 
                      className="w-full bg-gray-100 h-1 mt-3 rounded-full overflow-hidden"
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ delay: 0.5 + (index * 0.1), duration: 0.8 }}
                    >
                      <motion.div 
                        className="bg-blue-500 h-full"
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ delay: 0.5 + (index * 0.1), duration: 0.8 }}
                      />
                    </motion.div>
                  </motion.div>
                ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Laporan;