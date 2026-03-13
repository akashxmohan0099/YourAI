'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ScheduleViewProps {
  initialAppointments: any[]
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function ScheduleView({ initialAppointments }: ScheduleViewProps) {
  const [weekOffset, setWeekOffset] = useState(0)

  const today = new Date()
  const currentWeekStart = new Date(today)
  currentWeekStart.setDate(today.getDate() - today.getDay() + weekOffset * 7)

  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(currentWeekStart)
    date.setDate(currentWeekStart.getDate() + i)
    return date
  })

  const getAppointmentsForDay = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return initialAppointments.filter(
      (a: any) => a.starts_at.startsWith(dateStr) && a.status !== 'cancelled'
    )
  }

  const isToday = (date: Date) => {
    const todayStr = today.toISOString().split('T')[0]
    return date.toISOString().split('T')[0] === todayStr
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">This Week</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekOffset(weekOffset - 1)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setWeekOffset(0)}
            className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
          >
            Today
          </button>
          <button
            onClick={() => setWeekOffset(weekOffset + 1)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 divide-x divide-gray-100">
        {days.map((date, i) => {
          const dayAppts = getAppointmentsForDay(date)
          return (
            <div key={i} className="min-h-[150px]">
              <div
                className={`px-2 py-2 text-center border-b border-gray-100 ${
                  isToday(date) ? 'bg-blue-50' : ''
                }`}
              >
                <p className="text-xs text-gray-500">{DAYS[i]}</p>
                <p
                  className={`text-sm font-semibold ${
                    isToday(date) ? 'text-blue-600' : 'text-gray-900'
                  }`}
                >
                  {date.getDate()}
                </p>
              </div>
              <div className="p-1 space-y-1">
                {dayAppts.map((apt: any) => (
                  <div
                    key={apt.id}
                    className="px-1.5 py-1 bg-blue-50 rounded text-xs border border-blue-100"
                  >
                    <p className="font-medium text-blue-800 truncate">
                      {new Date(apt.starts_at).toLocaleTimeString([], {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </p>
                    <p className="text-blue-600 truncate">{apt.title}</p>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
