"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const NamaDanWaktu = ({ onNameChange }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [nama, setNama] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!mounted) return null;

  const formatTime = (date) => {
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleNameChange = (e) => {
    const newName = e.target.value;
    setNama(newName);
    onNameChange(newName);
  };

  return (
    <div className="max-w-6xl mx-auto mb-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <label htmlFor="nama" className="block text-sm font-medium text-gray-700 mb-1">
                Nama Pelanggan
              </label>
              <input
                id="nama"
                type="text"
                value={nama}
                onChange={handleNameChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all duration-200"
                placeholder="Masukkan nama pelanggan"
              />
            </div>
            <div className="flex flex-col items-end">
              <div className="text-sm text-gray-500">{formatDate(currentTime)}</div>
              <div className="text-2xl font-semibold text-gray-800">{formatTime(currentTime)}</div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default NamaDanWaktu;
