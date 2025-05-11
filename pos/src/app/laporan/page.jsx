'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@radix-ui/react-dropdown-menu';
import { Avatar } from '@radix-ui/react-avatar';
import { Dialog, DialogTrigger, DialogContent } from '@radix-ui/react-dialog';
import Chart from '../components/chart';

const Laporan = () => {
  const [dataPenjualan, setDataPenjualan] = useState([]);
  const [totalPelanggan, setTotalPelanggan] = useState(0);
  const [filterPeriode, setFilterPeriode] = useState('harian');
  const [menuTerlaris, setMenuTerlaris] = useState([]);
  const [totalPendapatan, setTotalPendapatan] = useState(0);
  const [allTransactions, setAllTransactions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/transactions/');
        const data = await response.json();
        
        if (data && Array.isArray(data)) {
          setAllTransactions(data);
          processData(data, filterPeriode);
          
const menuCounts = data.reduce((acc, transaction) => {
  // Add null coalescing for items array
  (transaction.items ?? []).forEach(item => {
    acc[item.name] = (acc[item.name] || 0) + item.quantity;
  });
  return acc;
}, {});
          
          const menuArray = Object.entries(menuCounts).map(([name, jumlah]) => ({ nama: name, jumlah }));
          setMenuTerlaris(menuArray.sort((a, b) => b.jumlah - a.jumlah).slice(0, 5));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const processData = (transactions, periode) => {
    const now = new Date();
    const filtered = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      const diffTime = now - transactionDate;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      switch(periode) {
        case 'harian': return diffDays <= 1;
        case 'mingguan': return diffDays <= 7;
        case 'bulanan': return diffDays <= 30;
        default: return true;
      }
    });

    const groupedData = filtered.reduce((acc, transaction) => {
      const date = new Date(transaction.date);
      let key;
      
      switch(periode) {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 bg-gray-50 min-h-screen"
    >
      <div className="max-w-6xl mx-auto space-y-8">
        <motion.div className="flex items-center justify-between mb-8">
          <motion.h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            📈 Laporan Penjualan
            <Dialog>
              <DialogTrigger className="text-blue-600 hover:text-blue-700">ℹ️</DialogTrigger>
              <DialogContent className="p-6 bg-white rounded-lg shadow-xl">
                <h3 className="text-lg font-semibold mb-4">Informasi Laporan</h3>
                <p className="text-gray-600">Laporan ini menampilkan statistik penjualan harian, mingguan, dan bulanan.</p>
              </DialogContent>
            </Dialog>
          </motion.h1>
          <Avatar className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center">
            AD
          </Avatar>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} className="bg-white p-4 rounded-xl shadow-sm">
          <DropdownMenu>
            <DropdownMenuTrigger className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
              Filter Periode: {filterPeriode}
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white p-2 rounded-lg shadow-lg mt-2 min-w-[200px]">
              {['harian', 'mingguan', 'bulanan'].map((periode) => (
                <DropdownMenuItem
                  key={periode}
                  onSelect={() => {
                    setFilterPeriode(periode);
                    processData(allTransactions, periode);
                  }}
                  className="px-4 py-2 hover:bg-gray-100 rounded-md cursor-pointer"
                >
                  {periode}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </motion.div>

        <AnimatePresence>
          <motion.div key={filterPeriode} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-gray-500 text-sm mb-2">Total Pendapatan</h3>
              <div className="text-3xl font-bold text-green-600">
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(totalPendapatan)}
              </div>
            </motion.div>

            <motion.div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-gray-500 text-sm mb-2">Total Pelanggan</h3>
              <div className="text-3xl font-bold text-blue-600">{totalPelanggan}</div>
            </motion.div>

            <motion.div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-gray-500 text-sm mb-4">🔥 Menu Terlaris</h3>
              <div className="space-y-3">
                {menuTerlaris.map((menu, index) => (
                  <div key={index} className="flex justify-between items-center px-3 py-2 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">{menu.nama}</span>
                    <span className="font-semibold text-red-600">{menu.jumlah}x</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        <motion.div className="bg-white p-6 rounded-xl shadow-sm">
          <Chart data={dataPenjualan} />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Laporan;