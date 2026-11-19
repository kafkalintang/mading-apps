'use client';

import { useState, useEffect } from 'react';
import NoteForm from '../components/NoteForm';
import { getNotes, saveNotes, Note } from '../utils/storage';

export default function CatatanSayaPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  
  // State untuk mengatur munculnya form melayang (overlay)
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    setNotes(getNotes());
  }, []);

  // --- FUNGSI CRUD ---

  // Tambah Catatan
  const handleAddNote = (text: string, color: string) => {
    const newNote: Note = {
      id: Date.now(),
      text,
      color,
    };

    const updatedNotes = [...notes, newNote];
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
    setShowForm(false); // Tutup form setelah simpan
  };

  // Mulai Edit
  const startEdit = (note: Note) => {
    setEditingId(note.id);
    setEditText(note.text);
  };

  // Simpan Edit
  const saveEdit = (id: number) => {
    if (!editText.trim()) return;

    const updatedNotes = notes.map((note) =>
      note.id === id ? { ...note, text: editText.trim() } : note
    );

    setNotes(updatedNotes);
    saveNotes(updatedNotes);
    setEditingId(null);
    setEditText('');
  };

  // Batal Edit
  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  // Hapus Catatan
  const handleDeleteNote = (id: number) => {
    const confirmDelete = window.confirm(
      'Apakah kamu yakin ingin menghapus catatan ini?'
    );

    if (!confirmDelete) return;

    const updatedNotes = notes.filter((note) => note.id !== id);
    setNotes(updatedNotes);
    saveNotes(updatedNotes);

    if (editingId === id) {
      cancelEdit();
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 relative">
      
      {/* HEADER DAN TOMBOL TAMBAH */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Catatan Saya
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola dan simpan catatan pribadi kamu.
          </p>
        </div>

        <button
          onClick={() => {
            setShowForm(true);
            cancelEdit();
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Buat Catatan
        </button>
      </div>

      {/* FORM OVERLAY (MENIMPA DI ATAS) */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden transform transition-all">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">Buat Catatan Baru</h2>
              <button 
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-5">
              <NoteForm onAddNote={handleAddNote} />
            </div>
          </div>
        </div>
      )}

      {/* TABEL DAFTAR CATATAN */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
                <th className="p-4 font-semibold w-16 text-center">No</th>
                <th className="p-4 font-semibold">Isi Catatan</th>
                <th className="p-4 font-semibold text-center w-24">Warna</th>
                <th className="p-4 font-semibold text-center w-48">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {notes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-10 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Belum ada catatan. Yuk buat catatan baru!
                    </div>
                  </td>
                </tr>
              ) : (
                notes.map((note, index) => (
                  <tr key={note.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-gray-500 text-center">
                      {index + 1}
                    </td>

                    <td className="p-4 min-w-[250px]">
                      {editingId === note.id ? (
                        <input
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full p-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          autoFocus
                        />
                      ) : (
                        <span className="text-gray-800 whitespace-pre-wrap text-sm">
                          {note.text}
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-center">
                      <span className={`inline-block w-6 h-6 rounded-full border border-gray-300 shadow-sm ${note.color}`} />
                    </td>

                    {/* AKSI: EDIT DAN HAPUS SEJAJAR (SAMPING-SAMPINGAN) */}
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        {editingId === note.id ? (
                          <>
                            <button
                              onClick={() => saveEdit(note.id)}
                              disabled={!editText.trim()}
                              className="flex items-center gap-1 text-sm bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600 disabled:opacity-50"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Simpan
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="flex items-center gap-1 text-sm bg-gray-400 text-white px-3 py-1.5 rounded-lg hover:bg-gray-500"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Batal
                            </button>
                          </>
                        ) : (
                          <>
                            {/* Tombol Edit */}
                            <button
                              onClick={() => startEdit(note)}
                              className="flex items-center gap-1 text-sm bg-blue-500 text-white px-3 py-1.5 rounded-lg hover:bg-blue-600"
                              title="Edit"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit
                            </button>

                            {/* Tombol Hapus */}
                            <button
                              onClick={() => handleDeleteNote(note.id)}
                              className="flex items-center gap-1 text-sm bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600"
                              title="Hapus"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Hapus
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}