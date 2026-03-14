'use client'

import { cn } from '@/lib/utils'

interface Tab {
  key: string
  label: string
}

interface TabSwitcherProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (key: string) => void
}

export function TabSwitcher({ tabs, activeTab, onTabChange }: TabSwitcherProps) {
  return (
    <div className="flex flex-wrap gap-1.5 rounded-[22px] border border-[var(--line)] bg-white/40 p-1.5">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={cn(
            'rounded-[18px] px-5 py-2.5 text-sm font-medium transition-all',
            activeTab === tab.key
              ? 'bg-[var(--teal)] text-white shadow-sm'
              : 'text-[var(--ink-soft)] hover:bg-white/60 hover:text-[var(--ink)]'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
