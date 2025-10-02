'use client';

import { useState, useEffect, useRef } from 'react';

// ========== DATA ==========
const EMOJI_STORIES = [
  { emojis: "👑🦁🎶", answer: "the lion king" },
  { emojis: "🚢🧊🌊", answer: "titanic" },
  { emojis: "🧙‍♂️👓⚡", answer: "harry potter" },
  { emojis: "🕷️🕷️🕷️", answer: "spiderman" },
  { emojis: "🚗💨🏁", answer: "fast and furious" },
  { emojis: "❄️👑❄️", answer: "frozen" },
  { emojis: "🤠🌌⚔️", answer: "star wars" },
  { emojis: "💍🌋🌋", answer: "lord of the rings" },
];

const PROFESSIONS = [
  { clue: "Membantu pasien sembuh dengan resep obat", answer: "dokter" },
  { clue: "Mengajar di depan kelas setiap hari", answer: "guru" },
  { clue: "Menulis kode untuk membuat aplikasi", answer: "programmer" },
  { clue: "Mengemudikan pesawat terbang", answer: "pilot" },
  { clue: "Membuat kue dan roti yang lezat", answer: "koki" },
  { clue: "Menata rambut pelanggan dengan indah", answer: "penata rambut" },
  { clue: "Menjaga keamanan di gedung perkantoran", answer: "satpam" },
  { clue: "Merawat tanaman hias di taman kota", answer: "tukang kebun" },
];

// ========== HELPER ==========
const normalizeAnswer = (str) => str.toLowerCase().trim().replace(/\s+/g, ' ');

const isCorrectAnswer = (user, correct) => {
  const normUser = normalizeAnswer(user);
  const normCorrect = normalizeAnswer(correct);
  if (normUser === normCorrect) return true;
  if (Math.abs(normUser.length - normCorrect.length) <= 2) {
    const diff = [...normCorrect].filter((char, i) => char !== normUser[i]).length;
    return diff <= 2;
  }
  return false;
};

// ========== KOMPONEN SKOR ==========
function ScoreBoard({ player1Score, player2Score, currentPlayer, isMultiplayer }) {
  if (!isMultiplayer) {
    return (
      <div className="mb-4 p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
        <div className="text-emerald-800 font-bold text-lg">🎯 Skor: {player1Score}</div>
        <p className="text-emerald-700 text-xs mt-1">Jawaban benar = +10 poin</p>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className={`p-3 rounded-xl text-center ${
          currentPlayer === 1 
            ? 'bg-gradient-to-r from-pink-100 to-purple-100 border border-pink-200' 
            : 'bg-slate-50 border border-slate-200'
        }`}>
          <div className="font-bold text-pink-800">Pemain 1</div>
          <div className="text-2xl font-bold mt-1">{player1Score}</div>
        </div>
        <div className={`p-3 rounded-xl text-center ${
          currentPlayer === 2 
            ? 'bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-200' 
            : 'bg-slate-50 border border-slate-200'
        }`}>
          <div className="font-bold text-amber-800">Pemain 2</div>
          <div className="text-2xl font-bold mt-1">{player2Score}</div>
        </div>
      </div>
      
      <div className="text-center">
        <span className="inline-block px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">
          Giliran: Pemain {currentPlayer}
        </span>
      </div>
    </div>
  );
}

// ========== KOMPONEN GAME ==========
function KataBerantaiGame() {
  const [chain, setChain] = useState(['buku']);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const lastWord = chain[chain.length - 1];
  const lastChar = lastWord[lastWord.length - 1].toLowerCase();

  const handleSubmit = (e) => {
    e.preventDefault();
    const word = input.trim().toLowerCase();
    
    if (!word) {
      setError('Kata tidak boleh kosong!');
      return;
    }
    
    if (chain.includes(word)) {
      setError('Kata ini sudah dipakai!');
      setTimeout(() => setError(''), 2000);
      return;
    }

    const firstChar = word[0].toLowerCase();
    
    if (firstChar !== lastChar) {
      setError(`Kata harus dimulai dengan huruf '${lastChar}'!`);
      setTimeout(() => setError(''), 2000);
      return;
    }

    setChain([...chain, word]);
    setInput('');
    setSuccess('✅ Bagus!');
    setTimeout(() => setSuccess(''), 1000);
  };

  return (
    <div className="text-center">
      <div className="mb-4 p-3 bg-pink-50 rounded-lg border border-pink-200">
        <h3 className="font-bold text-pink-800 mb-1">🔄 Kata Berantai</h3>
        <p className="text-pink-700 text-sm">
          Lanjutkan rantai! Kata berikutnya harus dimulai dari huruf <strong className="text-pink-600">{lastChar}</strong>.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4 min-h-[80px] max-h-32 overflow-y-auto">
        <div className="flex flex-wrap gap-2 justify-center">
          {chain.map((word, i) => (
            <span 
              key={i} 
              className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-pink-100 to-purple-100 text-pink-800 rounded-full text-sm font-medium shadow-sm"
            >
              {word}
            </span>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Masukkan kata..."
            className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-pink-200 focus:border-pink-500 outline-none text-center text-sm"
            autoFocus
          />
          {(error || success) && (
            <div className={`absolute -bottom-6 left-0 right-0 text-center text-sm font-medium ${
              error ? 'text-rose-600' : 'text-emerald-600'
            }`}>
              {error || success}
            </div>
          )}
        </div>
        
        <button
          type="submit"
          className="w-full px-4 py-2.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-medium rounded-xl shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5"
        >
          Tambahkan Kata
        </button>
      </form>
    </div>
  );
}

function EmojiStoryGame({ 
  player1Score, 
  setPlayer1Score, 
  player2Score, 
  setPlayer2Score, 
  currentPlayer, 
  setCurrentPlayer, 
  isMultiplayer 
}) {
  const [current, setCurrent] = useState(0);
  const [guess, setGuess] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);

  const quiz = EMOJI_STORIES[current];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!guess.trim() || isCorrect) return;
    
    if (isCorrectAnswer(guess, quiz.answer)) {
      setFeedback('✅ Benar!');
      setIsCorrect(true);
      
      if (isMultiplayer) {
        if (currentPlayer === 1) {
          setPlayer1Score(prev => prev + 10);
        } else {
          setPlayer2Score(prev => prev + 10);
        }
        setTimeout(() => setCurrentPlayer(currentPlayer === 1 ? 2 : 1), 1000);
      } else {
        setPlayer1Score(prev => prev + 10);
      }
      
      setTimeout(() => {
        const next = (current + 1) % EMOJI_STORIES.length;
        setCurrent(next);
        setGuess('');
        setFeedback('');
        setIsCorrect(false);
      }, 1500);
    } else {
      setFeedback('❌ Coba lagi!');
      setTimeout(() => setFeedback(''), 1200);
    }
  };

  return (
    <div className="text-center">
      <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
        <h3 className="font-bold text-purple-800 mb-1">📱 Emoji Story</h3>
        <p className="text-purple-700 text-sm">
          Tebak judul film/series dari emoji berikut!
        </p>
      </div>

      <div className="text-6xl mb-6 animate-bounce">{quiz.emojis}</div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <input
            type="text"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            placeholder="Apa ini?"
            className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none text-center text-sm"
            autoFocus
          />
          {feedback && (
            <div className={`absolute -bottom-6 left-0 right-0 text-center text-sm font-medium ${
              feedback.includes('Benar') ? 'text-emerald-600' : 'text-rose-600'
            }`}>
              {feedback}
            </div>
          )}
        </div>
        
        <button
          type="submit"
          disabled={isCorrect}
          className="w-full px-4 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-medium rounded-xl shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-70"
        >
          Tebak!
        </button>
      </form>

      <p className="mt-4 text-xs text-slate-500">
        Soal {current + 1} dari {EMOJI_STORIES.length}
      </p>
    </div>
  );
}

function TebakProfesiGame({ 
  player1Score, 
  setPlayer1Score, 
  player2Score, 
  setPlayer2Score, 
  currentPlayer, 
  setCurrentPlayer, 
  isMultiplayer 
}) {
  const [current, setCurrent] = useState(0);
  const [guess, setGuess] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);

  const quiz = PROFESSIONS[current];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!guess.trim() || isCorrect) return;
    
    if (isCorrectAnswer(guess, quiz.answer)) {
      setFeedback('✅ Tepat sekali!');
      setIsCorrect(true);
      
      if (isMultiplayer) {
        if (currentPlayer === 1) {
          setPlayer1Score(prev => prev + 10);
        } else {
          setPlayer2Score(prev => prev + 10);
        }
        setTimeout(() => setCurrentPlayer(currentPlayer === 1 ? 2 : 1), 1000);
      } else {
        setPlayer1Score(prev => prev + 10);
      }
      
      setTimeout(() => {
        const next = (current + 1) % PROFESSIONS.length;
        setCurrent(next);
        setGuess('');
        setFeedback('');
        setIsCorrect(false);
      }, 1500);
    } else {
      setFeedback('❌ Kurang tepat!');
      setTimeout(() => setFeedback(''), 1200);
    }
  };

  return (
    <div className="text-center">
      <div className="mb-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
        <h3 className="font-bold text-amber-800 mb-1">👔 Tebak Profesi</h3>
        <p className="text-amber-700 text-sm">
          Tebak pekerjaan dari deskripsinya!
        </p>
      </div>

      <div className="bg-white border border-amber-200 rounded-xl p-4 mb-4 italic text-amber-900">
        "{quiz.clue}"
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <input
            type="text"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            placeholder="Apa profesinya?"
            className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-200 focus:border-amber-500 outline-none text-center text-sm"
            autoFocus
          />
          {feedback && (
            <div className={`absolute -bottom-6 left-0 right-0 text-center text-sm font-medium ${
              feedback.includes('Tepat') ? 'text-emerald-600' : 'text-rose-600'
            }`}>
              {feedback}
            </div>
          )}
        </div>
        
        <button
          type="submit"
          disabled={isCorrect}
          className="w-full px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-xl shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-70"
        >
          Tebak!
        </button>
      </form>

      <p className="mt-4 text-xs text-slate-500">
        Soal {current + 1} dari {PROFESSIONS.length}
      </p>
    </div>
  );
}

function TwoTruthsGame() {
  const [statements, setStatements] = useState(['', '', '']);
  const [lieIndex, setLieIndex] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleStatementChange = (index, value) => {
    const newStatements = [...statements];
    newStatements[index] = value;
    setStatements(newStatements);
    if (error) setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = statements.map(s => s.trim());
    if (trimmed.some(s => s === '')) {
      setError('Isi ketiga pernyataan dulu!');
      return;
    }
    if (new Set(trimmed).size !== 3) {
      setError('Pernyataan harus berbeda!');
      return;
    }
    setSubmitted(true);
    setError('');
  };

  const resetGame = () => {
    setStatements(['', '', '']);
    setLieIndex(null);
    setSubmitted(false);
    setError('');
  };

  return (
    <div className="text-center">
      <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="font-bold text-blue-800 mb-1">🎭 2 Truths and a Lie</h3>
        <p className="text-blue-700 text-sm">
          Buat 2 pernyataan benar dan 1 bohong. Lalu tebak mana yang bohong!
        </p>
      </div>

      {!submitted ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="text-left">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Pernyataan {i + 1}
              </label>
              <input
                type="text"
                value={statements[i]}
                onChange={(e) => handleStatementChange(i, e.target.value)}
                placeholder={`Ketik pernyataan ${i + 1}...`}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none text-sm"
              />
            </div>
          ))}
          
          {error && <p className="text-rose-600 text-sm font-medium mb-2">{error}</p>}
          
          <button
            type="submit"
            className="w-full mt-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
          >
            Generate Tebakan
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          <p className="font-medium text-slate-800">❓ <strong>Mana yang bohong?</strong></p>
          
          <div className="space-y-3">
            {statements.map((stmt, i) => (
              <button
                key={i}
                onClick={() => setLieIndex(i)}
                className={`w-full p-3 text-left rounded-xl border transition-all ${
                  lieIndex === i
                    ? 'border-rose-300 bg-rose-50 text-rose-800'
                    : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
                }`}
              >
                {stmt}
              </button>
            ))}
          </div>

          {lieIndex !== null && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
              <p className="font-medium text-emerald-800">
                Kamu memilih pernyataan {lieIndex + 1} sebagai kebohongan!
              </p>
              <p className="text-emerald-700 text-sm mt-1">
                Ingat: hanya kamu yang tahu mana yang benar/bohong 😏
              </p>
            </div>
          )}

          <button
            onClick={resetGame}
            className="w-full px-4 py-2.5 bg-gradient-to-r from-slate-600 to-slate-700 text-white font-medium rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
          >
            Buat Lagi
          </button>
        </div>
      )}
    </div>
  );
}

// ========== HALAMAN UTAMA ==========
export default function IceBreakerPage() {
  const [activeTab, setActiveTab] = useState('kata');
  const [isMultiplayer, setIsMultiplayer] = useState(false);
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [currentPlayer, setCurrentPlayer] = useState(1);

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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const tabs = [
    { id: 'kata', label: 'Kata Berantai', icon: '🔄', color: 'from-pink-500 to-purple-500' },
    { id: 'emoji', label: 'Emoji Story', icon: '📱', color: 'from-purple-500 to-indigo-500' },
    { id: 'profesi', label: 'Tebak Profesi', icon: '👔', color: 'from-amber-500 to-orange-500' },
    { id: 'lie', label: '2 Truths & Lie', icon: '🎭', color: 'from-blue-500 to-cyan-500' },
  ];

  const toggleMultiplayer = () => {
    setIsMultiplayer(!isMultiplayer);
    setPlayer1Score(0);
    setPlayer2Score(0);
    setCurrentPlayer(1);
  };

  const resetScores = () => {
    setPlayer1Score(0);
    setPlayer2Score(0);
    setCurrentPlayer(1);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 relative">
      {/* Header dengan indikator */}
      <div className="text-center mb-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="inline-block bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 px-4 py-1.5 rounded-full text-sm font-medium border border-pink-200 mb-3">
              🌸 Untuk Ibu Multitasking
            </div>
            <h1 className="text-2xl font-bold text-slate-800">🎉 Ice Breaker Mini Games</h1>
            <p className="text-slate-600 mt-2 text-sm">
              Refreshing 5 menit atau ajak suami untuk quality time!
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
      </div>

      {/* Mode Toggle */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setIsMultiplayer(false)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              !isMultiplayer 
                ? 'bg-white text-slate-800 shadow-sm' 
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            Solo
          </button>
          <button
            onClick={toggleMultiplayer}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              isMultiplayer 
                ? 'bg-white text-slate-800 shadow-sm' 
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            Multiplayer
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`px-4 py-2.5 font-medium rounded-xl transition-all duration-200 flex items-center gap-1.5 ${
              activeTab === tab.id
                ? `bg-gradient-to-r ${tab.color} text-white shadow-md`
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-sm'
            }`}
            onClick={() => {
              setActiveTab(tab.id);
              if (['emoji', 'profesi'].includes(tab.id)) {
                setPlayer1Score(0);
                setPlayer2Score(0);
                setCurrentPlayer(1);
              }
            }}
          >
            <span>{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Score Board */}
      {['emoji', 'profesi'].includes(activeTab) && (
        <ScoreBoard 
          player1Score={player1Score} 
          player2Score={player2Score} 
          currentPlayer={currentPlayer} 
          isMultiplayer={isMultiplayer} 
        />
      )}

      {/* Game Content */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 min-h-[420px] flex flex-col">
          {activeTab === 'kata' && <KataBerantaiGame />}
          {activeTab === 'emoji' && (
            <EmojiStoryGame 
              player1Score={player1Score}
              setPlayer1Score={setPlayer1Score}
              player2Score={player2Score}
              setPlayer2Score={setPlayer2Score}
              currentPlayer={currentPlayer}
              setCurrentPlayer={setCurrentPlayer}
              isMultiplayer={isMultiplayer}
            />
          )}
          {activeTab === 'profesi' && (
            <TebakProfesiGame 
              player1Score={player1Score}
              setPlayer1Score={setPlayer1Score}
              player2Score={player2Score}
              setPlayer2Score={setPlayer2Score}
              currentPlayer={currentPlayer}
              setCurrentPlayer={setCurrentPlayer}
              isMultiplayer={isMultiplayer}
            />
          )}
          {activeTab === 'lie' && <TwoTruthsGame />}
        </div>
      </div>

      {/* Reset Button */}
      {['emoji', 'profesi'].includes(activeTab) && (
        <div className="text-center mt-4">
          <button
            onClick={resetScores}
            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 font-medium"
          >
            🔄 Reset Skor
          </button>
        </div>
      )}

      <p className="text-center text-xs text-slate-500 mt-6">
        💡 Main sendiri untuk refreshing, atau ajak suami/anak untuk quality time!
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