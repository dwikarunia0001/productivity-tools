'use client'
import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import { useState, useEffect, useRef } from 'react';
import { usePomodoroStore } from '@/lib/usePomodoroStore';

const inter = Inter({ subsets: ['latin'] });

const PLAYLIST = [
  { title: 'Lo-Fi Study Beats Vol. 1', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { title: 'Chill Coding Session', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { title: 'Calm Mind Waves', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
  { title: 'Night Library Vibes', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
  { title: 'Rain & Coffee Loops', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3' },
];

export default function RootLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Ambil state dari store global
  const {
    mode,
    timeLeft,
    isRunning,
    isMusicPlaying,
    currentTrackIndex,
    volume,
    setMode,
    setTimeLeft,
    setIsRunning,
    setIsMusicPlaying,
    setCurrentTrackIndex,
    setVolume,
    addSession,
    resetPomodoro
  } = usePomodoroStore();

  const pomodoroAudioRef = useRef(null);
  const musicAudioRef = useRef(null);
  const [showFocusPanel, setShowFocusPanel] = useState(false);
  const panelRef = useRef(null);

  // === Pomodoro Timer Logic ===
  useEffect(() => {
    let interval = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      if (pomodoroAudioRef.current) {
        pomodoroAudioRef.current.play().catch(() => {});
      }
      const page = window.location.pathname.split('/')[1] || 'unknown';
      addSession(page);
      
      setMode(prev => prev === 'pomodoro' ? 'break' : 'pomodoro');
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, mode, setTimeLeft, setMode, setIsRunning, addSession]);

  // === Musik Logic ===
  useEffect(() => {
    const audio = musicAudioRef.current;
    if (audio) {
      audio.src = PLAYLIST[currentTrackIndex]?.src || '';
      audio.volume = volume;
      if (isMusicPlaying) {
        audio.play().catch(err => console.warn('Gagal memutar:', err));
      } else {
        audio.pause();
      }
    }
  }, [currentTrackIndex, isMusicPlaying, volume]);

  const handleMusicEnded = () => {
    const nextIndex = (currentTrackIndex + 1) % PLAYLIST.length;
    setCurrentTrackIndex(nextIndex);
    setIsMusicPlaying(true);
  };

  const toggleMusic = () => setIsMusicPlaying(!isMusicPlaying);
  const nextTrack = () => {
    const nextIndex = (currentTrackIndex + 1) % PLAYLIST.length;
    setCurrentTrackIndex(nextIndex);
    setIsMusicPlaying(true);
  };
  const prevTrack = () => {
    const prevIndex = (currentTrackIndex - 1 + PLAYLIST.length) % PLAYLIST.length;
    setCurrentTrackIndex(prevIndex);
    setIsMusicPlaying(true);
  };
  const handleVolumeChange = (e) => {
    const newVol = parseFloat(e.target.value) / 100;
    setVolume(newVol);
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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Audio Elements */}
        <audio ref={pomodoroAudioRef}>
          <source src="https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3" type="audio/mpeg" />
        </audio>
        <audio ref={musicAudioRef} onEnded={handleMusicEnded} />

        <div className="flex h-screen bg-slate-50">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

          {sidebarOpen && window.innerWidth < 1024 && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-30 z-30 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header Mobile */}
            <header className="lg:hidden bg-white border-b border-slate-200 p-4 flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-700"
              >
                ☰
              </button>
              <h1 className="text-lg font-bold text-slate-800 ml-3">Productivity</h1>
            </header>

            {/* Header Desktop - dengan indikator Pomodoro & Musik */}
            <div className="hidden lg:block bg-white border-b border-slate-200 p-4">
              <div className="max-w-7xl mx-auto flex justify-end items-center gap-4">
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
                      <span className="text-xs text-green-600 mt-1 font-medium">🎵 Aktif</span>
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
                      <span className="text-xs text-amber-600 mt-1 font-mono font-medium">
                        {formatTime(timeLeft)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <main className="flex-1 overflow-y-auto">
              {children}
            </main>
          </div>
        </div>

        {/* Panel Fokus Global */}
        {showFocusPanel && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-black bg-opacity-30" />
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
                        onClick={() => setIsRunning(!isRunning)}
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
                    <h4 className="font-medium text-slate-800">{PLAYLIST[currentTrackIndex]?.title}</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Lagu {currentTrackIndex + 1} dari {PLAYLIST.length}
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
      </body>
    </html>
  );
}