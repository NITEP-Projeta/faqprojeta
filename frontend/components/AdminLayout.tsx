// frontend/components/AdminLayout.tsx
'use client';

import { ReactNode } from 'react';
import { Sidebar } from 'lucide-react';

interface AdminLayoutProps {
  title?: string;
  children: ReactNode;
}

export default function AdminLayout({ title, children }: AdminLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar fixa */}
      <aside className="w-64 bg-white border-r">
        <Sidebar />
      </aside>

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 bg-white border-b">
          <h1 className="text-2xl font-semibold">{title}</h1>
          {/* Aqui você pode colocar botões de ação, seletor de período etc. */}
        </header>

        {/* Área de conteúdo: dashboards, tabelas, formulários… */}
        <main className="p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
