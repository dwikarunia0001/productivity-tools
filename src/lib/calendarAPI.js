// src/lib/calendarAPI.js

const API_BASE = 'https://6700f8a7e937845524323456.mockapi.io/events'; // GANTI DENGAN ENDPOINT-MU

export const calendarAPI = {
  // Ambil semua event
  async getAllEvents() {
    const res = await fetch(API_BASE);
    if (!res.ok) throw new Error('Gagal mengambil data');
    return await res.json();
  },

  // Tambah event
  async addEvent(eventData) {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData)
    });
    if (!res.ok) throw new Error('Gagal menyimpan event');
    return await res.json();
  },

  // Perbarui event
  async updateEvent(id, updates) {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Gagal memperbarui event');
    return await res.json();
  },

  // Hapus event
  async deleteEvent(id) {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Gagal menghapus event');
    return true;
  }
};