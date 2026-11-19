'use client';

import { useState } from 'react';
import NoteForm from './components/NoteForm';
import MadingBoard from './components/MadingBoard';

export interface Note {
  id: number;
  text: string;
  color: string;
}

export default function PapanUtamaPage() {
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
    <div className="w-full flex flex-col gap-8">
      {/* Form Catatan Baru */}
      <div className="w-full">
        <NoteForm onAddNote={handleAddNote} />
      </div>
      
      {/* Mading Board */}
      <div className="w-full">
        <MadingBoard notes={notes} />
      </div>
    </div>
  );
}