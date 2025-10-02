'use client';

import { useEffect, useMemo } from 'react';
import useCalendarStore from '@/lib/useCalendarStore';
import { usePomodoroStore } from '@/lib/usePomodoroStore';

export default function DashboardPage() {
  const { totalSessions } = usePomodoroStore();
  const { getAllEvents } = useCalendarStore();

  // Hitung event hari ini
  const today = new Date().toISOString().split('T')[0];
  const eventsToday = useCalendarStore.getState().getEventsByDate(today).filter(e => e.type === 'agenda');
  const eventCount = eventsToday.length;

  // Hitung to-do selesai
  const allAgenda = getAllEvents().filter(e => e.type === 'agenda');
  const completedCount = allAgenda.filter(e => e.completed).length;
  const totalCount = allAgenda.length;
  const todoRatio = totalCount > 0 ? `${completedCount}/${totalCount}` : '0';
  const productivityPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // === Hitung Skor ===
  const energyScore = useMemo(() => {
    // Skala: 0-100, berdasarkan sesi Pomodoro (max 10 sesi = 100)
    return Math.min(100, Math.round(totalSessions * 10));
  }, [totalSessions]);

  const productivityScore = useMemo(() => {
    return productivityPercent;
  }, [productivityPercent]);

  const moodScore = useMemo(() => {
    // Kombinasi: 60% produktivitas + 40% energi
    return Math.round(0.6 * productivityScore + 0.4 * energyScore);
  }, [productivityScore, energyScore]);

  // === Pesan Dinamis ===
  const getEncouragementMessage = () => {
    if (moodScore >= 80) {
      return {
        title: "Luar Biasa! 🌟",
        message: "Kamu sangat produktif hari ini! Terus pertahankan semangat ini!",
        emoji: "🎉"
      };
    } else if (moodScore >= 60) {
      return {
        title: "Bagus Sekali! 👏",
        message: "Kamu sudah melakukan hal-hal hebat hari ini. Jangan berhenti sekarang!",
        emoji: "💪"
      };
    } else if (moodScore >= 40) {
      return {
        title: "Lumayan! 🌱",
        message: "Masih ada ruang untuk berkembang. Setiap langkah kecil berarti!",
        emoji: "✨"
      };
    } else {
      return {
        title: "Ayo Bangkit! 🌈",
        message: "Hari ini mungkin berat, tapi besok adalah kesempatan baru. Kamu pasti bisa!",
        emoji: "❤️"
      };
    }
  };

  const { title, message, emoji } = getEncouragementMessage();

  // === Komponen Progress Bar ===
  const ProgressBar = ({ score, color }) => (
    <div className="w-full bg-slate-200 rounded-full h-2.5">
      <div 
        className={`h-2.5 rounded-full ${color}`} 
        style={{ width: `${score}%` }}
      ></div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">📊 Dashboard Ringkasan</h1>
      
      {/* Statistik Utama */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard 
          title="Event Hari Ini" 
          value={eventCount} 
          color="bg-blue-100" 
          icon="📅"
        />
        <StatCard 
          title="To-Do Selesai" 
          value={todoRatio} 
          color="bg-emerald-100" 
          icon="✅"
        />
        <StatCard 
          title="Sesi Pomodoro" 
          value={totalSessions} 
          color="bg-amber-100" 
          icon="🍅"
        />
      </div>

      {/* Skor Energi, Produktivitas, Mood */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <ScoreCard 
          title="Energi" 
          score={energyScore} 
          color="from-purple-400 to-purple-600"
          description="Berdasarkan sesi Pomodoro yang kamu selesaikan"
        />
        <ScoreCard 
          title="Produktivitas" 
          score={productivityScore} 
          color="from-green-400 to-green-600"
          description="Persentase agenda yang sudah kamu selesaikan"
        />
        <ScoreCard 
          title="Mood" 
          score={moodScore} 
          color="from-pink-400 to-pink-600"
          description="Kombinasi energi dan produktivitasmu hari ini"
        />
      </div>

      {/* Pesan Penyemangat */}
      <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">{emoji}</span>
          <h2 className="font-bold text-slate-800 text-lg">{title}</h2>
        </div>
        <p className="text-slate-700">
          {message}
        </p>
        <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
          <span>Skor Mood Hari Ini:</span>
          <span className="font-bold text-slate-800">{moodScore}/100</span>
        </div>
      </div>

      {/* Tips Tambahan */}
      <div className="mt-6 p-4 bg-white rounded-xl border border-slate-200">
        <h3 className="font-semibold text-slate-800 mb-2">💡 Tips Hari Ini</h3>
        <ul className="text-slate-600 text-sm space-y-1">
          <li>• Gunakan Pomodoro Timer untuk fokus 25 menit tanpa gangguan</li>
          <li>• Tandai agenda sebagai "Selesai" untuk meningkatkan produktivitas</li>
          <li>• Istirahat yang cukup juga bagian dari produktivitas!</li>
        </ul>
      </div>
    </div>
  );
}

function StatCard({ title, value, color, icon }) {
  return (
    <div className={`${color} p-4 rounded-xl flex items-center`}>
      <div className="text-2xl mr-3">{icon}</div>
      <div>
        <h3 className="text-slate-700 text-sm">{title}</h3>
        <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
      </div>
    </div>
  );
}

function ScoreCard({ title, score, color, description }) {
  return (
    <div className="bg-white p-4 rounded-xl border shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-slate-800">{title}</h3>
        <span className="text-lg font-bold text-slate-800">{score}</span>
      </div>
      <ProgressBar score={score} color={`bg-gradient-to-r ${color}`} />
      <p className="text-xs text-slate-500 mt-2">{description}</p>
    </div>
  );
}

function ProgressBar({ score, color }) {
  return (
    <div className="w-full bg-slate-200 rounded-full h-2.5 mt-2">
      <div 
        className={`h-2.5 rounded-full ${color}`} 
        style={{ width: `${score}%` }}
      ></div>
    </div>
  );
}