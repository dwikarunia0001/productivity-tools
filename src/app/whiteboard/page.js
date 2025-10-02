'use client';

import { useEffect, useRef, useState } from 'react';

export default function WhiteboardPage() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState('#8b5cf6');
  const [lineWidth, setLineWidth] = useState(3);
  const [tool, setTool] = useState('pen');
  const [stickyNotes, setStickyNotes] = useState([]);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [height, setHeight] = useState(500);

  // === Pomodoro State ===
  const [mode, setMode] = useState('pomodoro');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const pomodoroAudioRef = useRef(null);

  const POMODORO_DURATION = 25 * 60;
  const BREAK_DURATION = 5 * 60;

  // === Music State ===
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

  // === Panel Control ===
  const [showFocusPanel, setShowFocusPanel] = useState(false);
  const panelRef = useRef(null);

  // === Canvas Init ===
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const resizeCanvas = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = height;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [height]);

  // === Pomodoro Logic ===
  useEffect(() => {
    if (mode === 'pomodoro') {
      setTimeLeft(POMODORO_DURATION);
    } else {
      setTimeLeft(BREAK_DURATION);
    }
  }, [mode]);

  // Di dalam useEffect Pomodoro (saat timeLeft === 0)
useEffect(() => {
  let interval = null;
  if (isRunning && timeLeft > 0) {
    interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
  } else if (timeLeft === 0) {
    // 🔔 Notifikasi & ganti mode
    if (pomodoroAudioRef.current) {
      pomodoroAudioRef.current.play().catch(() => {});
    }
    
    // ✅ Tambahkan ke store global
    usePomodoroStore.getState().addSession('calendar');
    
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

  // === Music Logic ===
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

  // === Drawing Functions ===
  const getCanvasContext = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (tool === 'pen') {
      ctx.strokeStyle = penColor;
      ctx.globalCompositeOperation = 'source-over';
    } else if (tool === 'eraser') {
      ctx.strokeStyle = '#ffffff';
      ctx.globalCompositeOperation = 'destination-out';
    }
    ctx.lineWidth = lineWidth;
    return ctx;
  };

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = getCanvasContext();
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = getCanvasContext();
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // === Sticky Notes ===
  const addStickyNote = () => {
    const colors = ['amber', 'pink', 'emerald', 'blue', 'purple'];
    const color = colors[stickyNotes.length % colors.length];
    
    const newNote = {
      id: Date.now(),
      content: 'Klik untuk edit...',
      x: 50 + stickyNotes.length * 20,
      y: 100 + stickyNotes.length * 20,
      color,
    };
    setStickyNotes([...stickyNotes, newNote]);
    setIsAddingNote(false);
  };

  const updateNoteContent = (id, content) => {
    setStickyNotes(stickyNotes.map(note => 
      note.id === id ? { ...note, content } : note
    ));
  };

  const deleteNote = (id) => {
    setStickyNotes(stickyNotes.filter(note => note.id !== id));
  };

  const moveNote = (id, newX, newY) => {
    setStickyNotes(stickyNotes.map(note =>
      note.id === id ? { ...note, x: newX, y: newY } : note
    ));
  };

  const startResizing = (e) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = height;

    const doDrag = (dragEvent) => {
      const newHeight = startHeight + (dragEvent.clientY - startY);
      setHeight(Math.max(300, Math.min(1000, newHeight)));
    };

    const stopDrag = () => {
      document.documentElement.removeEventListener('mousemove', doDrag);
      document.documentElement.removeEventListener('mouseup', stopDrag);
    };

    document.documentElement.addEventListener('mousemove', doDrag);
    document.documentElement.addEventListener('mouseup', stopDrag);
  };

  const colorOptions = [
    { name: 'Ungu', value: '#8b5cf6' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Biru', value: '#3b82f6' },
    { name: 'Hijau', value: '#10b981' },
    { name: 'Kuning', value: '#f59e0b' },
    { name: 'Merah', value: '#ef4444' },
    { name: 'Hitam', value: '#000000' },
  ];

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 relative">
      {/* Header dengan indikator */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">🎨 Whiteboard Brainstorming</h1>
          <p className="text-slate-600 text-xs mt-1">
            Coret-coret ide, tempel sticky note, dan bebaskan kreativitasmu!
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* Musik */}
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

          {/* Timer */}
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

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 mb-4 p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
        <button
          onClick={clearCanvas}
          className="px-3 py-1.5 text-xs font-medium bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200 transition-shadow shadow-sm"
        >
          🧹 Bersihkan
        </button>

        <div className="flex gap-1.5">
          <button
            onClick={() => setTool('pen')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-shadow shadow-sm ${
              tool === 'pen'
                ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            ✏️ Pena
          </button>
          <button
            onClick={() => setTool('eraser')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-shadow shadow-sm ${
              tool === 'eraser'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            🧽 Penghapus
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-700">Warna:</span>
          <div className="flex gap-1">
            {colorOptions.map((color) => (
              <button
                key={color.value}
                onClick={() => setPenColor(color.value)}
                disabled={tool === 'eraser'}
                className={`w-5 h-5 rounded-full border-2 ${
                  penColor === color.value ? 'border-slate-400' : 'border-transparent'
                } ${tool === 'eraser' ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'}`}
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-700">Ketebalan:</span>
          <input
            type="range"
            min="1"
            max="20"
            value={lineWidth}
            onChange={(e) => setLineWidth(Number(e.target.value))}
            className="w-16 accent-pink-500"
          />
          <span className="text-xs text-slate-600 w-6">{lineWidth}px</span>
        </div>

        <button
          onClick={() => setIsAddingNote(true)}
          className="px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-amber-400 to-amber-200 text-amber-800 rounded-lg hover:shadow-md transition-shadow shadow-sm"
        >
          📌 + Note
        </button>
      </div>

      {/* Canvas Container */}
      <div 
        ref={containerRef}
        className="relative bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden"
        style={{ height: `${height}px` }}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="w-full h-full cursor-crosshair block"
        />

        {/* Sticky Notes */}
        {stickyNotes.map((note) => (
          <StickyNote
            key={note.id}
            note={note}
            onUpdate={updateNoteContent}
            onDelete={deleteNote}
            onMove={moveNote}
          />
        ))}

        <div
          onMouseDown={startResizing}
          className="absolute bottom-0 left-0 right-0 h-3 bg-slate-100 flex items-center justify-center cursor-row-resize hover:bg-slate-200 transition-colors"
        >
          <div className="w-8 h-0.5 bg-slate-400 rounded-full"></div>
        </div>
      </div>

      {/* Konfirmasi tambah note */}
      {isAddingNote && (
        <div className="mt-3 flex gap-2">
          <button
            onClick={addStickyNote}
            className="px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:shadow-md transition-shadow shadow-sm"
          >
            ✅ Tambah
          </button>
          <button
            onClick={() => setIsAddingNote(false)}
            className="px-3 py-1.5 text-xs font-medium bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-shadow shadow-sm"
          >
            Batal
          </button>
        </div>
      )}

      <p className="mt-3 text-xs text-slate-500">
        💡 Tips: Tarik garis di bawah whiteboard untuk ubah ukuran. Klik 📌 untuk tambah sticky note.
      </p>

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

      {/* Audio Elements */}
      <audio ref={pomodoroAudioRef}>
        <source src="https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3" type="audio/mpeg" />
      </audio>
      <audio
        ref={musicAudioRef}
        onEnded={handleMusicEnded}
      />
    </div>
  );
}

// Komponen StickyNote (sama seperti sebelumnya)
function StickyNote({ note, onUpdate, onDelete, onMove }) {
  const noteRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const bgColor = {
    amber: 'bg-amber-100 border-amber-300',
    pink: 'bg-pink-100 border-pink-300',
    emerald: 'bg-emerald-100 border-emerald-300',
    blue: 'bg-blue-100 border-blue-300',
    purple: 'bg-purple-100 border-purple-300',
  }[note.color] || 'bg-amber-100 border-amber-300';

  const handleMouseDown = (e) => {
    if (e.target.tagName === 'TEXTAREA') return;
    
    const rect = noteRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    onMove(note.id, newX, newY);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  return (
    <div
      ref={noteRef}
      className={`absolute ${bgColor} rounded-lg shadow-md p-2 w-40 cursor-grab select-none`}
      style={{
        left: note.x,
        top: note.y,
        cursor: isDragging ? 'grabbing' : 'grab',
        zIndex: 10,
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="flex justify-between items-start mb-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(note.id);
          }}
          className="text-slate-500 hover:text-rose-600 text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full hover:bg-rose-100"
        >
          ✕
        </button>
      </div>
      <textarea
        value={note.content}
        onChange={(e) => onUpdate(note.id, e.target.value)}
        className="w-full bg-transparent text-[11px] text-slate-800 placeholder-slate-500 outline-none resize-none"
        rows="3"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}