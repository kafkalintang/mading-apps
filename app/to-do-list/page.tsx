'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Check,
  ClipboardList,
  Pencil,
  Plus,
  Rocket,
  Search,
  Trash2,
  Lock,
} from 'lucide-react';

/* ============================================================
   TYPES
============================================================ */
type Priority = 'high' | 'medium' | 'low';
type Filter = 'all' | 'active' | 'done';

interface Todo {
  id: string;
  text: string;
  done: boolean;
  priority: Priority;
  deadline: string; // format yyyy-mm-dd, boleh kosong
  createdAt: number;
}

/* ============================================================
   KONFIGURASI PRIORITAS
============================================================ */
const PRIORITY_CONFIG: Record<
  Priority,
  { label: string; badge: string; dot: string; order: number }
> = {
  high: {
    label: 'Tinggi',
    badge: 'bg-red-50 text-red-700 ring-1 ring-red-200',
    dot: 'bg-red-500',
    order: 0,
  },
  medium: {
    label: 'Sedang',
    badge: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    dot: 'bg-amber-500',
    order: 1,
  },
  low: {
    label: 'Rendah',
    badge: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    dot: 'bg-emerald-500',
    order: 2,
  },
};

const STORAGE_KEY = 'mading:todo-list:v1';

/* ============================================================
   HELPER
============================================================ */
function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function formatDate(iso: string) {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function isOverdue(iso: string) {
  if (!iso) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(iso + 'T00:00:00') < today;
}

/* ============================================================
   PAGE
============================================================ */
export default function TodoListPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loaded, setLoaded] = useState(false);

  // form
  const [text, setText] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [deadline, setDeadline] = useState('');

  // filter & search
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');

  // edit
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  /* ---------- load dari localStorage ---------- */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setTodos(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, []);

  /* ---------- simpan otomatis ---------- */
  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos, loaded]);

  /* ---------- aksi ---------- */
  function addTodo(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    const newTodo: Todo = {
      id: uid(),
      text: trimmed,
      done: false,
      priority,
      deadline,
      createdAt: Date.now(),
    };

    setTodos((prev) => [newTodo, ...prev]);
    setText('');
    setPriority('medium');
    setDeadline('');
  }

  function toggleTodo(id: string) {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  }

  function deleteTodo(id: string) {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }

  function startEdit(todo: Todo) {
    setEditingId(todo.id);
    setEditText(todo.text);
  }

  function saveEdit(id: string) {
    const trimmed = editText.trim();
    if (!trimmed) return;
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, text: trimmed } : t))
    );
    setEditingId(null);
    setEditText('');
  }

  function clearDone() {
    setTodos((prev) => prev.filter((t) => !t.done));
  }

  /* ---------- turunan ---------- */
  const stats = useMemo(() => {
    const total = todos.length;
    const done = todos.filter((t) => t.done).length;
    const active = total - done;
    const percent = total === 0 ? 0 : Math.round((done / total) * 100);
    return { total, done, active, percent };
  }, [todos]);

  const visibleTodos = useMemo(() => {
    const q = query.trim().toLowerCase();
    return todos
      .filter((t) => {
        if (filter === 'active' && t.done) return false;
        if (filter === 'done' && !t.done) return false;
        if (q && !t.text.toLowerCase().includes(q)) return false;
        return true;
      })
      .sort((a, b) => {
        // yang belum selesai dulu, lalu prioritas, lalu deadline
        if (a.done !== b.done) return a.done ? 1 : -1;
        const p =
          PRIORITY_CONFIG[a.priority].order - PRIORITY_CONFIG[b.priority].order;
        if (p !== 0) return p;
        if (a.deadline && b.deadline)
          return a.deadline.localeCompare(b.deadline);
        if (a.deadline) return -1;
        if (b.deadline) return 1;
        return b.createdAt - a.createdAt;
      });
  }, [todos, filter, query]);

  /* ============================================================
     RENDER
  ============================================================ */
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/60 via-white to-indigo-50/40 p-6 md:p-10">
      <div className="mx-auto max-w-3xl">
        {/* HEADER */}
        <header className="mb-8">
          <h1 className="flex items-center gap-2.5 text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-800 to-indigo-600 md:text-4xl">
            <ClipboardList className="h-8 w-8 text-blue-700" strokeWidth={2.25} />
            To-Do List
          </h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
            Kelola tugas harianmu biar makin produktif
            <Rocket className="h-4 w-4 text-indigo-500" />
          </p>
        </header>

        {/* STATISTIK */}
        <section className="mb-6 rounded-2xl bg-white/80 backdrop-blur p-5 shadow-sm ring-1 ring-blue-100">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-gray-700">
              Progress:{' '}
              <span className="font-semibold text-blue-700">
                {stats.percent}%
              </span>
            </span>
            <span className="text-gray-500">
              {stats.done} selesai &middot; {stats.active} aktif &middot;{' '}
              {stats.total} total
            </span>
          </div>
          <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-blue-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500"
              style={{ width: `${stats.percent}%` }}
            />
          </div>
        </section>

        {/* FORM TAMBAH */}
        <form
          onSubmit={addTodo}
          className="mb-6 rounded-2xl bg-white/80 backdrop-blur p-4 shadow-sm ring-1 ring-blue-100"
        >
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Tambah tugas baru..."
              className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            >
              <option value="high">Tinggi</option>
              <option value="medium">Sedang</option>
              <option value="low">Rendah</option>
            </select>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-600 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" strokeWidth={2.5} />
              Tambah
            </button>
          </div>
        </form>

        {/* FILTER & SEARCH */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-1 rounded-xl bg-white/70 p-1 ring-1 ring-blue-100">
            {(['all', 'active', 'done'] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition ${
                  filter === f
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {f === 'all' ? 'Semua' : f === 'active' ? 'Aktif' : 'Selesai'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-56">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari tugas..."
                className="w-full rounded-xl border border-gray-200 bg-white/80 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            {stats.done > 0 && (
              <button
                onClick={clearDone}
                className="inline-flex items-center gap-1 whitespace-nowrap rounded-xl px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Hapus selesai
              </button>
            )}
          </div>
        </div>

        {/* DAFTAR */}
        <ul className="flex flex-col gap-2.5">
          {visibleTodos.length === 0 && (
            <li className="rounded-2xl border border-dashed border-blue-200 bg-white/50 py-14 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <ClipboardList className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium text-gray-700">
                Belum ada tugas
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {query || filter !== 'all'
                  ? 'Coba ubah filter atau kata kunci pencarian.'
                  : 'Tambahkan tugas pertamamu di atas.'}
              </p>
            </li>
          )}

          {visibleTodos.map((todo) => {
            const cfg = PRIORITY_CONFIG[todo.priority];
            const overdue = !todo.done && isOverdue(todo.deadline);
            const isEditing = editingId === todo.id;

            return (
              <li
                key={todo.id}
                className={`group flex items-start gap-3 rounded-2xl bg-white/85 p-4 shadow-sm ring-1 transition hover:shadow-md ${
                  todo.done ? 'opacity-70 ring-gray-100' : 'ring-blue-100'
                }`}
              >
                {/* checkbox */}
                <button
                  onClick={() => toggleTodo(todo.id)}
                  aria-label={
                    todo.done ? 'Tandai belum selesai' : 'Tandai selesai'
                  }
                  className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition ${
                    todo.done
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-gray-300 hover:border-blue-500'
                  }`}
                >
                  {todo.done && <Check className="h-3 w-3" strokeWidth={3} />}
                </button>

                {/* konten */}
                <div className="min-w-0 flex-1">
                  {isEditing ? (
                    <div className="flex gap-2">
                      <input
                        autoFocus
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEdit(todo.id);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        className="flex-1 rounded-lg border border-blue-300 px-2.5 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-100"
                      />
                      <button
                        onClick={() => saveEdit(todo.id)}
                        className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
                      >
                        Simpan
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100"
                      >
                        Batal
                      </button>
                    </div>
                  ) : (
                    <>
                      <p
                        className={`break-words text-sm ${
                          todo.done
                            ? 'text-gray-400 line-through'
                            : 'font-medium text-gray-800'
                        }`}
                      >
                        {todo.text}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium ${cfg.badge}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`}
                          />
                          {cfg.label}
                        </span>

                        {todo.deadline && (
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 ${
                              overdue
                                ? 'bg-red-50 text-red-600 ring-1 ring-red-200'
                                : 'bg-gray-50 text-gray-600 ring-1 ring-gray-200'
                            }`}
                          >
                            <Calendar className="h-3 w-3" />
                            {formatDate(todo.deadline)}
                            {overdue && ' \u00b7 terlambat'}
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* aksi */}
                {!isEditing && (
                  <div className="flex flex-shrink-0 gap-1 opacity-0 transition group-hover:opacity-100">
                    <button
                      onClick={() => startEdit(todo)}
                      aria-label="Edit"
                      className="rounded-lg p-1.5 text-gray-400 transition hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      aria-label="Hapus"
                      className="rounded-lg p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        {/* footer hint */}
        <p className="mt-8 flex items-center justify-center gap-1.5 text-center text-xs text-gray-400">
          <Lock className="h-3 w-3" />
          Data tersimpan otomatis di browser kamu
        </p>
      </div>
    </div>
  );
}