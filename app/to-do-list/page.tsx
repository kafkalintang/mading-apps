
'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  CalendarDays,
  Check,
  ClipboardList,
  Pencil,
  Plus,
  Search,
  Trash2,
  Lock,
  CircleCheck,
  Clock3,
  X,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  BriefcaseBusiness,
  BookOpen,
  UserRound,
  FolderKanban,
  Tag,
  Calendar,
  ListTodo,
  BarChart3,
  ArrowUpRight,
} from 'lucide-react';

type Priority = 'high' | 'medium' | 'low';
type Filter = 'all' | 'active' | 'done';
type Category = 'Personal' | 'Kuliah' | 'Pekerjaan' | 'Project' | 'Lainnya';

interface Todo {
  id: string;
  text: string;
  done: boolean;
  priority: Priority;
  deadline: string;
  category: Category;
  createdAt: number;
}

const STORAGE_KEY = 'mading:todo-list:v1';

const CATEGORIES: Category[] = [
  'Personal',
  'Kuliah',
  'Pekerjaan',
  'Project',
  'Lainnya',
];

const CATEGORY_CONFIG: Record<
  Category,
  { label: string; icon: typeof UserRound; color: string }
> = {
  Personal: {
    label: 'Personal',
    icon: UserRound,
    color: 'bg-sky-50 text-sky-700 border-sky-100',
  },
  Kuliah: {
    label: 'Kuliah',
    icon: BookOpen,
    color: 'bg-blue-50 text-blue-700 border-blue-100',
  },
  Pekerjaan: {
    label: 'Pekerjaan',
    icon: BriefcaseBusiness,
    color: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  Project: {
    label: 'Project',
    icon: FolderKanban,
    color: 'bg-cyan-50 text-cyan-700 border-cyan-100',
  },
  Lainnya: {
    label: 'Lainnya',
    icon: Tag,
    color: 'bg-gray-50 text-gray-600 border-gray-100',
  },
};

const PRIORITY_CONFIG: Record<
  Priority,
  { label: string; color: string; order: number }
> = {
  high: {
    label: 'Tinggi',
    color: 'bg-red-50 text-red-600 border-red-100',
    order: 0,
  },
  medium: {
    label: 'Sedang',
    color: 'bg-amber-50 text-amber-600 border-amber-100',
    order: 1,
  },
  low: {
    label: 'Rendah',
    color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    order: 2,
  },
};

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function toISO(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
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
  return iso < toISO(new Date());
}

function getMonday(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeekDays(date: Date) {
  const monday = getMonday(date);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

export default function TodoListPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [text, setText] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [deadline, setDeadline] = useState('');
  const [category, setCategory] = useState<Category>('Personal');

  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [selectedDate, setSelectedDate] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const [calendarMonth, setCalendarMonth] = useState(new Date());

  // LOAD DATA
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: Todo[] = JSON.parse(raw);
        // kompatibilitas dengan data lama yang belum memiliki kategori
        setTodos(
          parsed.map((t) => ({
            ...t,
            category: t.category || 'Personal',
          }))
        );
      }
    } catch {
      // ignore
    }
    setLoaded(true);
  }, []);

  // SAVE DATA
  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos, loaded]);

  // ADD
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
      category,
      createdAt: Date.now(),
    };

    setTodos((prev) => [newTodo, ...prev]);
    setText('');
    setPriority('medium');
    setDeadline('');
    setCategory('Personal');
  }

  // TOGGLE
  function toggleTodo(id: string) {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  }

  // DELETE
  function deleteTodo(id: string) {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }

  // EDIT
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

  // STATS
  const stats = useMemo(() => {
    const total = todos.length;
    const done = todos.filter((t) => t.done).length;
    const active = total - done;
    const overdue = todos.filter((t) => !t.done && isOverdue(t.deadline)).length;
    const percent = total === 0 ? 0 : Math.round((done / total) * 100);

    return { total, done, active, overdue, percent };
  }, [todos]);

  // WEEKLY STATISTICS
  const weekDays = useMemo(() => getWeekDays(new Date()), []);

  const weeklyStats = useMemo(() => {
    return weekDays.map((day) => {
      const iso = toISO(day);
      const dayTodos = todos.filter((t) => t.createdAt && toISO(new Date(t.createdAt)) === iso);
      const completed = dayTodos.filter((t) => t.done).length;

      return {
        date: iso,
        label: day.toLocaleDateString('id-ID', { weekday: 'short' }),
        total: dayTodos.length,
        done: completed,
      };
    });
  }, [todos, weekDays]);

  const maxWeekly = Math.max(...weeklyStats.map((d) => d.total), 1);

  // CALENDAR
  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

    const start = new Date(year, month, 1 - startDay);

    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [calendarMonth]);

  const calendarMonthLabel = calendarMonth.toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric',
  });

  const prevMonth = () => {
    setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const goToday = () => {
    const today = new Date();
    setCalendarMonth(today);
    setSelectedDate(toISO(today));
  };

  // FILTER TASKS
  const visibleTodos = useMemo(() => {
    const q = query.trim().toLowerCase();

    return todos
      .filter((t) => {
        if (filter === 'active' && t.done) return false;
        if (filter === 'done' && !t.done) return false;
        if (selectedCategory !== 'all' && t.category !== selectedCategory)
          return false;
        if (selectedDate && t.deadline !== selectedDate) return false;
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
  }, [todos, filter, selectedCategory, selectedDate, query]);

  const todayISO = toISO(new Date());

  return (
    <div className="min-h-screen bg-[#f5f8fc] text-slate-800">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* HEADER */}
        <header className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600">
              <LayoutDashboard className="h-4 w-4" />
              Workspace
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              My Tasks
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Organize your day. Focus on what matters.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Hari ini</p>
              <p className="text-sm font-semibold text-slate-700">
                {new Date().toLocaleDateString('id-ID', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
        </header>

        {/* TOP DASHBOARD */}
        <section className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-3">

          {/* PROGRESS */}
          <div className="rounded-2xl bg-blue-600 p-6 text-white shadow-sm lg:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-100">Your progress</p>
                <h2 className="mt-2 text-3xl font-bold">{stats.percent}%</h2>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
                <BarChart3 className="h-6 w-6" />
              </div>
            </div>

            <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-blue-400/50">
              <div
                className="h-full rounded-full bg-white transition-all duration-700"
                style={{ width: `${stats.percent}%` }}
              />
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-blue-100">
              <span>{stats.done} tugas selesai</span>
              <span>{stats.total} total tugas</span>
            </div>

            <div className="mt-5 border-t border-blue-500 pt-4">
              <p className="text-sm font-medium">
                {stats.percent === 100 && stats.total > 0
                  ? 'Semua tugas selesai. Kerja bagus!'
                  : stats.done > 0
                  ? 'Progress kamu berjalan baik!'
                  : 'Mulai langkah produktif hari ini!'}
              </p>
            </div>
          </div>

          {/* STATS CARDS */}
          <div className="grid grid-cols-2 gap-4 lg:col-span-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <ListTodo className="h-5 w-5" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-300" />
              </div>
              <p className="mt-4 text-2xl font-bold text-slate-800">{stats.total}</p>
              <p className="mt-1 text-sm text-slate-500">Total tugas</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                  <Clock3 className="h-5 w-5" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-300" />
              </div>
              <p className="mt-4 text-2xl font-bold text-slate-800">{stats.active}</p>
              <p className="mt-1 text-sm text-slate-500">Tugas aktif</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <CircleCheck className="h-5 w-5" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-300" />
              </div>
              <p className="mt-4 text-2xl font-bold text-slate-800">{stats.done}</p>
              <p className="mt-1 text-sm text-slate-500">Tugas selesai</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                  <Calendar className="h-5 w-5" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-300" />
              </div>
              <p className="mt-4 text-2xl font-bold text-slate-800">{stats.overdue}</p>
              <p className="mt-1 text-sm text-slate-500">Terlambat</p>
            </div>
          </div>
        </section>

        {/* WEEKLY CHART */}
        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800">Weekly activity</h3>
              <p className="mt-1 text-xs text-slate-400">
                Aktivitas tugas yang dibuat minggu ini
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-blue-600">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
              Tugas
            </div>
          </div>

          <div className="flex h-44 items-end justify-between gap-2 sm:gap-5">
            {weeklyStats.map((day) => {
              const isToday = day.date === todayISO;
              const height = day.total === 0 ? 4 : (day.total / maxWeekly) * 100;

              return (
                <div
                  key={day.date}
                  className="flex h-full flex-1 flex-col items-center justify-end gap-3"
                >
                  <div className="flex w-full flex-1 items-end justify-center">
                    <div
                      className={`relative w-full max-w-[42px] rounded-t-lg transition-all duration-500 ${
                        isToday ? 'bg-blue-600' : 'bg-blue-100 hover:bg-blue-200'
                      }`}
                      style={{
                        height: `${Math.max(height, 4)}%`,
                        minHeight: '4px',
                      }}
                      title={`${day.total} tugas`}
                    >
                      {day.total > 0 && (
                        <span
                          className={`absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-semibold ${
                            isToday ? 'text-blue-600' : 'text-slate-500'
                          }`}
                        >
                          {day.total}
                        </span>
                      )}
                    </div>
                  </div>

                  <span
                    className={`text-xs ${
                      isToday
                        ? 'font-bold text-blue-600'
                        : 'font-medium text-slate-400'
                    }`}
                  >
                    {day.label}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* MAIN CONTENT */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

          {/* TASKS */}
          <div className="space-y-6 xl:col-span-2">

            {/* ADD TASK */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5">
                <h3 className="font-bold text-slate-800">Tambah tugas</h3>
                <p className="mt-1 text-xs text-slate-400">
                  Tambahkan tugas baru ke workspace kamu.
                </p>
              </div>

              <form onSubmit={addTodo} className="space-y-4">
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Apa yang ingin kamu kerjakan?"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
                />

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-500">
                      Kategori
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as Category)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-500">
                      Prioritas
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as Priority)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                    >
                      <option value="high">Tinggi</option>
                      <option value="medium">Sedang</option>
                      <option value="low">Rendah</option>
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
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-600 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!text.trim()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
                >
                  <Plus className="h-4 w-4" />
                  Tambah tugas
                </button>
              </form>
            </section>

            {/* TASK LIST */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5">
                <h3 className="font-bold text-slate-800">Task board</h3>
                <p className="mt-1 text-xs text-slate-400">
                  Kelola dan pantau semua pekerjaanmu.
                </p>
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
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  />
                  {query && (
                    <button
                      onClick={() => setQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* FILTER */}
              <div className="mb-4 flex flex-wrap items-center gap-2">
                {(['all', 'active', 'done'] as Filter[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                      filter === f
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {f === 'all' ? 'Semua' : f === 'active' ? 'Aktif' : 'Selesai'}
                  </button>
                ))}
              </div>

              {/* CATEGORY FILTER */}
              <div className="mb-5 flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                    selectedCategory === 'all'
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  Semua kategori
                </button>

                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedCategory(c)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                      selectedCategory === c
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>

              {/* DATE FILTER INFO */}
              {selectedDate && (
                <div className="mb-4 flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50 px-3 py-2.5">
                  <span className="text-xs font-medium text-blue-700">
                    Deadline: {formatDate(selectedDate)}
                  </span>
                  <button
                    onClick={() => setSelectedDate('')}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                  >
                    <X className="h-3.5 w-3.5" />
                    Reset
                  </button>
                </div>
              )}

              {/* TASKS */}
              <ul className="flex flex-col gap-3">
                {visibleTodos.length === 0 && (
                  <li className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-12 text-center">
                    <ClipboardList className="mx-auto mb-3 h-8 w-8 text-slate-300" />
                    <p className="text-sm font-semibold text-slate-600">
                      Belum ada tugas
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Coba ubah filter atau tambahkan tugas baru.
                    </p>
                  </li>
                )}

                {visibleTodos.map((todo) => {
                  const p = PRIORITY_CONFIG[todo.priority];
                  const c = CATEGORY_CONFIG[todo.category || 'Personal'];
                  const CategoryIcon = c.icon;
                  const overdue = !todo.done && isOverdue(todo.deadline);
                  const isEditing = editingId === todo.id;

                  return (
                    <li
                      key={todo.id}
                      className={`group flex items-start gap-3 rounded-xl border p-4 transition hover:shadow-sm ${
                        todo.done
                          ? 'border-slate-100 bg-slate-50'
                          : 'border-slate-200 bg-white hover:border-blue-200'
                      }`}
                    >
                      <button
                        onClick={() => toggleTodo(todo.id)}
                        aria-label={todo.done ? 'Tandai belum selesai' : 'Tandai selesai'}
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
                          todo.done
                            ? 'border-blue-600 bg-blue-600 text-white'
                            : 'border-slate-300 hover:border-blue-500'
                        }`}
                      >
                        {todo.done && <Check className="h-3 w-3" strokeWidth={3} />}
                      </button>

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
                              className="min-w-0 flex-1 rounded-lg border border-blue-300 px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-blue-50"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => saveEdit(todo.id)}
                                className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white"
                              >
                                Simpan
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600"
                              >
                                Batal
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p
                              className={`break-words text-sm font-medium ${
                                todo.done
                                  ? 'text-slate-400 line-through'
                                  : 'text-slate-700'
                              }`}
                            >
                              {todo.text}
                            </p>

                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              <span
                                className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-semibold ${c.color}`}
                              >
                                <CategoryIcon className="h-3 w-3" />
                                {c.label}
                              </span>

                              <span
                                className={`rounded-lg border px-2 py-1 text-[10px] font-semibold ${p.color}`}
                              >
                                {p.label}
                              </span>

                              {todo.deadline && (
                                <span
                                  className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-medium ${
                                    overdue
                                      ? 'border-red-100 bg-red-50 text-red-600'
                                      : 'border-slate-100 bg-slate-50 text-slate-500'
                                  }`}
                                >
                                  <Calendar className="h-3 w-3" />
                                  {formatDate(todo.deadline)}
                                  {overdue && ' · Terlambat'}
                                </span>
                              )}
                            </div>
                          </>
                        )}
                      </div>

                      {!isEditing && (
                        <div className="flex shrink-0 gap-1 sm:opacity-0 sm:transition sm:group-hover:opacity-100">
                          <button
                            onClick={() => startEdit(todo)}
                            aria-label="Edit"
                            className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => deleteTodo(todo.id)}
                            aria-label="Hapus"
                            className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>

              {/* FOOTER */}
              {stats.done > 0 && (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={clearDone}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Hapus tugas selesai
                  </button>
                </div>
              )}
            </section>
          </div>

          {/* RIGHT SIDEBAR */}
          <aside className="space-y-6">

            {/* CALENDAR */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="font-bold text-slate-800">Calendar</h3>
                <button
                  onClick={goToday}
                  className="rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-100"
                >
                  Hari ini
                </button>
              </div>

              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-700">
                  {calendarMonthLabel}
                </p>

                <div className="flex gap-1">
                  <button
                    onClick={prevMonth}
                    aria-label="Bulan sebelumnya"
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={nextMonth}
                    aria-label="Bulan berikutnya"
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* WEEK LABELS */}
              <div className="mb-2 grid grid-cols-7 text-center">
                {['S', 'S', 'R', 'K', 'J', 'S', 'M'].map((day, i) => (
                  <span
                    key={i}
                    className="py-2 text-[10px] font-semibold text-slate-400"
                  >
                    {day}
                  </span>
                ))}
              </div>

              {/* DAYS */}
              <div className="grid grid-cols-7 gap-y-1">
                {calendarDays.map((day, i) => {
                  const iso = toISO(day);
                  const isCurrentMonth =
                    day.getMonth() === calendarMonth.getMonth();
                  const isToday = iso === todayISO;
                  const isSelected = iso === selectedDate;

                  const dayTodos = todos.filter((t) => t.deadline === iso);
                  const hasTask = dayTodos.length > 0;
                  const hasActive = dayTodos.some((t) => !t.done);
                  const hasDone = dayTodos.some((t) => t.done);

                  return (
                    <button
                      key={i}
                      onClick={() =>
                        setSelectedDate((prev) => (prev === iso ? '' : iso))
                      }
                      title={`${iso}${hasTask ? ` · ${dayTodos.length} tugas` : ''}`}
                      className={`relative flex h-10 flex-col items-center justify-center rounded-lg text-xs transition ${
                        isSelected
                          ? 'bg-blue-600 font-bold text-white'
                          : isToday
                          ? 'bg-blue-50 font-bold text-blue-600'
                          : isCurrentMonth
                          ? 'text-slate-700 hover:bg-slate-100'
                          : 'text-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <span>{day.getDate()}</span>

                      {hasTask && (
                        <span className="absolute bottom-1 flex gap-0.5">
                          {hasActive && (
                            <span
                              className={`h-1 w-1 rounded-full ${
                                isSelected ? 'bg-white' : 'bg-blue-500'
                              }`}
                            />
                          )}
                          {hasDone && (
                            <span
                              className={`h-1 w-1 rounded-full ${
                                isSelected ? 'bg-blue-200' : 'bg-emerald-400'
                              }`}
                            />
                          )}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 flex items-center gap-4 border-t border-slate-100 pt-3">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  <span className="text-[10px] text-slate-400">Aktif</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span className="text-[10px] text-slate-400">Selesai</span>
                </div>
              </div>

              <p className="mt-3 text-[11px] leading-relaxed text-slate-400">
                Klik tanggal untuk melihat tugas berdasarkan deadline.
              </p>
            </section>

            {/* CATEGORY OVERVIEW */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5">
                <h3 className="font-bold text-slate-800">Categories</h3>
                <p className="mt-1 text-xs text-slate-400">
                  Ringkasan berdasarkan kategori
                </p>
              </div>

              <div className="space-y-4">
                {CATEGORIES.map((c) => {
                  const cfg = CATEGORY_CONFIG[c];
                  const Icon = cfg.icon;
                  const categoryTodos = todos.filter((t) => t.category === c);
                  const completed = categoryTodos.filter((t) => t.done).length;
                  const total = categoryTodos.length;
                  const percentage =
                    total === 0 ? 0 : Math.round((completed / total) * 100);

                  return (
                    <button
                      key={c}
                      onClick={() =>
                        setSelectedCategory((prev) => (prev === c ? 'all' : c))
                      }
                      className={`w-full rounded-xl border p-3 text-left transition ${
                        selectedCategory === c
                          ? 'border-blue-200 bg-blue-50/50'
                          : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`flex h-9 w-9 items-center justify-center rounded-lg border ${cfg.color}`}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-700">
                              {c}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {total} tugas
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-slate-500">
                          {percentage}%
                        </span>
                      </div>

                      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-blue-600 transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* MINI INFO */}
            <section className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
                  <ClipboardList className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-blue-800">
                    Stay organized
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-blue-600">
                    Pecah pekerjaan besar menjadi tugas kecil agar lebih mudah
                    diselesaikan.
                  </p>
                </div>
              </div>
            </section>
          </aside>
        </div>

        {/* FOOTER */}
        <footer className="mt-8 flex flex-col items-center justify-center gap-2 text-center">
          <p className="flex items-center gap-1.5 text-xs text-slate-400">
            <Lock className="h-3.5 w-3.5" />
            Data tersimpan otomatis di browser kamu
          </p>
          <p className="text-[11px] text-slate-300">
            Organize · Focus · Complete
          </p>
        </footer>
      </div>
    </div>
  );
}
