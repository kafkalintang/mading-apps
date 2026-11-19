'use client';

import { useState, useEffect } from 'react';
import NoteForm from '../components/NoteForm';
import { getNotes, saveNotes, Note } from '../utils/storage';

export default function CatatanSayaPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    setNotes(getNotes());
  }, []);

  // Fungsi Tambah Data
  const handleAddNote = (text: string, color: string) => {
    const newNote: Note = { id: Date.now(), text, color };
    const updatedNotes = [...notes, newNote];
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
  };

  // Fungsi Mulai Edit
  const startEdit = (note: Note) => {
    setEditingId(note.id);
    setEditText(note.text);
  };

  // Fungsi Simpan Edit
  const saveEdit = (id: number) => {
    const updatedNotes = notes.map((note) =>
      note.id === id ? { ...note, text: editText } : note
    );
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
    setEditingId(null); // Tutup mode edit
  };

  return (
    <div className="w-full flex flex-col gap-8">
      
      {/* 1. FORM TAMBAH CATATAN */}
      <div className="w-full">
        <NoteForm onAddNote={handleAddNote} />
      </div>

      {/* 2. TABEL DAFTAR CATATAN */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800">Daftar Catatan Saya</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white text-gray-600 text-sm border-b">
                <th className="p-4 font-medium">No</th>
                <th className="p-4 font-medium w-full">Isi Catatan</th>
                <th className="p-4 font-medium text-center">Warna</th>
                <th className="p-4 font-medium text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {notes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">
                    Belum ada catatan. Yuk buat!
                  </td>
                </tr>
              ) : (
                notes.map((note, index) => (
                  <tr key={note.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-gray-500">{index + 1}</td>
                    <td className="p-4">
                      {editingId === note.id ? (
                        // Mode Edit: Munculkan Input text
                        <input
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full p-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                        />
                      ) : (
                        // Mode Lihat: Munculkan Teks
                        <span className="text-gray-800">{note.text}</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-block w-6 h-6 rounded-full border ${note.color}`}></span>
                    </td>
                    <td className="p-4 text-center">
                      {editingId === note.id ? (
                        // Tombol Simpan saat mode edit
                        <button
                          onClick={() => saveEdit(note.id)}
                          className="text-sm bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                        >
                          Simpan
                        </button>
                      ) : (
                        // Tombol Edit saat mode lihat
                        <button
                          onClick={() => startEdit(note)}
                          className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                        >
                          Edit
                        </button>
                      )}
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