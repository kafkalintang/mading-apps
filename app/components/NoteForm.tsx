import { useState, FormEvent } from 'react';
import { Pin, Plus, Palette } from 'lucide-react';

interface NoteFormProps {
  onAddNote: (text: string, color: string) => void;
}

export default function NoteForm({ onAddNote }: NoteFormProps) {
  const [text, setText] = useState('');
  const [selectedColor, setSelectedColor] = useState('bg-yellow-100');

  const colorOptions = [
    { name: 'Kuning', value: 'bg-yellow-100' },
    { name: 'Pink', value: 'bg-pink-100' },
    { name: 'Biru', value: 'bg-blue-100' },
    { name: 'Hijau', value: 'bg-green-100' },
    { name: 'Putih', value: 'bg-white' },
  ];

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onAddNote(text, selectedColor);
    setText('');
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
      <h2 className="text-lg font-semibold mb-4 text-gray-700 flex items-center gap-2">
        <Pin className="w-5 h-5 text-red-500" />
        Buat Catatan Baru
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Tulis sesuatu yang memotivasi..."
          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none h-24 text-gray-800"
        />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Palette className="w-4 h-4 text-gray-500" />
            <div className="flex items-center gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setSelectedColor(color.value)}
                  className={`w-8 h-8 rounded-full border-2 ${color.value} ${selectedColor === color.value ? 'border-gray-800 scale-110' : 'border-gray-200'} transition-all`}
                  title={color.name}
                />
              ))}
            </div>
          </div>
          <button 
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-medium transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Tempel Catatan
          </button>
        </div>
      </form>
    </div>
  );
}