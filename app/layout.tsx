import './globals.css';
import Sidebar from './components/Sidebar';

export const metadata = {
  title: 'Mading Kita',
  description: 'Aplikasi mading sederhana',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* Tambahkan bg-gray-100 dan text-gray-900 */}
      <body className="flex min-h-screen bg-gray-100 text-gray-900 font-sans">
        <Sidebar />
        
        <main className="flex-1 p-8 overflow-y-auto h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}