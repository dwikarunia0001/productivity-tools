'use client';

import { useState, useEffect } from 'react';
import useCalendarStore from '@/lib/useCalendarStore';

export default function EventModal({ 
  isOpen, 
  onClose, 
  selectedDate, 
  eventToEdit = null,
  allowedTypes = ['agenda']
}) {
  const [type, setType] = useState('agenda');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('personal');
  const [priority, setPriority] = useState('medium');
  const [reminderTime, setReminderTime] = useState('');
  const [completed, setCompleted] = useState(false); // 👈 TAMBAHKAN INI

  const addEvent = useCalendarStore(state => state.addEvent);
  const updateEvent = useCalendarStore(state => state.updateEvent);

  // Isi form jika mode edit
  useEffect(() => {
    if (isOpen && eventToEdit) {
      setType(eventToEdit.type || 'agenda');
      setContent(eventToEdit.content || '');
      setCategory(eventToEdit.category || 'personal');
      setPriority(eventToEdit.priority || 'medium');
      setReminderTime(eventToEdit.reminderTime || '');
      setCompleted(eventToEdit.completed || false); // 👈 ISI SAAT EDIT
    } else if (isOpen) {
      // Mode tambah baru
      setType(allowedTypes.includes('agenda') ? 'agenda' : allowedTypes[0] || 'agenda');
      setContent('');
      setCategory('personal');
      setPriority('medium');
      setReminderTime('');
      setCompleted(false); // 👈 DEFAULT FALSE
    }
  }, [isOpen, eventToEdit]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    const eventData = {
      date: selectedDate,
      type,
      content: content.trim(),
      category,
      priority, // pastikan ini string: 'low', 'medium', atau 'high'
      reminderTime: reminderTime || null,
      completed, // 👈 SERTAKAN INI
    };

    if (eventToEdit) {
      updateEvent(selectedDate, eventToEdit.id, eventData);
    } else {
      addEvent(eventData);
    }

    onClose();
  };

  const title = eventToEdit ? 'Edit Agenda' : 'Tambah Agenda';
  const submitText = eventToEdit ? 'Perbarui' : 'Simpan';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md">
        <div className="p-5 border-b">
          <h3 className="font-bold text-slate-800">{title}</h3>
          <p className="text-sm text-slate-600 mt-1">
            {selectedDate} • Agenda dengan prioritas & reminder
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Kategori */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-200 outline-none"
            >
              <option value="business">💼 Bisnis</option>
              <option value="household">🏡 Rumah Tangga</option>
              <option value="personal">👤 Pribadi</option>
            </select>
          </div>

          {/* Prioritas */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Prioritas</label>
            <div className="flex gap-2">
              {[
                { value: 'low', label: 'Rendah', color: 'bg-gray-100 text-gray-800' },
                { value: 'medium', label: 'Sedang', color: 'bg-amber-100 text-amber-800' },
                { value: 'high', label: 'Tinggi', color: 'bg-red-100 text-red-800' }
              ].map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPriority(p.value)}
                  className={`flex-1 py-2 text-xs font-medium rounded-lg transition ${
                    priority === p.value 
                      ? p.color 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reminder */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Reminder (opsional)
            </label>
            <input
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-200 outline-none"
            />
            <p className="text-xs text-slate-500 mt-1">
              Notifikasi akan muncul pada waktu ini di tanggal {selectedDate}
            </p>
          </div>

          {/* Status Selesai (opsional tapi disarankan) */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="completed"
              checked={completed}
              onChange={(e) => setCompleted(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-200"
            />
            <label htmlFor="completed" className="text-sm text-slate-700">
              Tandai sebagai selesai
            </label>
          </div>

          {/* Konten */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi Agenda</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Contoh: Rapat klien jam 14.00..."
              rows={3}
              required
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-200 outline-none"
            />
          </div>

          {/* Tombol */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 text-slate-700 font-medium rounded-lg border border-slate-300 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-medium rounded-lg hover:opacity-90"
            >
              {submitText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}