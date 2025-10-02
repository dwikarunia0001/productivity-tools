'use client';

import { useState, useEffect, useRef } from 'react';
import { format, parseISO, isToday, isTomorrow } from 'date-fns';
import { id } from 'date-fns/locale';

// ========== KOMPONEN UTAMA ==========
export default function NotesAndTasksPage() {
  // === CATATAN ===
  const [notes, setNotes] = useState('');
  const notesRef = useRef(null);

  // === TUGAS ===
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({
    title: '',
    priority: 'medium', // 'high', 'medium', 'low'
    deadline: '',
  });
  const [filter, setFilter] = useState('active'); // 'all', 'active', 'completed'
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  // === LOAD DATA DARI LOCAL STORAGE ===
  useEffect(() => {
    // Load catatan
    const savedNotes = localStorage.getItem('managher-notes');
    if (savedNotes) setNotes(savedNotes);

    // Load tugas
    const savedTasks = localStorage.getItem('managher-tasks');
    if (savedTasks) {
      try {
        const parsed = JSON.parse(savedTasks);
        // Pastikan semua tugas punya id
        const tasksWithId = parsed.map(task => ({
          ...task,
          id: task.id || Date.now() + Math.random()
        }));
        setTasks(tasksWithId);
      } catch (e) {
        console.error('Gagal load tugas:', e);
      }
    }
  }, []);

  // === SIMPAN CATATAN SECARA OTOMATIS ===
  useEffect(() => {
    if (notesRef.current) return; // skip first render
    const timer = setTimeout(() => {
      localStorage.setItem('managher-notes', notes);
    }, 2000);
    return () => clearTimeout(timer);
  }, [notes]);

  // Simpan ref untuk skip first render
  useEffect(() => {
    notesRef.current = true;
  }, []);

  // === SIMPAN TUGAS KE LOCAL STORAGE ===
  useEffect(() => {
    localStorage.setItem('managher-tasks', JSON.stringify(tasks));
  }, [tasks]);

  // === FUNGSI CATATAN ===
  const handleNotesChange = (e) => {
    setNotes(e.target.value);
  };

  const formatText = (command) => {
    const textarea = document.getElementById('notes-textarea');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = notes.substring(start, end);
    let newText = '';

    switch (command) {
      case 'bold':
        newText = `**${selectedText || 'teks tebal'}**`;
        break;
      case 'italic':
        newText = `*${selectedText || 'teks miring'}*`;
        break;
      case 'bullet':
        newText = `- ${selectedText || 'item daftar'}\n`;
        break;
      case 'check':
        newText = `- [ ] ${selectedText || 'tugas'}\n`;
        break;
      default:
        return;
    }

    const before = notes.substring(0, start);
    const after = notes.substring(end);
    setNotes(before + newText + after);
    
    // Fokus kembali ke textarea
    setTimeout(() => {
      textarea.focus();
      const pos = start + newText.length;
      textarea.setSelectionRange(pos, pos);
    }, 0);
  };

  // Render catatan dengan format dasar
  const renderNotes = () => {
    if (!notes.trim()) return <p className="text-slate-400 italic">Belum ada catatan...</p>;
    
    return notes.split('\n').map((line, i) => {
      if (line.startsWith('- [x] ')) {
        return (
          <div key={i} className="flex items-start gap-2 mb-1">
            <input 
              type="checkbox" 
              checked 
              readOnly 
              className="mt-1"
            />
            <span className="line-through text-slate-500">{line.substring(6)}</span>
          </div>
        );
      }
      if (line.startsWith('- [ ] ')) {
        return (
          <div key={i} className="flex items-start gap-2 mb-1">
            <input 
              type="checkbox" 
              readOnly 
              className="mt-1"
            />
            <span>{line.substring(6)}</span>
          </div>
        );
      }
      if (line.startsWith('- ')) {
        return (
          <div key={i} className="flex items-start gap-2 mb-1">
            <span className="text-slate-400">•</span>
            <span>{line.substring(2)}</span>
          </div>
        );
      }
      
      // Handle bold dan italic sederhana
      let formattedLine = line
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');
      
      return (
        <p 
          key={i} 
          className="mb-2"
          dangerouslySetInnerHTML={{ __html: formattedLine }} 
        />
      );
    });
  };

  // === FUNGSI TUGAS ===
  const addTask = (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;
    
    const task = {
      id: Date.now(),
      title: newTask.title.trim(),
      priority: newTask.priority,
      deadline: newTask.deadline || null,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    
    setTasks([task, ...tasks]);
    setNewTask({ title: '', priority: 'medium', deadline: '' });
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const startEditing = (task) => {
    setEditingId(task.id);
    setEditTitle(task.title);
  };

  const saveEdit = (id) => {
    if (!editTitle.trim()) return;
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, title: editTitle.trim() } : task
    ));
    setEditingId(null);
  };

  const updatePriority = (id, priority) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, priority } : task
    ));
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'high': return 'Tinggi';
      case 'medium': return 'Sedang';
      case 'low': return 'Rendah';
      default: return 'Normal';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Tidak ada deadline';
    const date = parseISO(dateString);
    if (isToday(date)) return 'Hari ini';
    if (isTomorrow(date)) return 'Besok';
    return format(date, 'd MMM yyyy', { locale: id });
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-block bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 px-4 py-1.5 rounded-full text-sm font-medium border border-pink-200 mb-3">
          🌸 Untuk Ibu Multitasking
        </div>
        <h1 className="text-2xl font-bold text-slate-800">📝 Catatan & Tugas</h1>
        <p className="text-slate-600 mt-2 text-sm">
          Tangkap ide kilat dan atur tugas harianmu dalam satu tempat!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ========== CATATAN CEPAT ========== */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-pink-50">
            <h2 className="font-bold text-pink-800 flex items-center gap-2">
              <span>📝</span> Catatan Cepat
            </h2>
            <p className="text-pink-700 text-xs mt-1">
              Tulis ide, rapat, atau to-do list. Format: **tebal**, *miring*, - daftar, - [ ] checklist
            </p>
          </div>
          
          {/* Toolbar Format */}
          <div className="p-3 border-b border-slate-100 bg-slate-50 flex flex-wrap gap-2">
            <button
              onClick={() => formatText('bold')}
              className="px-2.5 py-1 text-xs bg-white border border-slate-300 rounded hover:bg-slate-100"
              title="Tebal"
            >
              <strong>B</strong>
            </button>
            <button
              onClick={() => formatText('italic')}
              className="px-2.5 py-1 text-xs bg-white border border-slate-300 rounded hover:bg-slate-100"
              title="Miring"
            >
              <em>I</em>
            </button>
            <button
              onClick={() => formatText('bullet')}
              className="px-2.5 py-1 text-xs bg-white border border-slate-300 rounded hover:bg-slate-100"
              title="Daftar"
            >
              •
            </button>
            <button
              onClick={() => formatText('check')}
              className="px-2.5 py-1 text-xs bg-white border border-slate-300 rounded hover:bg-slate-100"
              title="Checklist"
            >
              ☑
            </button>
          </div>
          
          {/* Area Teks */}
          <div className="p-4">
            <textarea
              id="notes-textarea"
              value={notes}
              onChange={handleNotesChange}
              placeholder="Tulis catatanmu di sini...&#10;&#10;Contoh:&#10;- [ ] Beli bahan brownies&#10;- [x] Kirim invoice ke Bu Siti&#10;**Deadline:** besok jam 10.00"
              className="w-full h-64 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-200 focus:border-pink-500 outline-none resize-none text-sm font-mono"
              style={{ whiteSpace: 'pre-wrap' }}
            />
            <p className="text-xs text-slate-500 mt-2 text-right">
              Auto-simpan • Format: **tebal**, *miring*, - daftar, - [ ] checklist
            </p>
          </div>
        </div>

        {/* ========== MANAJEMEN TUGAS ========== */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-purple-50">
            <h2 className="font-bold text-purple-800 flex items-center gap-2">
              <span>✅</span> Manajemen Tugas
            </h2>
            <p className="text-purple-700 text-xs mt-1">
              Buat, atur deadline, dan tandai tugas selesai!
            </p>
          </div>
          
          {/* Form Tambah Tugas */}
          <form onSubmit={addTask} className="p-4 border-b border-slate-100 bg-slate-50">
            <div className="space-y-3">
              <input
                type="text"
                value={newTask.title}
                onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                placeholder="Apa yang perlu dikerjakan?"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none text-sm"
              />
              
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                  className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none text-sm"
                >
                  <option value="high">🔴 Prioritas Tinggi</option>
                  <option value="medium">🟡 Prioritas Sedang</option>
                  <option value="low">🟢 Prioritas Rendah</option>
                </select>
                
                <input
                  type="date"
                  value={newTask.deadline}
                  onChange={(e) => setNewTask({...newTask, deadline: e.target.value})}
                  className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none text-sm"
                />
              </div>
              
              <button
                type="submit"
                className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all"
              >
                + Tambah Tugas
              </button>
            </div>
          </form>
          
          {/* Filter */}
          <div className="p-3 border-b border-slate-100 bg-slate-50">
            <div className="flex gap-2 justify-center">
              {[
                { key: 'all', label: 'Semua', count: tasks.length },
                { key: 'active', label: 'Aktif', count: tasks.filter(t => !t.completed).length },
                { key: 'completed', label: 'Selesai', count: tasks.filter(t => t.completed).length }
              ].map(filterOpt => (
                <button
                  key={filterOpt.key}
                  onClick={() => setFilter(filterOpt.key)}
                  className={`px-3 py-1.5 text-xs rounded-full ${
                    filter === filterOpt.key
                      ? 'bg-purple-100 text-purple-800 font-medium'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {filterOpt.label} ({filterOpt.count})
                </button>
              ))}
            </div>
          </div>
          
          {/* Daftar Tugas */}
          <div className="p-4 max-h-96 overflow-y-auto">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                  <span className="text-slate-400 text-lg">✅</span>
                </div>
                {filter === 'completed' 
                  ? 'Belum ada tugas yang selesai.' 
                  : 'Belum ada tugas. Tambahkan sekarang!'}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTasks.map(task => (
                  <div 
                    key={task.id} 
                    className={`p-3 rounded-xl border ${
                      task.completed 
                        ? 'bg-slate-50 border-slate-200' 
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTask(task.id)}
                        className="mt-1 h-5 w-5 rounded"
                      />
                      
                      <div className="flex-1 min-w-0">
                        {editingId === task.id ? (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="flex-1 px-2 py-1 border border-slate-300 rounded text-sm"
                              autoFocus
                            />
                            <button
                              onClick={() => saveEdit(task.id)}
                              className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded text-xs"
                            >
                              Simpan
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${
                              task.completed ? 'line-through text-slate-500' : 'text-slate-800'
                            }`}>
                              {task.title}
                            </span>
                            {task.deadline && (
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                isToday(parseISO(task.deadline)) 
                                  ? 'bg-red-100 text-red-800' 
                                  : 'bg-slate-100 text-slate-700'
                              }`}>
                                {formatDate(task.deadline)}
                              </span>
                            )}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 mt-2">
                          <select
                            value={task.priority}
                            onChange={(e) => updatePriority(task.id, e.target.value)}
                            disabled={editingId === task.id || task.completed}
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              getPriorityColor(task.priority)
                            } ${task.completed ? 'opacity-50' : ''}`}
                          >
                            <option value="high">🔴 Tinggi</option>
                            <option value="medium">🟡 Sedang</option>
                            <option value="low">🟢 Rendah</option>
                          </select>
                          
                          {!task.completed && editingId !== task.id && (
                            <button
                              onClick={() => startEditing(task)}
                              className="text-xs text-slate-500 hover:text-slate-700"
                            >
                              Edit
                            </button>
                          )}
                          
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="ml-auto text-xs text-rose-500 hover:text-rose-700"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-slate-500 mt-8">
        💡 Catatan dan tugas otomatis tersimpan di browser ini. Aman dan privat!
      </p>
    </div>
  );
}