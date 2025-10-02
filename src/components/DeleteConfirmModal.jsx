// src/components/DeleteConfirmModal.js
'use client';

import { useState } from 'react';
import useCalendarStore from '@/lib/useCalendarStore';

export default function DeleteConfirmModal({ isOpen, onClose, eventToDelete }) {
  const deleteEvent = useCalendarStore(state => state.deleteEvent);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    if (!eventToDelete) return;
    setIsDeleting(true);
    deleteEvent(eventToDelete.date, eventToDelete.id);
    setIsDeleting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md p-5">
        <h3 className="font-bold text-slate-800">Hapus Agenda?</h3>
        <p className="text-slate-600 mt-2 text-sm">
          Apakah Anda yakin ingin menghapus agenda ini? Tindakan ini tidak bisa dibatalkan.
        </p>
        <div className="mt-4 p-3 bg-slate-50 rounded-lg">
          <p className="text-sm font-medium">{eventToDelete?.content}</p>
          <p className="text-xs text-slate-500 mt-1">
            {eventToDelete?.date}
          </p>
        </div>

        <div className="flex gap-2 mt-5">
          <button
            onClick={onClose}
            className="flex-1 py-2 text-slate-700 font-medium rounded-lg border border-slate-300 hover:bg-slate-50"
          >
            Batal
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 disabled:opacity-70"
          >
            {isDeleting ? 'Menghapus...' : 'Hapus'}
          </button>
        </div>
      </div>
    </div>
  );
}