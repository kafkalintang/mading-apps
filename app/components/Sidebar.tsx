import { LayoutDashboard, StickyNote, Settings } from 'lucide-react';

// Tambahkan tipe data untuk props
interface SidebarProps {
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
}

export default function Sidebar({ activeMenu, setActiveMenu }: SidebarProps) {
  
  // Fungsi helper biar class-nya dinamis
  const getButtonClass = (menuId: string) => {
    return activeMenu === menuId
      ? "text-left px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium flex items-center gap-3 transition-colors"
      : "text-left px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg flex items-center gap-3 transition-colors";
  };

  return (
    <aside className="w-64 bg-white shadow-lg p-6 flex flex-col gap-6 hidden md:flex border-r border-gray-200 h-screen sticky top-0">
      <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
        <LayoutDashboard className="w-6 h-6 text-blue-600" />
        Mading Kita
      </h1>
      <nav className="flex flex-col gap-2">
        <button 
          onClick={() => setActiveMenu('papan-utama')}
          className={getButtonClass('papan-utama')}
        >
          <LayoutDashboard className="w-4 h-4" /> Papan Utama
        </button>
        <button 
          onClick={() => setActiveMenu('catatan-saya')}
          className={getButtonClass('catatan-saya')}
        >
          <StickyNote className="w-4 h-4" /> Catatan Saya
        </button>
        <button 
          onClick={() => setActiveMenu('pengaturan')}
          className={getButtonClass('pengaturan')}
        >
          <Settings className="w-4 h-4" /> Pengaturan
        </button>
      </nav>
    </aside>
  );
}