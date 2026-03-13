'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

interface HeaderProps {
  displayName: string
  role: string
}

export function DashboardHeader({ displayName, role }: HeaderProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-zinc-200 px-6 py-2.5">
      <div className="flex items-center justify-between">
        <div className="lg:hidden w-10" />
        <div className="flex-1" />
        <div className="flex items-center gap-3">
          <div className="text-right mr-1">
            <p className="text-sm font-medium text-zinc-900 leading-tight">{displayName}</p>
            <span className="inline-block mt-0.5 text-[11px] font-medium text-zinc-500 capitalize bg-zinc-100 px-2 py-0.5 rounded-full">
              {role}
            </span>
          </div>
          <div className="w-px h-6 bg-zinc-200" />
          <button
            onClick={handleSignOut}
            className="p-2 text-zinc-400 hover:text-zinc-600 rounded-lg hover:bg-zinc-100 transition-colors duration-100"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
