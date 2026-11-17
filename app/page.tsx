'use client';

import { useState } from 'react';
import Sidebar from './components/Sidebar';
import NoteForm from './components/NoteForm';
import MadingBoard from './components/MadingBoard';

export interface Note {
  id: number;
  text: string;
  color: string;
}

export default function MadingApp() {
  // State untuk menu sidebar
  const [activeMenu, setActiveMenu] = useState('papan-utama'); 
  
  const [notes, setNotes] = useState<Note[]>([
    { id: 1, text: "ITB bukan hanya universitas — itu adalah awal dari cerita hidupmu yang luar biasa", color: "bg-yellow-100" },
    { id: 2, text: "Setiap malam begadang sekarang adalah satu langkah lebih dekat ke toga ITB. Tetap semangat!", color: "bg-pink-100" },
    { id: 3, text: "Alumni ITB ada di puncak BUMN, startup unicorn, NASA, dan ruang sidang DPR. Siapa tahu kamu berikutnya?", color: "bg-blue-100" },
    { id: 4, text: "Di ITB, kamu bukan hanya belajar ilmu — kamu belajar cara berpikir seperti pemimpin masa depan", color: "bg-green-100" },
    { id: 5, text: "Ganesha 10 bukan hanya alamat. Itu adalah rumah kedua bagi mereka yang berani bermimpi besar", color: "bg-red-50" },
  ]);

  const handleAddNote = (text: string, color: string) => {
    const newNote: Note = {
      id: Date.now(),
      text,
      color,
    };
    setNotes([...notes, newNote]);
  };

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      {/* Kirim state activeMenu dan fungsi setter ke Sidebar */}
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      
      <main className="flex-1 p-8 flex flex-col gap-8 overflow-y-auto h-screen">
        
        {/* TAMPILAN PAPAN UTAMA */}
        {activeMenu === 'papan-utama' && (
          <>
            {/* Form kita bungkus dalam div terpisah */}
            <div className="w-full">
              <NoteForm onAddNote={handleAddNote} />
            </div>
            
            {/* Mading dipisah dengan garis atau jarak (gap-8 di parent sudah handle) */}
            <div className="w-full">
              <MadingBoard notes={notes} />
            </div>
          </>
        )}

        {/* TAMPILAN CATATAN SAYA */}
        {activeMenu === 'catatan-saya' && (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 text-center flex flex-col items-center justify-center h-64 text-gray-500">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Catatan Saya</h2>
            <p>Halaman ini masih kosong. (Nanti kamu bisa nampilin list catatan di sini).</p>
          </div>
        )}

        {/* TAMPILAN PENGATURAN */}
        {activeMenu === 'pengaturan' && (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 text-center flex flex-col items-center justify-center h-64 text-gray-500">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Pengaturan</h2>
            <p>Halaman pengaturan belum dibuat. (Bisa buat atur tema atau profil).</p>
          </div>
        )}

      </main>
    </div>
  );
}