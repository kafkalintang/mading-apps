import { Pin } from 'lucide-react';

interface NoteCardProps {
  text: string;
  color: string;
}

export default function NoteCard({ text, color }: NoteCardProps) {
  return (
    <div className={`relative p-6 ${color} rounded-sm shadow-md transform transition-transform hover:-translate-y-1 hover:shadow-xl break-inside-avoid`}>
      
      {/* Pin / Paku di atas kertas */}
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center justify-center">
        <Pin className="w-8 h-8 text-red-500 fill-red-500 drop-shadow-md rotate-12" />
      </div>

      <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap font-medium mt-2">
        {text}
      </p>
    </div>
  );
}