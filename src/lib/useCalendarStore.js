// src/lib/useCalendarStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCalendarStore = create(
  persist(
    (set, get) => ({
      // events: { "2025-04-05": [ { id, date, type, content, category, priority, completed, ... } ] }
      events: {},

      /**
       * Tambah event baru
       * @param {Object} event - Objek event lengkap, minimal: { date, type, content }
       */
      addEvent: (event) => {
        if (!event.date || !event.type || !event.content) {
          console.error('Event harus memiliki `date`, `type`, dan `content`');
          return;
        }

        // Salin event, lalu pastikan properti wajib ada
        const eventToSave = { ...event };

        // Hanya agenda yang butuh priority & completed
        if (event.type === 'agenda') {
          eventToSave.priority = event.priority || 'medium'; // default: medium
          eventToSave.completed = event.completed ?? false;   // default: false
        }

        const { events } = get();
        const { date } = eventToSave;
        const newEvent = {
          id: Date.now(),
          ...eventToSave
        };

        set({
          events: {
            ...events,
            [date]: [...(events[date] || []), newEvent]
          }
        });
      },

      /**
       * Perbarui event berdasarkan ID dan tanggal
       */
      updateEvent: (date, eventId, updates) => {
        const { events } = get();
        if (!events[date]) return;

        const updatedEvents = events[date].map(ev => {
          if (ev.id === eventId) {
            const updated = { ...ev, ...updates };
            // Pastikan agenda selalu punya priority & completed
            if (updated.type === 'agenda') {
              updated.priority = updated.priority || 'medium';
              updated.completed = updated.completed ?? false;
            }
            return updated;
          }
          return ev;
        });

        set({
          events: {
            ...events,
            [date]: updatedEvents
          }
        });
      },

      /**
       * Hapus event berdasarkan tanggal dan ID
       */
      deleteEvent: (date, eventId) => {
        const { events } = get();
        if (!events[date]) return;

        set({
          events: {
            ...events,
            [date]: events[date].filter(ev => ev.id !== eventId)
          }
        });
      },

      /**
       * Ambil semua event pada tanggal tertentu
       * @returns {Array} - Daftar event
       */
      getEventsByDate: (date) => {
        const events = get().events[date] || [];
        // Kompatibilitas: tambahkan default untuk data lama
        return events.map(ev => {
          if (ev.type === 'agenda') {
            return {
              ...ev,
              priority: ev.priority || 'medium',
              completed: ev.completed ?? false
            };
          }
          return ev;
        });
      },

      /**
       * (Opsional) Ambil semua event dari semua tanggal
       */
      getAllEvents: () => {
        const { events } = get();
        const all = Object.values(events).flat();
        return all.map(ev => {
          if (ev.type === 'agenda') {
            return {
              ...ev,
              priority: ev.priority || 'medium',
              completed: ev.completed ?? false
            };
          }
          return ev;
        });
      }
    }),
    {
      name: 'calendar-storage',
      partialize: (state) => ({ events: state.events })
    }
  )
);

export default useCalendarStore;