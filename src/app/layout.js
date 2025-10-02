'use client'
import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import { useState, useEffect } from 'react';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Tutup sidebar saat klik di luar (mobile)
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sidebarOpen && window.innerWidth < 1024) {
        const sidebar = document.querySelector('aside');
        if (sidebar && !sidebar.contains(e.target)) {
          setSidebarOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarOpen]);

  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex h-screen bg-slate-50">
          {/* Sidebar */}
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

          {/* Overlay untuk mobile */}
          {sidebarOpen && window.innerWidth < 1024 && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-30 z-30 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header - hanya di mobile */}
            <header className="lg:hidden bg-white border-b border-slate-200 p-4 flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-700"
                aria-label="Buka menu"
              >
                ☰
              </button>
              <h1 className="text-lg font-bold text-slate-800 ml-3">Productivity</h1>
            </header>

            {/* Konten Halaman */}
            <main className="flex-1 overflow-y-auto">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}