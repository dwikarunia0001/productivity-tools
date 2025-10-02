// src/components/Calendar.js
'use client';

import { useState, useEffect } from 'react';
import useCalendarStore from '@/lib/useCalendarStore';

export default function Calendar({ onDateClick, hasReminder }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { getEventsByDate } = useCalendarStore();

  const today = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Dapatkan nama bulan dan tahun
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  // Dapatkan jumlah hari dalam bulan
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Dapatkan hari pertama dalam bulan (0 = Minggu, 1 = Senin, ...)
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  // Isi array dengan hari kosong di awal
  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  // Format tanggal menjadi string ISO pendek: "YYYY-MM-DD"
  const formatDate = (day) => {
    if (!day) return '';
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  // Cek apakah tanggal ini punya reminder
  const dateHasReminder = (day) => {
    if (!day) return false;
    const dateStr = formatDate(day);
    return getEventsByDate(dateStr).some(event => 
      event.type === 'agenda' && event.reminderTime
    );
  };

  // Cek apakah tanggal ini punya agenda (untuk styling)
  const dateHasAgenda = (day) => {
    if (!day) return false;
    const dateStr = formatDate(day);
    return getEventsByDate(dateStr).some(event => event.type === 'agenda');
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header Kalender */}
      <div className="flex justify-between items-center p-4 border-b">
        <button
          onClick={() => setCurrentDate(new Date(year, month - 1))}
          className="p-2 hover:bg-slate-100 rounded"
        >
          &larr;
        </button>
        <h2 className="font-bold text-slate-800">
          {monthNames[month]} {year}
        </h2>
        <button
          onClick={() => setCurrentDate(new Date(year, month + 1))}
          className="p-2 hover:bg-slate-100 rounded"
        >
          &rarr;
        </button>
      </div>

      {/* Hari dalam Minggu */}
      <div className="grid grid-cols-7 text-center text-xs font-medium text-slate-500 bg-slate-50 py-2">
        {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(day => (
          <div key={day}>{day}</div>
        ))}
      </div>

      {/* Tanggal */}
      <div className="grid grid-cols-7">
        {calendarDays.map((day, index) => {
          if (day === null) {
            return <div key={index} className="h-20 border-r border-b border-slate-100"></div>;
          }

          const dateStr = formatDate(day);
          const isToday = 
            today.getDate() === day && 
            today.getMonth() === month && 
            today.getFullYear() === year;

          const hasAgenda = dateHasAgenda(day);
          const hasRem = dateHasReminder(day);

          return (
            <div
              key={index}
              onClick={() => onDateClick(dateStr)}
              className={`
                h-20 border-r border-b border-slate-100 p-1 cursor-pointer
                hover:bg-slate-50 relative
                ${isToday ? 'bg-blue-50' : ''}
              `}
            >
              <div className="flex justify-between items-start">
                <span
                  className={`text-sm ${
                    isToday ? 'font-bold text-blue-700' : 'text-slate-700'
                  }`}
                >
                  {day}
                </span>
                {hasRem && (
                  <span className="text-red-500 text-xs">🔔</span>
                )}
              </div>
              {hasAgenda && (
                <div className="mt-1 flex flex-wrap gap-0.5">
                  {getEventsByDate(dateStr)
                    .filter(e => e.type === 'agenda')
                    .slice(0, 2) // maks 2 dot
                    .map((event, i) => {
                      let dotColor = 'bg-gray-400';
                      if (event.priority === 'high') dotColor = 'bg-red-500';
                      else if (event.priority === 'medium') dotColor = 'bg-amber-500';
                      return (
                        <span
                          key={i}
                          className={`w-1.5 h-1.5 rounded-full ${dotColor}`}
                          title={event.content}
                        />
                      );
                    })}
                  {getEventsByDate(dateStr).filter(e => e.type === 'agenda').length > 2 && (
                    <span className="text-xs text-slate-500">+{getEventsByDate(dateStr).filter(e => e.type === 'agenda').length - 2}</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}