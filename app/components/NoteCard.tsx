'use client';

import { Note } from '../utils/storage';

interface NoteCardProps {
  note: Note;
}

export default function NoteCard({ note }: NoteCardProps) {
  // PENGAMAN: Jika note undefined, jangan render apa-apa
  if (!note) return null;

  return (
    <div 
      className={`
        relative p-6 pt-9 rounded-sm shadow-md ${note.color || 'bg-yellow-100'} 
        transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:rotate-1
      `}
    >
      
      {/* === EFEK PIN 3D MURNI CSS === */}
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
        <div className="relative flex flex-col items-center">
          
          {/* Kepala Pin (Bulat Merah 3D) */}
          <div 
            className="
              w-6 h-6 rounded-full z-20 relative
              bg-gradient-to-br from-red-400 via-red-600 to-red-800
              shadow-[0_4px_6px_rgba(0,0,0,0.4),inset_-2px_-2px_4px_rgba(0,0,0,0.4),inset_2px_2px_4px_rgba(255,255,255,0.5)]
              border border-red-900
            "
          >
            {/* Titik Kilau (Highlight) */}
            <div className="absolute top-1 left-1.5 w-1.5 h-1.5 bg-white rounded-full opacity-90"></div>
          </div>

          {/* Jarum Pin (Besi) */}
          <div 
            className="
              w-[3px] h-3.5 -mt-1 z-10
              bg-gradient-to-b from-gray-300 via-gray-500 to-gray-700
              shadow-sm
            "
          ></div>

          {/* Bayangan Jarum di Kertas */}
          <div className="absolute top-[24px] w-4 h-1 bg-black/30 rounded-full blur-[1.5px]"></div>
        </div>
      </div>
      {/* ================================ */}

      {/* Isi Catatan */}
      <p className="text-gray-800 text-sm leading-relaxed break-words whitespace-pre-wrap">
        {note.text}
      </p>
    </div>
  );
}