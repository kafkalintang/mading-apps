
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
  CircleCheck,
  ListTodo,
  Clock3,
  Sparkles,
  X,
} from 'lucide-react';

type Priority = 'high' | 'medium' | 'low';
type Filter = 'all' | 'active' | 'done';

interface Todo {
  id: string;
  text: string;
  done: boolean;
  priority: Priority;
  deadline: string;
  createdAt: number;
}

const PRIORITY_CONFIG: Record<
  Priority,
  { label: string; badge: string; dot: string; order: number }
> = {
  high: {
    label: 'Tinggi',
    badge: 'bg-rose-50 text-rose-600 border-rose-100',
    dot: 'bg-rose-500',
    order: 0,
  },
  medium: {
    label: 'Sedang',
    badge: 'bg-amber-50 text-amber-600 border-amber-100',
    dot: 'bg-amber-500',
    order: 1,
  },
  low: {
    label: 'Rendah',
    badge: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    dot: 'bg-emerald-500',
    order: 2,
  },
};

const STORAGE_KEY = 'mading:todo-list:v1';

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

export default function TodoListPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [text, setText] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [deadline, setDeadline] = useState('');

  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setTodos(JSON.parse(raw));
    } catch {
      // ignore
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos, loaded]);

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

  function cancelEdit() {
    setEditingId(null);
    setEditText('');
  }

  function clearDone() {
    setTodos((prev) => prev.filter((t) => !t.done));
  }

  const stats = useMemo(() => {
    const total = todos.length;
    const done = todos.filter((t) => t.done).length;
    const active = total - done;
    const percent = total === 0 ? 0 : Math.round((done / total) * 100);
    const high = todos.filter((t) => !t.done && t.priority === 'high').length;

    return { total, done, active, percent, high };
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
        if (a.done !== b.done) return a.done ? 1 : -1;

        const p =
          PRIORITY_CONFIG[a.priority].order -
          PRIORITY_CONFIG[b.priority].order;

        if (p !== 0) return p;

        if (a.deadline && b.deadline)
          return a.deadline.localeCompare(b.deadline);

        if (a.deadline) return -1;
        if (b.deadline) return 1;

        return b.createdAt - a.createdAt;
      });
  }, [todos, filter, query]);

  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-[#f6f8fc] px-4 py-6 text-slate-800 sm:px-6 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-5xl">

        {/* HEADER */}
        <header className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-blue-600">
              <Sparkles className="h-4 w-4" />
              Productivity workspace
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              To Do List
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Kelola tugasmu, selesaikan satu per satu.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Hari ini</p>
              <p className="text-sm font-semibold text-slate-700">{today}</p>
            </div>
          </div>
        </header>

        {/* HERO PROGRESS */}
        <section className="relative mb-7 overflow-hidden rounded-[28px] bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-600 p-6 text-white shadow-xl shadow-blue-200/50 sm:p-8">
          <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-24 right-32 h-48 w-48 rounded-full bg-indigo-300/20 blur-3xl" />

          <div className="relative z-10 flex flex-col justify-between gap-8 md:flex-row md:items-center">
            <div className="max-w-md">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-blue-50">
                <Rocket className="h-3.5 w-3.5" />
                Keep moving forward
              </div>

              <h2 className="text-2xl font-bold sm:text-3xl">
                {stats.percent === 100 && stats.total > 0
                  ? 'Semua tugas selesai!'
                  : stats.done > 0
                  ? 'Progress yang bagus!'
                  : 'Siap memulai hari?'}
              </h2>

              <p className="mt-2 text-sm leading-relaxed text-blue-100">
                {stats.total === 0
                  ? 'Tambahkan tugas pertamamu dan mulai produktif hari ini.'
                  : `${stats.done} dari ${stats.total} tugas sudah kamu selesaikan. Terus lanjutkan!`}
              </p>
            </div>

            <div className="flex items-center gap-5">
              <div className="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full bg-white/10 sm:h-32 sm:w-32">
                <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    stroke="rgba(255,255,255,0.15)"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    stroke="white"
                    strokeWidth="8"
                    strokeLinecap="round"
                    fill="none"
                    strokeDasharray={`${stats.percent * 2.64} 264`}
                    className="transition-all duration-700"
                  />
                </svg>

                <div className="text-center">
                  <span className="text-3xl font-bold">{stats.percent}%</span>
                  <p className="text-[10px] font-medium text-blue-100">progress</p>
                </div>
              </div>

              <div className="hidden min-w-[130px] sm:block">
                <p className="text-sm text-blue-100">Target penyelesaian</p>
                <p className="mt-1 text-2xl font-bold">
                  {stats.done}/{stats.total}
                </p>
                <p className="text-xs text-blue-100">Tugas selesai</p>
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="mb-7 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <ListTodo className="h-5 w-5" />
              </div>
              <span className="text-xs text-slate-400">Semua</span>
            </div>
            <p className="mt-4 text-3xl font-bold text-slate-800">{stats.total}</p>
            <p className="mt-1 text-sm text-slate-500">Total tugas</p>
          </div>

          <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Clock3 className="h-5 w-5" />
              </div>
              <span className="text-xs text-slate-400">Pending</span>
            </div>
            <p className="mt-4 text-3xl font-bold text-slate-800">{stats.active}</p>
            <p className="mt-1 text-sm text-slate-500">Tugas aktif</p>
          </div>

          <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <CircleCheck className="h-5 w-5" />
              </div>
              <span className="text-xs text-slate-400">Completed</span>
            </div>
            <p className="mt-4 text-3xl font-bold text-slate-800">{stats.done}</p>
            <p className="mt-1 text-sm text-slate-500">Tugas selesai</p>
          </div>

          <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                <Rocket className="h-5 w-5" />
              </div>
              <span className="text-xs text-slate-400">Urgent</span>
            </div>
            <p className="mt-4 text-3xl font-bold text-slate-800">{stats.high}</p>
            <p className="mt-1 text-sm text-slate-500">Prioritas tinggi</p>
          </div>
        </section>

        {/* ADD TASK */}
        <section className="mb-7 rounded-[24px] border border-slate-200/70 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h3 className="text-lg font-bold text-slate-800">Tambah tugas baru</h3>
            <p className="mt-1 text-sm text-slate-400">
              Catat apa yang perlu kamu selesaikan.
            </p>
          </div>

          <form onSubmit={addTodo}>
            <div className="flex flex-col gap-3">
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Apa yang ingin kamu kerjakan?"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
              />

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-500">
                    Prioritas
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                  >
                    <option value="high">🔴 Tinggi</option>
                    <option value="medium">🟡 Sedang</option>
                    <option value="low">🟢 Rendah</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-500">
                    Deadline
                  </label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-600 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={!text.trim()}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-100 transition hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
                  >
                    <Plus className="h-4 w-4" />
                    Tambah tugas
                  </button>
                </div>
              </div>
            </div>
          </form>
        </section>

        {/* TASK LIST SECTION */}
        <section className="rounded-[24px] border border-slate-200/70 bg-white p-5 shadow-sm sm:p-6">
          {/* LIST HEADER */}
          <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Daftar tugas</h3>
              <p className="mt-1 text-sm text-slate-400">
                Tugasmu, tersusun berdasarkan prioritas.
              </p>
            </div>
          </div>

          {/* SEARCH */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari tugas..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* FILTER */}
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex rounded-xl bg-slate-100 p-1">
              {(['all', 'active', 'done'] as Filter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-lg px-4 py-2 text-xs font-semibold transition sm:text-sm ${
                    filter === f
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {f === 'all' ? 'Semua' : f === 'active' ? 'Aktif' : 'Selesai'}
                  <span className="ml-1.5 opacity-70">
                    {f === 'all'
                      ? stats.total
                      : f === 'active'
                      ? stats.active
                      : stats.done}
                  </span>
                </button>
              ))}
            </div>

            {stats.done > 0 && (
              <button
                onClick={clearDone}
                className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-rose-500 transition hover:bg-rose-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Hapus selesai
              </button>
            )}
          </div>

          {/* TASKS */}
          <ul className="flex flex-col gap-3">
            {visibleTodos.length === 0 && (
              <li className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-14 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-500">
                  <ClipboardList className="h-7 w-7" />
                </div>
                <p className="font-semibold text-slate-700">Belum ada tugas</p>
                <p className="mt-1 text-sm text-slate-400">
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
                  className={`group flex items-start gap-3 rounded-2xl border p-4 transition-all duration-200 ${
                    todo.done
                      ? 'border-slate-100 bg-slate-50/70'
                      : overdue
                      ? 'border-rose-100 bg-white hover:border-rose-200 hover:shadow-sm'
                      : 'border-slate-100 bg-white hover:border-blue-100 hover:shadow-sm'
                  }`}
                >
                  {/* CHECK */}
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    aria-label={todo.done ? 'Tandai belum selesai' : 'Tandai selesai'}
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${
                      todo.done
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : 'border-slate-300 hover:border-blue-500 hover:bg-blue-50'
                    }`}
                  >
                    {todo.done && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                  </button>

                  {/* CONTENT */}
                  <div className="min-w-0 flex-1">
                    {isEditing ? (
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <input
                          autoFocus
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit(todo.id);
                            if (e.key === 'Escape') cancelEdit();
                          }}
                          className="min-w-0 flex-1 rounded-xl border border-blue-300 px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-blue-50"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => saveEdit(todo.id)}
                            className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                          >
                            Simpan
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200"
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p
                          className={`break-words text-sm leading-relaxed ${
                            todo.done
                              ? 'text-slate-400 line-through'
                              : 'font-semibold text-slate-700'
                          }`}
                        >
                          {todo.text}
                        </p>

                        <div className="mt-2.5 flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-semibold ${cfg.badge}`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                            {cfg.label}
                          </span>

                          {todo.deadline && (
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-medium ${
                                overdue
                                  ? 'border-rose-100 bg-rose-50 text-rose-600'
                                  : 'border-slate-100 bg-slate-50 text-slate-500'
                              }`}
                            >
                              <Calendar className="h-3 w-3" />
                              {formatDate(todo.deadline)}
                              {overdue && ' · Terlambat'}
                            </span>
                          )}

                          {todo.done && (
                            <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-600">
                              <Check className="h-3 w-3" />
                              Selesai
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  {/* ACTIONS */}
                  {!isEditing && (
                    <div className="flex shrink-0 gap-1 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
                      <button
                        onClick={() => startEdit(todo)}
                        aria-label="Edit"
                        className="rounded-xl p-2 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => deleteTodo(todo.id)}
                        aria-label="Hapus"
                        className="rounded-xl p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          {/* LIST FOOTER */}
          {stats.total > 0 && (
            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
              <p className="text-xs text-slate-400">
                Menampilkan {visibleTodos.length} dari {stats.total} tugas
              </p>
              <p className="text-xs font-medium text-emerald-600">
                {stats.done} selesai
              </p>
            </div>
          )}
        </section>

        {/* FOOTER */}
        <footer className="mt-7 flex flex-col items-center justify-center gap-2 text-center">
          <p className="flex items-center gap-1.5 text-xs text-slate-400">
            <Lock className="h-3.5 w-3.5" />
            Data tersimpan otomatis di browser kamu
          </p>
          <p className="text-[11px] text-slate-300">
            Make today count.
          </p>
        </footer>

      </div>
    </div>
  );
}
