// src/components/Sidebar.js
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  { name: 'Kalender', href: '/calendar', icon: '🗓️' },
  { name: 'Whiteboard', href: '/whiteboard', icon: '🎨' },
  { name: 'Ice Breaker Games', href: '/icebreaker', icon: '🎮' },
];

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();

  // Tutup sidebar saat ukuran layar berubah ke desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        onClose(); // Tutup saat jadi desktop
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [onClose]);

  return (
    <aside 
      className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="h-full flex flex-col">
        {/* Header Sidebar */}
        <div className="p-5 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-slate-800">🛠️ Productivity</h1>
            <p className="text-xs text-slate-500 mt-1">Semua alat dalam satu tempat</p>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-700"
            aria-label="Tutup menu"
          >
            ✕
          </button>
        </div>

        {/* Navigasi */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose} // Tutup saat klik di mobile
                  className={`flex items-center gap-3 w-full p-3 rounded-lg transition ${
                    pathname === item.href
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 text-xs text-slate-500">
          Productivity Suite v1.0
        </div>
      </div>
    </aside>
  );
}