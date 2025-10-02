'use client';

import { useState, useEffect, useRef } from 'react';
import Calendar from '@/components/Calendar';
import EventModal from '@/components/EventModal';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import useCalendarStore from '@/lib/useCalendarStore';

// Helper: Tambahkan hari ke tanggal
const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// Helper: Dapatkan rentang tanggal
const getDateRange = (startDate, range) => {
  const start = new Date(startDate);
  let end;
  if (range === 'day') {
    end = new Date(start);
  } else if (range === 'week') {
    // Minggu dimulai dari hari ini sampai 6 hari ke depan
    end = addDays(start, 6);
  } else {
    // Bulan: dari tanggal 1 sampai akhir bulan
    const year = start.getFullYear();
    const month = start.getMonth();
    start.setDate(1);
    end = new Date(year, month + 1, 0); // akhir bulan
  }
  return { start, end };
};

// Helper: Format tanggal untuk display
const formatDateRange = (range, date) => {
  const d = new Date(date);
  if (range === 'day') {
    return d.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } else if (range === 'week') {
    const end = addDays(d, 6);
    return `${d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  } else {
    return d.toLocaleDateString('id-ID', { year: 'numeric', month: 'long' });
  }
};

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState(null);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [sidebarDate, setSidebarDate] = useState(new Date().toISOString().split('T')[0]);

  // === Filter State Baru ===
  const [timeRange, setTimeRange] = useState('day'); // 'day' | 'week' | 'month'
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [sidebarHeight, setSidebarHeight] = useState(500);

  // === Pomodoro & Musik State (tidak diubah) ===
  const [mode, setMode] = useState('pomodoro');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const pomodoroAudioRef = useRef(null);

  const POMODORO_DURATION = 25 * 60;
  const BREAK_DURATION = 5 * 60;

  const playlist = [
    { title: 'Lo-Fi Study Beats Vol. 1', artist: 'Focus Flow', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
    { title: 'Chill Coding Session', artist: 'Deep Work', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
    { title: 'Calm Mind Waves', artist: 'Zen Study', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
    { title: 'Night Library Vibes', artist: 'Lo-Fi Dreams', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
    { title: 'Rain & Coffee Loops', artist: 'Ambient Focus', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3' },
  ];

  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const musicAudioRef = useRef(null);

  const [showFocusPanel, setShowFocusPanel] = useState(false);
  const panelRef = useRef(null);

  const { getEventsByDate, getAllEvents, updateEvent } = useCalendarStore();

  // === Pomodoro Logic (tidak diubah) ===
  useEffect(() => {
    if (mode === 'pomodoro') {
      setTimeLeft(POMODORO_DURATION);
    } else {
      setTimeLeft(BREAK_DURATION);
    }
  }, [mode]);

  useEffect(() => {
    let interval = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0) {
      if (pomodoroAudioRef.current) {
        pomodoroAudioRef.current.play().catch(() => {});
      }
      setMode(prev => prev === 'pomodoro' ? 'break' : 'pomodoro');
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, mode]);

  const togglePomodoro = () => setIsRunning(!isRunning);
  const resetPomodoro = () => {
    setIsRunning(false);
    setTimeLeft(mode === 'pomodoro' ? POMODORO_DURATION : BREAK_DURATION);
  };

  // === Music Logic (tidak diubah) ===
  const currentTrack = playlist[currentTrackIndex];

  useEffect(() => {
    const audio = musicAudioRef.current;
    if (audio) {
      audio.src = currentTrack.src;
      audio.volume = volume;
      if (isMusicPlaying) {
        audio.play().catch(err => console.warn('Gagal memutar:', err));
      }
    }
  }, [currentTrackIndex, currentTrack.src]);

  const handleMusicEnded = () => {
    const nextIndex = (currentTrackIndex + 1) % playlist.length;
    setCurrentTrackIndex(nextIndex);
    setIsMusicPlaying(true);
  };

  const toggleMusic = () => {
    const audio = musicAudioRef.current;
    if (isMusicPlaying) {
      audio.pause();
    } else {
      audio.play().catch(err => console.error('Gagal memutar:', err));
    }
    setIsMusicPlaying(!isMusicPlaying);
  };

  const nextTrack = () => {
    const nextIndex = (currentTrackIndex + 1) % playlist.length;
    setCurrentTrackIndex(nextIndex);
    setIsMusicPlaying(true);
  };

  const prevTrack = () => {
    const prevIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
    setCurrentTrackIndex(prevIndex);
    setIsMusicPlaying(true);
  };

  const handleVolumeChange = (e) => {
    const newVol = parseFloat(e.target.value) / 100;
    setVolume(newVol);
    if (musicAudioRef.current) {
      musicAudioRef.current.volume = newVol;
    }
  };

  // === Tutup panel saat klik di luar ===
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showFocusPanel && panelRef.current && !panelRef.current.contains(e.target)) {
        setShowFocusPanel(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showFocusPanel]);

  // === Reminder System (tidak diubah) ===
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const currentTime = now.toTimeString().slice(0, 5);

      const todayEvents = getEventsByDate(today);
      const dueReminders = todayEvents.filter(event => 
        event.reminderTime && 
        event.reminderTime <= currentTime &&
        !event.reminderTriggered
      );

      dueReminders.forEach(event => {
        updateEvent(today, event.id, { ...event, reminderTriggered: true });

        if (Notification.permission === 'granted') {
          new Notification('🔔 Reminder Agenda', {
            body: `${event.content} (${event.category})`,
            icon: '/favicon.ico'
          });
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
              new Notification('🔔 Reminder Agenda', {
                body: `${event.content} (${event.category})`,
                icon: '/favicon.ico'
              });
            }
          });
        }
      });
    };

    const interval = setInterval(checkReminders, 60000);
    checkReminders();
    return () => clearInterval(interval);
  }, []);

  // === Toggle Completed ===
  const toggleCompleted = (event) => {
    updateEvent(event.date, event.id, {
      ...event,
      completed: !event.completed
    });
  };

  // === Ambil semua agenda dalam rentang waktu ===
  const getAgendaInDateRange = () => {
    const { start, end } = getDateRange(sidebarDate, timeRange);
    const allEvents = getAllEvents().filter(event => event.type === 'agenda');
    
    return allEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= start && eventDate <= end;
    });
  };

  // === Filter Events ===
  const allAgendaEvents = getAgendaInDateRange();
  const filteredEvents = allAgendaEvents.filter(event => {
    // Filter prioritas
    if (priorityFilter !== 'all' && event.priority !== priorityFilter) return false;
    // Filter status
    if (statusFilter === 'completed' && !event.completed) return false;
    if (statusFilter === 'pending' && event.completed) return false;
    // Filter kategori
    if (categoryFilter !== 'all' && event.category !== categoryFilter) return false;
    // Filter pencarian
    if (searchQuery && !event.content.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // === Resize Handler ===
  const startResizing = (e) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = sidebarHeight;
    const doDrag = (dragEvent) => {
      const newHeight = startHeight + (dragEvent.clientY - startY);
      setSidebarHeight(Math.max(300, Math.min(800, newHeight)));
    };
    const stopDrag = () => {
      document.documentElement.removeEventListener('mousemove', doDrag);
      document.documentElement.removeEventListener('mouseup', stopDrag);
    };
    document.documentElement.addEventListener('mousemove', doDrag);
    document.documentElement.addEventListener('mouseup', stopDrag);
  };

  // === Handler ===
  const handleDateClick = (date) => {
    setSelectedDate(date);
    setSidebarDate(date);
    setEventToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditEvent = (event) => {
    setSelectedDate(event.date);
    setSidebarDate(event.date);
    setEventToEdit(event);
    setIsModalOpen(true);
  };

  const handleDeleteEvent = (event) => {
    setEventToDelete(event);
    setIsDeleteModalOpen(true);
  };

  const hasReminderOnDate = (date) => {
    return getEventsByDate(date).some(event => 
      event.type === 'agenda' && event.reminderTime
    );
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">🗓️ Kalender Agenda</h1>
          <p className="text-slate-600 mt-1 text-sm">
            Klik tanggal untuk tambah agenda.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center">
            <button
              onClick={() => setShowFocusPanel(!showFocusPanel)}
              className={`p-2 rounded-full hover:bg-slate-100 text-slate-700 text-xl transition ${
                isMusicPlaying ? 'animate-pulse' : ''
              }`}
              title="Musik Fokus"
            >
              {isMusicPlaying ? '🎶' : '🎵'}
            </button>
            {isMusicPlaying && (
              <span className="text-xs text-green-600 mt-1 font-medium hidden sm:block">🎵 Aktif</span>
            )}
          </div>
          <div className="flex flex-col items-center">
            <button
              onClick={() => setShowFocusPanel(!showFocusPanel)}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-700 text-xl"
              title="Timer Pomodoro"
            >
              ⏱️
            </button>
            {isRunning && (
              <span className="text-xs text-amber-600 mt-1 font-mono font-medium hidden sm:block">
                {formatTime(timeLeft)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-6">
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <Calendar 
              onDateClick={handleDateClick} 
              hasReminder={hasReminderOnDate} 
            />
          </div>
        </div>

        <div className="lg:col-span-6">
          <div 
            className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden"
            style={{ height: `${sidebarHeight}px` }}
          >
            <div className="p-4 flex-1 flex flex-col">
              <h2 className="font-semibold text-slate-800 text-base sm:text-lg mb-2">Agenda</h2>
              <p className="text-sm text-slate-600 mb-3">
                {formatDateRange(timeRange, sidebarDate)}
              </p>

              {/* Panel Filter Lengkap */}
              <div className="mb-4 space-y-3">
                {/* Rentang Waktu */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Rentang Waktu</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'day', label: '1 Hari' },
                      { value: 'week', label: '1 Minggu' },
                      { value: 'month', label: '1 Bulan' }
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setTimeRange(opt.value)}
                        className={`text-xs px-2 py-1.5 rounded-lg font-medium transition ${
                          timeRange === opt.value
                            ? 'bg-blue-100 text-blue-800 ring-1 ring-blue-300'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pencarian */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Cari Agenda</label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari berdasarkan konten..."
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-200 outline-none"
                  />
                </div>

                {/* Filter Prioritas */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Prioritas</label>
                  <div className="flex flex-wrap gap-1">
                    {[
                      { value: 'all', label: 'Semua' },
                      { value: 'high', label: 'Tinggi' },
                      { value: 'medium', label: 'Sedang' },
                      { value: 'low', label: 'Rendah' }
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setPriorityFilter(opt.value)}
                        className={`text-[10px] px-2 py-1 rounded-full font-medium transition ${
                          priorityFilter === opt.value 
                            ? opt.value === 'high' ? 'bg-red-100 text-red-800 ring-1 ring-red-300' :
                              opt.value === 'medium' ? 'bg-amber-100 text-amber-800 ring-1 ring-amber-300' :
                              opt.value === 'low' ? 'bg-gray-100 text-gray-800 ring-1 ring-gray-300' :
                              'bg-slate-100 text-slate-800 ring-1 ring-slate-300'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Filter Status */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Status</label>
                  <div className="flex gap-1">
                    {[
                      { value: 'all', label: 'Semua' },
                      { value: 'pending', label: 'Belum' },
                      { value: 'completed', label: 'Selesai' }
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setStatusFilter(opt.value)}
                        className={`text-[10px] px-2 py-1 rounded-full font-medium transition ${
                          statusFilter === opt.value 
                            ? 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300' 
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Filter Kategori */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Kategori</label>
                  <div className="flex gap-1">
                    {[
                      { value: 'all', label: 'Semua' },
                      { value: 'business', label: 'Bisnis' },
                      { value: 'household', label: 'Rumah' },
                      { value: 'personal', label: 'Pribadi' }
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setCategoryFilter(opt.value)}
                        className={`text-[10px] px-2 py-1 rounded-full font-medium transition ${
                          categoryFilter === opt.value 
                            ? 'bg-purple-100 text-purple-800 ring-1 ring-purple-300' 
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Daftar Agenda */}
              <div className="space-y-2 overflow-y-auto flex-1 pb-2">
                {filteredEvents.length > 0 ? (
                  filteredEvents.map(event => {
                    const isCompleted = event.completed || false;
                    let borderColor, bgColor;
                    if (event.priority === 'high') {
                      borderColor = 'border-red-500';
                      bgColor = 'bg-red-50';
                    } else if (event.priority === 'medium') {
                      borderColor = 'border-amber-500';
                      bgColor = 'bg-amber-50';
                    } else {
                      borderColor = 'border-gray-400';
                      bgColor = 'bg-gray-50';
                    }

                    return (
                      <div
                        key={event.id}
                        className={`p-3 rounded-lg border-l-4 ${borderColor} ${bgColor} ${
                          isCompleted ? 'opacity-80' : ''
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <button
                            onClick={() => toggleCompleted(event)}
                            className={`mt-0.5 w-4 h-4 flex items-center justify-center rounded-full border ${
                              isCompleted
                                ? 'bg-emerald-500 border-emerald-500 text-white text-[8px]'
                                : 'border-slate-300'
                            }`}
                          >
                            {isCompleted ? '✓' : ''}
                          </button>
                          
                          <div className="flex-1 min-w-0">
                            <div className="text-[10px] font-medium text-slate-700">
                              {event.category === 'business' ? '💼 Bisnis' :
                               event.category === 'household' ? '🏡 Rumah' : '👤 Pribadi'}
                            </div>
                            <div className={`text-sm mt-1 font-medium ${
                              isCompleted ? 'line-through text-slate-500' : 'text-slate-800'
                            }`}>
                              {event.content}
                            </div>
                            {event.reminderTime && (
                              <div className="text-[10px] text-slate-500 mt-1">
                                🔔 {event.reminderTime}
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col gap-1 flex-shrink-0">
                            <button
                              onClick={() => handleEditEvent(event)}
                              className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded hover:bg-blue-200"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteEvent(event)}
                              className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded hover:bg-red-200"
                            >
                              Hapus
                            </button>
                          </div>
                        </div>

                        <div className="mt-2 flex justify-between items-center">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                            event.priority === 'high' ? 'bg-red-100 text-red-800' :
                            event.priority === 'medium' ? 'bg-amber-100 text-amber-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {event.priority === 'high' ? 'Tinggi' : 
                             event.priority === 'medium' ? 'Sedang' : 'Rendah'}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                            isCompleted 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {isCompleted ? 'Selesai' : 'Belum'}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-slate-500 text-sm">Tidak ada agenda yang sesuai filter.</p>
                )}
              </div>
            </div>

            <div
              onMouseDown={startResizing}
              className="h-2.5 bg-slate-100 flex items-center justify-center cursor-row-resize hover:bg-slate-200 transition-colors"
            >
              <div className="w-6 h-0.5 bg-slate-400 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <EventModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEventToEdit(null);
        }}
        selectedDate={selectedDate}
        eventToEdit={eventToEdit}
        allowedTypes={['agenda']}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        eventToDelete={eventToDelete}
      />

      {/* Audio Elements */}
      <audio ref={pomodoroAudioRef}>
        <source src="https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3" type="audio/mpeg" />
      </audio>
      <audio
        ref={musicAudioRef}
        onEnded={handleMusicEnded}
      />

      {/* Panel Fokus */}
      {showFocusPanel && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/50" />
          <div
            ref={panelRef}
            className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl"
          >
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-bold text-slate-800">🎵 Timer & Musik</h2>
              <button
                onClick={() => setShowFocusPanel(false)}
                className="text-slate-500 hover:text-slate-800 text-xl"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-6 overflow-y-auto h-[calc(100vh-60px)]">
              {/* Pomodoro */}
              <div className="bg-slate-50 rounded-xl p-5">
                <h3 className="font-bold text-slate-800 mb-4 text-center">⏱️ Pomodoro Timer</h3>
                <div className="text-center">
                  <div className={`text-4xl font-bold mb-3 ${
                    mode === 'pomodoro' ? 'text-emerald-600' : 'text-amber-600'
                  }`}>
                    {formatTime(timeLeft)}
                  </div>
                  <div className="flex justify-center gap-2 mb-4">
                    <button
                      onClick={togglePomodoro}
                      className={`px-4 py-2 rounded-lg font-medium ${
                        isRunning
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {isRunning ? '⏸️ Jeda' : '▶️ Mulai'}
                    </button>
                    <button
                      onClick={resetPomodoro}
                      className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg font-medium"
                    >
                      🔁 Reset
                    </button>
                  </div>
                  <div className="flex justify-center gap-2 text-sm">
                    <button
                      className={`px-3 py-1 rounded ${
                        mode === 'pomodoro'
                          ? 'bg-emerald-100 text-emerald-800 font-semibold'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                      onClick={() => {
                        setMode('pomodoro');
                        setIsRunning(false);
                      }}
                    >
                      Pomodoro
                    </button>
                    <button
                      className={`px-3 py-1 rounded ${
                        mode === 'break'
                          ? 'bg-amber-100 text-amber-800 font-semibold'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                      onClick={() => {
                        setMode('break');
                        setIsRunning(false);
                      }}
                    >
                      Istirahat
                    </button>
                  </div>
                </div>
              </div>

              {/* Musik */}
              <div className="bg-slate-50 rounded-xl p-5">
                <h3 className="font-bold text-slate-800 mb-4 text-center">🎧 Musik Fokus</h3>
                <div className="text-center mb-4">
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-200 to-amber-200 rounded-full flex items-center justify-center text-3xl mb-3">
                    🎧
                  </div>
                  <h4 className="font-medium text-slate-800">{currentTrack.title}</h4>
                  <p className="text-sm text-slate-600">oleh {currentTrack.artist}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Lagu {currentTrackIndex + 1} dari {playlist.length}
                  </p>
                </div>

                <div className="flex justify-center gap-4 mb-4">
                  <button
                    onClick={prevTrack}
                    className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center hover:bg-slate-300"
                  >
                    ⏮️
                  </button>
                  <button
                    onClick={toggleMusic}
                    className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 text-xl"
                  >
                    {isMusicPlaying ? '⏸️' : '▶️'}
                  </button>
                  <button
                    onClick={nextTrack}
                    className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center hover:bg-slate-300"
                  >
                    ⏭️
                  </button>
                </div>

                <div>
                  <label className="block text-xs text-slate-600 mb-1">
                    Volume: {(volume * 100).toFixed(0)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume * 100}
                    onChange={handleVolumeChange}
                    className="w-full accent-blue-600"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}