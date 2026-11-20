'use client';

import { useState, useEffect } from 'react';
import MadingBoard from './components/MadingBoard';
import { getNotes, Note } from './utils/storage';

export default function PapanUtamaPage() {
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    setNotes(getNotes());
  }, []);

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Judul Papan Utama dikembalikan di sini */}
      <div className="flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
        <h1 className="text-xl font-bold text-gray-800">Papan Utama</h1>
      </div>
      
      <div className="w-full">
        <MadingBoard notes={notes} />
      </div>
    </div>
  );
}