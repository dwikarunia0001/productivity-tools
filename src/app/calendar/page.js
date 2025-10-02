// Di dalam halaman kalender (atau halaman lain)
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
  <div>
    <h1 className="text-xl sm:text-2xl font-bold text-slate-800">🗓️ Kalender Agenda</h1>
    <p className="text-slate-600 mt-1 text-sm">
      Klik tanggal untuk tambah agenda.
    </p>
  </div>
  
  {/* Indikator Pomodoro & Musik - tetap muncul di semua ukuran */}
  <div className="flex items-center gap-3">
    <button
      onClick={() => setShowFocusPanel(!showFocusPanel)}
      className="p-2 rounded-full hover:bg-slate-100 text-slate-700 text-xl"
      title="Musik Fokus"
    >
      {isMusicPlaying ? '🎶' : '🎵'}
    </button>
    <button
      onClick={() => setShowFocusPanel(!showFocusPanel)}
      className="p-2 rounded-full hover:bg-slate-100 text-slate-700 text-xl"
      title="Timer Pomodoro"
    >
      ⏱️
    </button>
    {isRunning && (
      <span className="text-xs text-amber-600 font-mono">
        {formatTime(timeLeft)}
      </span>
    )}
  </div>
</div>