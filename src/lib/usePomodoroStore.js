// src/lib/usePomodoroStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const usePomodoroStore = create(
  persist(
    (set, get) => ({
      // Status Pomodoro
      mode: 'pomodoro', // 'pomodoro' | 'break'
      timeLeft: 25 * 60,
      isRunning: false,

      // Musik
      isMusicPlaying: false,
      currentTrackIndex: 0,
      volume: 0.3,

      // Data global
      totalSessions: 0,
      sessions: [],

      // Aksi Pomodoro
      setMode: (mode) => set({ mode, timeLeft: mode === 'pomodoro' ? 25 * 60 : 5 * 60 }),
      setTimeLeft: (timeLeft) => set({ timeLeft }),
      setIsRunning: (isRunning) => set({ isRunning }),

      // Aksi Musik
      setIsMusicPlaying: (isMusicPlaying) => set({ isMusicPlaying }),
      setCurrentTrackIndex: (index) => set({ currentTrackIndex: index }),
      setVolume: (volume) => set({ volume }),

      // Tambah sesi Pomodoro
      addSession: (page = 'unknown') => {
        const newSession = {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          page,
        };
        set(state => ({
          totalSessions: state.totalSessions + 1,
          sessions: [...state.sessions, newSession]
        }));
      },

      // Reset Pomodoro
      resetPomodoro: () => {
        const { mode } = get();
        set({ timeLeft: mode === 'pomodoro' ? 25 * 60 : 5 * 60, isRunning: false });
      }
    }),
    {
      name: 'pomodoro-global-storage',
      partialize: (state) => ({
        totalSessions: state.totalSessions,
        sessions: state.sessions,
        // Opsional: simpan preferensi musik
        volume: state.volume,
        currentTrackIndex: state.currentTrackIndex
      })
    }
  )
);