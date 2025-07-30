// src/components/Sidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { sidebarRoutes } from '@/constants/sidebarRoutes'
import { ChevronLeft, ChevronRight, LogOut } from 'lucide-react'; // Importe os ícones necessários
import { useState } from 'react'; // Importe useState
import { signOut } from 'next-auth/react'; // Se o botão de sair for parte da sidebar

export default function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false); // Adicione o estado de colapsar

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <aside className={`bg-neutral-900 text-white min-h-screen p-6 transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="mb-6 flex items-center text-sm hover:text-indigo-400"
      >
        {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        {!collapsed && <span className="ml-2">Esconder Menu</span>}
      </button>

      <nav className="flex flex-col gap-4">
        {sidebarRoutes.map((route) => {
          const isActive = pathname.startsWith(route.href)
          const Icon = route.icon

          return (
            <Link
              key={route.href}
              href={route.href}
              passHref
              className={`flex items-center gap-3 px-4 py-2 rounded-md transition-all
                ${isActive ? 'bg-blue-700 text-white font-semibold' : 'hover:bg-neutral-800'}`}
            >
              <span className="flex items-center justify-center w-5 h-5 shrink-0">
                {Icon ? <Icon className="w-5 h-5 inline-block" /> : <span className="text-white">🔧</span>}
              </span>
              {!collapsed && <span className="whitespace-nowrap">{route.label}</span>} {/* Oculta o texto se colapsado */}
            </Link>
          )
        })}

        {/* Botão Sair dentro da Sidebar */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-red-800 transition-all"
        >
          <span className="text-xl shrink-0">↩</span> {/* Adicionado shrink-0 para evitar encolher */}
          {!collapsed && <span className="whitespace-nowrap">Sair</span>} {/* Oculta o texto se colapsado */}
        </button>
      </nav>
    </aside>
  )
}