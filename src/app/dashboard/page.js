// src/app/dashboard/page.js
export default function DashboardPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">📊 Dashboard Ringkasan</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Event Hari Ini" value="3" color="bg-blue-100" />
        <StatCard title="To-Do Selesai" value="5/8" color="bg-emerald-100" />
        <StatCard title="Sesi Pomodoro" value="4" color="bg-amber-100" />
      </div>
      <div className="mt-8 p-4 bg-white rounded-xl border">
        <h2 className="font-semibold text-slate-800 mb-2">Aktivitas Terbaru</h2>
        <p className="text-slate-600 text-sm">Belum ada aktivitas. Mulai gunakan alat-alat di sidebar!</p>
      </div>
    </div>
  );
}

function StatCard({ title, value, color }) {
  return (
    <div className={`${color} p-4 rounded-xl`}>
      <h3 className="text-slate-700 text-sm">{title}</h3>
      <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
    </div>
  );
}