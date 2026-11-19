'use client';

import { useState, useEffect } from 'react';
import MadingBoard from './components/MadingBoard';
import { getNotes, Note } from './utils/storage';

export default function PapanUtamaPage() {
  const [notes, setNotes] = useState<Note[]>([]);

  // Ambil data dari localStorage saat halaman dibuka
  useEffect(() => {
    setNotes(getNotes());
  }, []);

  return (
    <div className="w-full flex flex-col gap-8">
      {/* Form NoteForm dihapus dari sini */}
      
      <div className="w-full">
        <MadingBoard notes={notes} />
      </div>
    </div>
  );
}