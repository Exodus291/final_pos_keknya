'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@radix-ui/react-dropdown-menu';
import Chart from '../components/chart';

const Laporan = () => {
  const [dataPenjualan, setDataPenjualan] = useState([]);
  const [totalPelanggan, setTotalPelanggan] = useState(0);
  const [filterPeriode, setFilterPeriode] = useState('harian');
  const [menuTerlaris, setMenuTerlaris] = useState([]);
  const [totalPendapatan, setTotalPendapatan] = useState(0);
  const [allTransactions, setAllTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
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
          </motion.h1>
        </motion.div>

        <motion.div className="bg-white p-4 rounded-xl shadow-sm">
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
          </motion.div>
        </AnimatePresence>

        <motion.div className="bg-white p-6 rounded-xl shadow-sm">
          <Chart data={dataPenjualan} />
        </motion.div>

        <motion.div className="space-y-4">
          <h2 className="text-xl font-semibold">Detail Transaksi</h2>
          {loading ? (
            <p className="text-gray-500">Memuat data...</p>
          ) : allTransactions.length === 0 ? (
            <p className="text-gray-500">Tidak ada transaksi.</p>
          ) : (
            allTransactions
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
                <div key={index} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <p className="text-sm text-gray-500">Tanggal: {formatDate(tx.date)}</p>
                  <p className="font-semibold">Customer: {tx.customerName || '-'}</p>
                  <p className="text-sm">Jam: {formatTime(tx.date)}</p>
                  <p className="text-sm font-medium text-green-600 mt-1">
                    Total: Rp {parseInt(tx.total).toLocaleString()}
                  </p>
                </div>
              ))
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Laporan;
