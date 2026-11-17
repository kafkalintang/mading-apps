import NoteCard from './NoteCard';
import { LayoutGrid } from 'lucide-react'; // Icon tambahan

interface Note {
  id: number;
  text: string;
  color: string;
}

interface MadingBoardProps {
  notes: Note[];
}

export default function MadingBoard({ notes }: MadingBoardProps) {
  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Judul Section Papan */}
      <div className="flex items-center gap-2 text-gray-700 font-bold px-2">
        <LayoutGrid className="w-5 h-5" />
        <h2>Papan Utama</h2>
      </div>

      <div className="bg-[#d4b895] p-6 rounded-2xl shadow-inner min-h-[500px] border-4 border-[#c3a47b]">
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
          {notes.map((note) => (
            <NoteCard key={note.id} text={note.text} color={note.color} />
          ))}
        </div>
      </div>
    </div>
  );
}