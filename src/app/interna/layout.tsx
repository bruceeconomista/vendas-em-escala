// src/app/interna/layout.tsx
import { ReactNode } from 'react';
import Sidebar from '@/components/Sidebar'; // Importe seu componente Sidebar padrão

export default function InternaLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-900 text-white"> {/* Ou bg-gray-100 como no seu dashboard layout */}
      <Sidebar /> {/* Renderize a Sidebar correta aqui */}
      <main className="flex-1 p-6 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}