// app/utils/storage.ts
export interface Note {
  id: number;
  text: string;
  color: string;
}

export const getNotes = (): Note[] => {
  if (typeof window === "undefined") return [];
  const saved = localStorage.getItem("mading-notes");
  return saved ? JSON.parse(saved) : [];
};

export const saveNotes = (notes: Note[]) => {
  localStorage.setItem("mading-notes", JSON.stringify(notes));
};