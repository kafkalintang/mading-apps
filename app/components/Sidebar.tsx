'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const menus = [
    { name: 'Papan Utama', href: '/' },
    { name: 'Catatan Saya', href: '/catatan-saya' },
    { name: 'Pengaturan', href: '/pengaturan' },
  ];

  return (
    // Tambahkan bg-white dan text-gray-800 di sini
    <aside className="w-64 bg-white border-r border-gray-200 h-screen p-4 flex flex-col gap-2 text-gray-800">
      <h1 className="text-2xl font-bold text-blue-700 mb-6 px-2">Mading Kita</h1>
      
      {menus.map((menu) => {
        const isActive = pathname === menu.href;

        return (
          <Link
            key={menu.href}
            href={menu.href}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
              isActive
                ? 'bg-blue-50 text-blue-700 font-medium'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span>{menu.name}</span>
          </Link>
        );
      })}
    </aside>
  );
}