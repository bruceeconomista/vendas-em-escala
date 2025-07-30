// src/app/dashboard/layout.tsx
import { ReactNode } from 'react'
import Sidebar from '@/components/Sidebar'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-900 text-white">
      <Sidebar />
      <main className="flex-1 p-6 overflow-auto">
        <div className="w-full px-8 space-y-6">
          {children}
        </div>
      </main>
    </div>
  )
}

