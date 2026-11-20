import NoteCard from './NoteCard';
import { Note } from '../utils/storage';

export default function MadingBoard({ notes }: { notes: Note[] }) {
  return (
    // items-start mencegah kertas ikut melar ke bawah
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6 bg-[#d2b48c] rounded-xl shadow-inner min-h-[500px] items-start content-start">
      
      {notes.length === 0 ? (
        <div className="col-span-full flex flex-col items-center justify-center h-64 text-[#8B6508]">
          <p className="text-lg font-medium">Papan masih kosong...</p>
          <p className="text-sm opacity-80">Yuk buat catatan baru di menu "Catatan Saya"!</p>
        </div>
      ) : (
        notes.map((item) => (
          <NoteCard key={item.id} note={item} />
        ))
      )}

    </div>
  );
}