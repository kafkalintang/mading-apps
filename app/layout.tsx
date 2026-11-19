// app/layout.tsx
import Sidebar from "./components/Sidebar";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex h-screen">
        {/* Sidebar selalu di kiri */}
        <Sidebar /> 
        {/* Konten berubah sesuai URL */}
        <main className="flex-1 overflow-auto">{children}</main>
      </body>
    </html>
  );
}