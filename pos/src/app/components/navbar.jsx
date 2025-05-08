"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeItem, setActiveItem] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const menuItems = [
    { title: "Home", href: "/" },
    { title: "Transaksi", href: "/transaksi" },
    { title: "Produk", href: "/Produk" },
    { title: "Laporan", href: "/reports" },
  ];

  const menuVariants = {
    open: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.3,
        ease: "easeOut",
        staggerChildren: 0.1,
        when: "beforeChildren"
      }
    },
    closed: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3,
        ease: "easeIn",
        staggerChildren: 0.05,
        staggerDirection: -1,
        when: "afterChildren"
      }
    }
  };

  const itemVariants = {
    open: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    closed: {
      opacity: 0,
      x: -20,
      transition: {
        duration: 0.3,
        ease: "easeIn"
      }
    }
  };

  if (!mounted) return null;

  return (
    <div className="relative z-50">
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo Section */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600">
                  Emilia Cantik
                </span>
              </Link>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-4">
              {menuItems.map((item) => (
                <motion.div
                  key={item.title}
                  className="relative"
                  onHoverStart={() => setActiveItem(item.title)}
                  onHoverEnd={() => setActiveItem(null)}
                >
                  <Link
                    href={item.href}
                    className="px-3 py-2 text-gray-600 text-sm font-medium"
                  >
                    {item.title}
                  </Link>
                  <motion.div 
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-600 to-indigo-600"
                    initial={{ scaleX: 0, originX: 0 }}
                    animate={{ 
                      scaleX: activeItem === item.title ? 1 : 0
                    }}
                    transition={{ 
                      duration: 0.2,
                      ease: "easeInOut"
                    }}
                  />
                </motion.div>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-lg text-gray-600"
              >
                <span className="sr-only">Open main menu</span>
                <div className="w-6 h-6 flex flex-col justify-around">
                  <span className="h-0.5 w-full bg-current transform transition-all duration-300" />
                  <span className="h-0.5 w-full bg-current transition-all duration-300" />
                  <span className="h-0.5 w-full bg-current transform transition-all duration-300" />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu - Updated with animations */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={menuVariants}
              className="md:hidden overflow-hidden bg-white/80 backdrop-blur-lg border-t border-gray-100"
            >
              <div className="px-2 pt-2 pb-3 space-y-1">
                {menuItems.map((item) => (
                  <motion.div
                    key={item.title}
                    variants={itemVariants}
                    className="relative"
                  >
                    <Link
                      href={item.href}
                      className="block px-4 py-3 text-base font-medium text-gray-600 hover:text-indigo-600 transition-colors duration-200"
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="flex items-center justify-between">
                        <span>{item.title}</span>
                        <motion.div
                          className="h-0.5 absolute bottom-2 left-4 right-4 bg-gradient-to-r from-violet-600 to-indigo-600"
                          initial={{ scaleX: 0, originX: 0 }}
                          whileHover={{ scaleX: 1 }}
                          transition={{ duration: 0.2, ease: "easeInOut" }}
                        />
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
      <div className="h-16" />
    </div>
  );
};

export default NavBar;